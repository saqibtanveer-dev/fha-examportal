import { readFile } from 'node:fs/promises';
import bcrypt from 'bcryptjs';
import { UserRole, type Class, type Section } from '@prisma/client';
import { prisma } from '../src/lib/prisma';
import { readRowsFromWorkbook, type ImportRow } from './importers/excel-reader';
import {
  firstValue,
  parseList,
  resolveSectionId,
  splitName,
  toEmailSafeLocal,
  keyify,
} from './importers/normalizers';

type Args = {
  studentsPath: string;
  familiesPath: string;
  adminEmail: string;
  dryRun: boolean;
  studentsSheet?: string;
  familiesSheet?: string;
  defaultPassword: string;
  studentEmailDomain: string;
  familyEmailDomain: string;
  classMapPath?: string;
  autoCreateClassSection: boolean;
  batchSize: number;
  concurrency: number;
};

type ClassMapEntry = { name: string; grade: number };
type ClassMapConfig = { classes?: Record<string, ClassMapEntry>; sections?: Record<string, string> };

type StudentPrepared = {
  email: string;
  firstName: string;
  lastName: string;
  registrationNo: string;
  rollNumber: string;
  guardianName: string | null;
  guardianPhone: string | null;
  classId: string;
  sectionId: string;
  familyCode: string;
};

type FamilyPrepared = {
  rowNo: number;
  familyCode: string;
  email: string;
  firstName: string;
  lastName: string;
  relationship: string;
  phone: string | null;
  registrationNos: string[];
};

type Reconciliation = {
  studentProfilesForInput: number;
  familyUsersForInput: number;
  familyProfilesForInput: number;
  activeLinksForInput: number;
};

type Stats = {
  studentsTotal: number;
  studentsImported: number;
  studentsFailed: number;
  familiesTotal: number;
  familiesImported: number;
  familiesFailed: number;
  linksCreated: number;
  classesCreated: number;
  sectionsCreated: number;
  warnings: string[];
  batchSize: number;
  concurrency: number;
  reconciliation?: Reconciliation;
};

const DEFAULT_PASSWORD = process.env.IMPORT_DEFAULT_PASSWORD ?? 'ChangeMe123!';

function clampText(value: string, maxLen: number): string {
  if (value.length <= maxLen) return value;
  return value.slice(0, maxLen);
}

function parsePositiveInt(input: string, fallback: number): number {
  const parsed = Number(input);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.floor(parsed);
}

function toCodePart(value: string, fallback: string): string {
  const normalized = value
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-');
  const cleaned = normalized.replace(/^-+|-+$/g, '');
  return cleaned || fallback;
}

function buildStudentEmailLocal(firstName: string, familyCode: string): string {
  const first = toEmailSafeLocal(firstName || 'student');
  const family = toEmailSafeLocal(familyCode || 'unknown');
  return `${first}.${family}`;
}

function chunkArray<T>(items: T[], size: number): T[][] {
  if (size <= 0) return [items];
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size));
  }
  return out;
}

async function runWithConcurrency<T>(items: T[], limit: number, fn: (item: T) => Promise<void>): Promise<void> {
  if (items.length === 0) return;
  const workers = Math.max(1, limit);
  let idx = 0;
  async function worker(): Promise<void> {
    while (idx < items.length) {
      const current = idx;
      idx += 1;
      const item = items[current];
      if (!item) continue;
      await fn(item);
    }
  }
  await Promise.all(Array.from({ length: Math.min(workers, items.length) }, () => worker()));
}

function parseArgs(argv: string[]): Args {
  const get = (flag: string) => {
    const i = argv.indexOf(flag);
    return i !== -1 ? (argv[i + 1] ?? '') : '';
  };

  if (argv.includes('--help') || argv.includes('-h')) {
    console.log('Usage: pnpm import:students-families --students <students.xlsx> --families <families.xlsx> --admin-email <admin@school.com> [--students-sheet <name>] [--families-sheet <name>] [--class-map <file.json>] [--auto-create-class-section] [--default-password <pwd>] [--student-email-domain <domain>] [--family-email-domain <domain>] [--batch-size <n>] [--concurrency <n>] [--dry-run]');
    process.exit(0);
  }

  const args: Args = {
    studentsPath: get('--students'),
    familiesPath: get('--families'),
    adminEmail: get('--admin-email').toLowerCase(),
    dryRun: argv.includes('--dry-run'),
    studentsSheet: get('--students-sheet') || undefined,
    familiesSheet: get('--families-sheet') || undefined,
    defaultPassword: get('--default-password') || DEFAULT_PASSWORD,
    studentEmailDomain: get('--student-email-domain') || 'student.faithhorizon.edu.pk',
    familyEmailDomain: get('--family-email-domain') || 'family.faithhorizon.edu.pk',
    classMapPath: get('--class-map') || undefined,
    autoCreateClassSection: argv.includes('--auto-create-class-section'),
    batchSize: parsePositiveInt(get('--batch-size'), 500),
    concurrency: parsePositiveInt(get('--concurrency'), 20),
  };

  if (!args.studentsPath || !args.familiesPath || !args.adminEmail) {
    throw new Error('Missing required args: --students, --families, --admin-email');
  }

  return args;
}

async function loadClassMap(path?: string): Promise<ClassMapConfig> {
  if (!path) return {};
  const content = await readFile(path, 'utf8');
  return JSON.parse(content) as ClassMapConfig;
}

function parseLegacyClass(raw: string): ClassMapEntry | null {
  const text = raw.trim().toLowerCase();
  if (!text) return null;

  const kg = text.match(/kg[-_ ]?(\d{1,2})/i);
  if (kg) {
    const level = Number(kg[1]);
    return { name: `KG ${level}`, grade: 0 };
  }

  const grade = text.match(/(?:^|[^a-z])(g|grade|class)[-_ ]?(\d{1,2})(?:$|[^a-z])/i);
  if (grade) {
    const g = Number(grade[2]);
    return { name: `Class ${g}`, grade: g };
  }

  const onlyNum = text.match(/^(\d{1,2})$/);
  if (onlyNum) {
    const g = Number(onlyNum[1]);
    return { name: `Class ${g}`, grade: g };
  }

  return null;
}

function resolveMappedClass(rawClass: string, map: ClassMapConfig): ClassMapEntry | null {
  const key = keyify(rawClass);
  if (!key) return null;
  return map.classes?.[key] ?? null;
}

function buildStudentRecord(row: ImportRow, index: number, studentEmailDomain: string) {
  const familyCode = firstValue(row, ['family_code']);
  const seq = firstValue(row, ['student_seq', 'seq']) || String(index + 1);
  const rawFullName = firstValue(row, ['student_name', 'name', 'first_name']);
  const split = splitName(rawFullName);
  const firstName = firstValue(row, ['first_name']) || split.firstName;
  const lastName = firstValue(row, ['last_name']) || split.lastName;

  const registrationNo =
    firstValue(row, ['registration_no', 'registration', 'reg_no']) ||
    `REG-${(familyCode || 'NA').toUpperCase()}-${String(seq).padStart(3, '0')}`;

  const rawRoll = firstValue(row, ['roll_number', 'roll_no', 'rollno']) || String(seq);
  const classRaw = firstValue(row, ['class', 'class_name', 'class_raw']);
  const sectionRaw = firstValue(row, ['section', 'section_name', 'section_raw', 'elder_child_section']);
  const guardianName = firstValue(row, ['guardian_name', 'father_name', 'father_guardian_name']);
  const guardianPhone = firstValue(row, ['guardian_phone', 'father_phone', 'contact', 'contact_no', 'contact_']);

  const classPart = toCodePart(classRaw, 'CLASS');
  const sectionPart = toCodePart(sectionRaw, 'A');
  const rollPart = toCodePart(rawRoll, String(index + 1));
  const rollNumber = `${classPart}-${sectionPart}-${rollPart}`;
  const generatedEmail = `${buildStudentEmailLocal(firstName, familyCode)}@${studentEmailDomain}`.toLowerCase();
  const email = generatedEmail;

  return {
    familyCode,
    firstName,
    lastName,
    email,
    registrationNo,
    rollNumber,
    classRaw,
    sectionRaw,
    guardianName,
    guardianPhone,
  };
}

async function getClassId(
  rawClass: string,
  classes: Array<Pick<Class, 'id' | 'name' | 'grade'>>,
  classMap: ClassMapConfig,
  args: Args,
  stats: Stats,
): Promise<string | null> {
  const mapped = resolveMappedClass(rawClass, classMap) ?? parseLegacyClass(rawClass);
  const normalizedRaw = keyify(rawClass);

  const byExactName = classes.find((c) => keyify(c.name) === normalizedRaw);
  if (byExactName) return byExactName.id;

  if (!mapped) return null;

  const byMappedName = classes.find((c) => keyify(c.name) === keyify(mapped.name));
  if (byMappedName) return byMappedName.id;

  if (mapped.grade > 0) {
    const byGrade = classes.find((c) => c.grade === mapped.grade);
    if (byGrade) return byGrade.id;
  }

  if (!args.autoCreateClassSection) return null;

  if (args.dryRun) {
    const virtualId = `DRYRUN_CLASS_${keyify(mapped.name)}`;
    const existingVirtual = classes.find((c) => c.id === virtualId);
    if (!existingVirtual) {
      classes.push({ id: virtualId, name: mapped.name, grade: mapped.grade });
      stats.classesCreated += 1;
    }
    return virtualId;
  }

  const created = await prisma.class.create({ data: { name: mapped.name, grade: mapped.grade } });
  classes.push({ id: created.id, name: created.name, grade: created.grade });
  stats.classesCreated += 1;
  return created.id;
}

async function getSectionId(
  classId: string,
  rawSection: string,
  sections: Array<Pick<Section, 'id' | 'name' | 'classId'>>,
  classMap: ClassMapConfig,
  args: Args,
  stats: Stats,
): Promise<string | null> {
  const mappedSection = classMap.sections?.[keyify(rawSection)] ?? rawSection;
  const resolved = resolveSectionId(classId, mappedSection, sections);
  if (resolved) return resolved;

  if (!args.autoCreateClassSection) return null;

  const sectionName = mappedSection.trim() || 'A';

  if (args.dryRun) {
    const virtualId = `DRYRUN_SECTION_${keyify(classId + '_' + sectionName)}`;
    const existingVirtual = sections.find((s) => s.id === virtualId);
    if (!existingVirtual) {
      sections.push({ id: virtualId, name: sectionName, classId });
      stats.sectionsCreated += 1;
    }
    return virtualId;
  }

  const created = await prisma.section.create({ data: { classId, name: sectionName } });
  sections.push({ id: created.id, name: created.name, classId: created.classId });
  stats.sectionsCreated += 1;
  return created.id;
}

async function createManyInChunks<T extends object>(
  rows: T[],
  batchSize: number,
  fn: (chunk: T[]) => Promise<void>,
): Promise<void> {
  const chunks = chunkArray(rows, batchSize);
  for (const chunk of chunks) {
    if (chunk.length === 0) continue;
    await fn(chunk);
  }
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const classMap = await loadClassMap(args.classMapPath);

  const students = await readRowsFromWorkbook(args.studentsPath, {
    preferredSheet: args.studentsSheet,
    fallbackContains: ['students_normalized', 'student'],
  });

  const families = await readRowsFromWorkbook(args.familiesPath, {
    preferredSheet: args.familiesSheet,
    fallbackContains: ['famil', 'sheet1'],
  });

  const classes = await prisma.class.findMany({ select: { id: true, name: true, grade: true } });
  const sections = await prisma.section.findMany({ select: { id: true, name: true, classId: true } });

  let adminId = '';
  if (!args.dryRun) {
    const admin = await prisma.user.findUnique({ where: { email: args.adminEmail }, select: { id: true } });
    if (!admin) throw new Error(`Admin user not found: ${args.adminEmail}`);
    adminId = admin.id;
  }

  const passwordHash = await bcrypt.hash(args.defaultPassword, 12);
  const stats: Stats = {
    studentsTotal: students.rows.length,
    studentsImported: 0,
    studentsFailed: 0,
    familiesTotal: families.rows.length,
    familiesImported: 0,
    familiesFailed: 0,
    linksCreated: 0,
    classesCreated: 0,
    sectionsCreated: 0,
    warnings: [],
    batchSize: args.batchSize,
    concurrency: args.concurrency,
  };

  const registrationByFamilyCode = new Map<string, string[]>();
  const studentsPrepared: StudentPrepared[] = [];
  const usedStudentEmails = new Set<string>();

  for (let i = 0; i < students.rows.length; i += 1) {
    const sourceRow = students.rows[i];
    if (!sourceRow) {
      stats.studentsFailed += 1;
      continue;
    }

    const item = buildStudentRecord(sourceRow, i, args.studentEmailDomain);
    if (!item.firstName || !item.email || !item.registrationNo || !item.classRaw) {
      stats.studentsFailed += 1;
      continue;
    }

    const classId = await getClassId(item.classRaw, classes, classMap, args, stats);
    if (!classId) {
      stats.studentsFailed += 1;
      stats.warnings.push(`Student ${item.registrationNo}: class unresolved (${item.classRaw})`);
      continue;
    }

    const sectionId = await getSectionId(classId, item.sectionRaw, sections, classMap, args, stats);
    if (!sectionId) {
      stats.studentsFailed += 1;
      stats.warnings.push(`Student ${item.registrationNo}: section unresolved (${item.sectionRaw})`);
      continue;
    }

    if (item.familyCode) {
      const arr = registrationByFamilyCode.get(item.familyCode) ?? [];
      arr.push(item.registrationNo);
      registrationByFamilyCode.set(item.familyCode, arr);
    }

    const primaryEmail = item.email;
    let email = primaryEmail;
    if (usedStudentEmails.has(email)) {
      email = `${buildStudentEmailLocal(item.firstName, item.familyCode)}.${toEmailSafeLocal(item.registrationNo)}@${args.studentEmailDomain}`.toLowerCase();
      stats.warnings.push(`Student ${item.registrationNo}: duplicate formatted email resolved with registration suffix`);
    }
    usedStudentEmails.add(email);

    studentsPrepared.push({
      email,
      firstName: item.firstName,
      lastName: item.lastName || '-',
      registrationNo: item.registrationNo,
      rollNumber: item.rollNumber,
      guardianName: item.guardianName || null,
      guardianPhone: item.guardianPhone || null,
      classId,
      sectionId,
      familyCode: item.familyCode,
    });
  }

  const familyPrepared: FamilyPrepared[] = [];
  for (let i = 0; i < families.rows.length; i += 1) {
    const row = families.rows[i];
    if (!row) {
      stats.familiesFailed += 1;
      continue;
    }

    const familyCode = firstValue(row, ['family_code']);
    const familyName = firstValue(row, ['name', 'father_name', 'head_name']) || `Family ${familyCode || i + 1}`;
    const split = splitName(familyName);
    const firstName = split.firstName || 'Family';
    const lastName = split.lastName || '-';
    const rawRelationship = firstValue(row, ['relationship']) || 'Guardian';
    const rawPhone = firstValue(row, ['phone', 'contact', 'contact_no', 'contact_']);
    const relationship = clampText(rawRelationship, 100);
    const phone = rawPhone ? clampText(rawPhone, 20) : null;

    if (rawRelationship.length > 100) {
      stats.warnings.push(`Family row ${i + 1}: relationship trimmed to 100 chars`);
    }
    if (rawPhone && rawPhone.length > 20) {
      stats.warnings.push(`Family row ${i + 1}: emergency phone trimmed to 20 chars`);
    }

    const explicitRegs = parseList(firstValue(row, ['student_registration_nos', 'student_registrations', 'registration_nos']));
    const codeRegs = familyCode ? registrationByFamilyCode.get(familyCode) ?? [] : [];
    const registrationNos = Array.from(new Set([...explicitRegs, ...codeRegs]));

    const normalizedFamilyCode = toEmailSafeLocal(familyCode || '');
    const emailLocal = normalizedFamilyCode || `family-row-${i + 1}`;
    if (!normalizedFamilyCode) {
      stats.warnings.push(`Family row ${i + 1}: missing family_code, fallback email local used`);
    }
    const email = `${emailLocal}@${args.familyEmailDomain}`.toLowerCase();

    familyPrepared.push({
      rowNo: i + 1,
      familyCode,
      email,
      firstName,
      lastName,
      relationship,
      phone,
      registrationNos,
    });
  }

  if (args.dryRun) {
    stats.studentsImported = studentsPrepared.length;
    stats.familiesImported = familyPrepared.length;
    stats.linksCreated = familyPrepared.reduce((acc, item) => acc + item.registrationNos.length, 0);

    console.log('Import completed:');
    console.log(JSON.stringify({
      dryRun: args.dryRun,
      studentsSheet: students.sheetName,
      familiesSheet: families.sheetName,
      autoCreateClassSection: args.autoCreateClassSection,
      ...stats,
      warningsPreview: stats.warnings.slice(0, 50),
    }, null, 2));
    return;
  }

  const studentEmails = Array.from(new Set(studentsPrepared.map((s) => s.email)));
  const studentRegs = Array.from(new Set(studentsPrepared.map((s) => s.registrationNo)));

  const existingStudentUsers = studentEmails.length > 0
    ? await prisma.user.findMany({ where: { email: { in: studentEmails } }, select: { id: true, email: true } })
    : [];
  const existingStudentUserByEmail = new Map(existingStudentUsers.map((u) => [u.email, u.id]));

  const newStudentUsers = studentsPrepared
    .filter((s) => !existingStudentUserByEmail.has(s.email))
    .map((s) => ({
      email: s.email,
      passwordHash,
      firstName: s.firstName,
      lastName: s.lastName,
      role: UserRole.STUDENT,
      phone: s.guardianPhone,
    }));

  await createManyInChunks(newStudentUsers, args.batchSize, async (chunk) => {
    await prisma.user.createMany({ data: chunk, skipDuplicates: true });
  });

  const allStudentUsers = studentEmails.length > 0
    ? await prisma.user.findMany({ where: { email: { in: studentEmails } }, select: { id: true, email: true } })
    : [];
  const studentUserByEmail = new Map(allStudentUsers.map((u) => [u.email, u.id]));

  const studentUserUpdates = studentsPrepared
    .map((s) => {
      const userId = studentUserByEmail.get(s.email);
      if (!userId) return null;
      return {
        userId,
        firstName: s.firstName,
        lastName: s.lastName,
        phone: s.guardianPhone,
      };
    })
    .filter((v): v is { userId: string; firstName: string; lastName: string; phone: string | null } => Boolean(v));

  await runWithConcurrency(studentUserUpdates, args.concurrency, async (update) => {
    await prisma.user.updateMany({
      where: { id: update.userId },
      data: {
        firstName: update.firstName,
        lastName: update.lastName,
        role: UserRole.STUDENT,
        phone: update.phone,
      },
    });
  });

  const existingStudentProfiles = studentRegs.length > 0
    ? await prisma.studentProfile.findMany({ where: { registrationNo: { in: studentRegs } }, select: { id: true, registrationNo: true } })
    : [];
  const existingStudentProfileByReg = new Map(existingStudentProfiles.map((p) => [p.registrationNo, p.id]));

  const studentProfileCreates = studentsPrepared
    .filter((s) => !existingStudentProfileByReg.has(s.registrationNo))
    .map((s) => {
      const userId = studentUserByEmail.get(s.email);
      if (!userId) return null;
      return {
        userId,
        registrationNo: s.registrationNo,
        rollNumber: s.rollNumber,
        classId: s.classId,
        sectionId: s.sectionId,
        guardianName: s.guardianName,
        guardianPhone: s.guardianPhone,
      };
    })
    .filter((v): v is {
      userId: string;
      registrationNo: string;
      rollNumber: string;
      classId: string;
      sectionId: string;
      guardianName: string | null;
      guardianPhone: string | null;
    } => Boolean(v));

  await createManyInChunks(studentProfileCreates, args.batchSize, async (chunk) => {
    await prisma.studentProfile.createMany({ data: chunk, skipDuplicates: true });
  });

  const studentProfileUpdates = studentsPrepared
    .map((s) => {
      const profileId = existingStudentProfileByReg.get(s.registrationNo);
      const userId = studentUserByEmail.get(s.email);
      if (!profileId || !userId) return null;
      return {
        profileId,
        userId,
        rollNumber: s.rollNumber,
        classId: s.classId,
        sectionId: s.sectionId,
        guardianName: s.guardianName,
        guardianPhone: s.guardianPhone,
      };
    })
    .filter((v): v is {
      profileId: string;
      userId: string;
      rollNumber: string;
      classId: string;
      sectionId: string;
      guardianName: string | null;
      guardianPhone: string | null;
    } => Boolean(v));

  await runWithConcurrency(studentProfileUpdates, args.concurrency, async (update) => {
    await prisma.studentProfile.updateMany({
      where: { id: update.profileId },
      data: {
        userId: update.userId,
        rollNumber: update.rollNumber,
        classId: update.classId,
        sectionId: update.sectionId,
        guardianName: update.guardianName,
        guardianPhone: update.guardianPhone,
      },
    });
  });

  const allRegsFromFamilies = Array.from(new Set(familyPrepared.flatMap((f) => f.registrationNos)));
  const studentProfilesForLinks = allRegsFromFamilies.length > 0
    ? await prisma.studentProfile.findMany({ where: { registrationNo: { in: allRegsFromFamilies } }, select: { id: true, registrationNo: true } })
    : [];
  const studentByRegistration = new Map(studentProfilesForLinks.map((s) => [s.registrationNo, s.id]));

  const familyEmails = Array.from(new Set(familyPrepared.map((f) => f.email)));
  const existingFamilyUsers = familyEmails.length > 0
    ? await prisma.user.findMany({ where: { email: { in: familyEmails } }, select: { id: true, email: true } })
    : [];
  const existingFamilyUserByEmail = new Map(existingFamilyUsers.map((u) => [u.email, u.id]));

  const newFamilyUsers = familyPrepared
    .filter((f) => !existingFamilyUserByEmail.has(f.email))
    .map((f) => ({
      email: f.email,
      passwordHash,
      firstName: f.firstName,
      lastName: f.lastName,
      role: UserRole.FAMILY,
      phone: f.phone,
    }));

  await createManyInChunks(newFamilyUsers, args.batchSize, async (chunk) => {
    await prisma.user.createMany({ data: chunk, skipDuplicates: true });
  });

  const allFamilyUsers = familyEmails.length > 0
    ? await prisma.user.findMany({ where: { email: { in: familyEmails } }, select: { id: true, email: true } })
    : [];
  const familyUserByEmail = new Map(allFamilyUsers.map((u) => [u.email, u.id]));

  const familyUserUpdates = familyPrepared
    .map((f) => {
      const userId = familyUserByEmail.get(f.email);
      if (!userId) return null;
      return {
        userId,
        firstName: f.firstName,
        lastName: f.lastName,
        phone: f.phone,
      };
    })
    .filter((v): v is { userId: string; firstName: string; lastName: string; phone: string | null } => Boolean(v));

  await runWithConcurrency(familyUserUpdates, args.concurrency, async (update) => {
    await prisma.user.updateMany({
      where: { id: update.userId },
      data: {
        firstName: update.firstName,
        lastName: update.lastName,
        role: UserRole.FAMILY,
        phone: update.phone,
      },
    });
  });

  const familyUserIds = Array.from(new Set(Array.from(familyUserByEmail.values())));
  const existingFamilyProfiles = familyUserIds.length > 0
    ? await prisma.familyProfile.findMany({ where: { userId: { in: familyUserIds } }, select: { id: true, userId: true, relationship: true, emergencyPhone: true } })
    : [];
  const familyProfileByUserId = new Map(existingFamilyProfiles.map((p) => [p.userId, p]));

  const familyProfileCreates = familyPrepared
    .map((f) => {
      const userId = familyUserByEmail.get(f.email);
      if (!userId || familyProfileByUserId.has(userId)) return null;
      return {
        userId,
        relationship: f.relationship,
        emergencyPhone: f.phone,
      };
    })
    .filter((v): v is { userId: string; relationship: string; emergencyPhone: string | null } => Boolean(v));

  await createManyInChunks(familyProfileCreates, args.batchSize, async (chunk) => {
    await prisma.familyProfile.createMany({ data: chunk, skipDuplicates: true });
  });

  const familyProfileUpdates = familyPrepared
    .map((f) => {
      const userId = familyUserByEmail.get(f.email);
      const profile = userId ? familyProfileByUserId.get(userId) : null;
      if (!profile) return null;
      return {
        profileId: profile.id,
        relationship: f.relationship,
        emergencyPhone: f.phone,
      };
    })
    .filter((v): v is { profileId: string; relationship: string; emergencyPhone: string | null } => Boolean(v));

  await runWithConcurrency(familyProfileUpdates, args.concurrency, async (update) => {
    await prisma.familyProfile.updateMany({
      where: { id: update.profileId },
      data: {
        relationship: update.relationship,
        emergencyPhone: update.emergencyPhone,
      },
    });
  });

  const allFamilyProfiles = familyUserIds.length > 0
    ? await prisma.familyProfile.findMany({ where: { userId: { in: familyUserIds } }, select: { id: true, userId: true } })
    : [];
  const familyProfileIdByUserId = new Map(allFamilyProfiles.map((p) => [p.userId, p.id]));

  const desiredLinks: Array<{ familyProfileId: string; studentProfileId: string; relationship: string }> = [];
  for (const family of familyPrepared) {
    const userId = familyUserByEmail.get(family.email);
    const familyProfileId = userId ? familyProfileIdByUserId.get(userId) : undefined;
    if (!familyProfileId) continue;

    for (const reg of family.registrationNos) {
      const studentProfileId = studentByRegistration.get(reg);
      if (!studentProfileId) continue;
      desiredLinks.push({
        familyProfileId,
        studentProfileId,
        relationship: family.relationship,
      });
    }
  }

  const familyProfileIdsForLinks = Array.from(new Set(desiredLinks.map((l) => l.familyProfileId)));
  const studentProfileIdsForLinks = Array.from(new Set(desiredLinks.map((l) => l.studentProfileId)));
  const existingLinks = familyProfileIdsForLinks.length > 0 && studentProfileIdsForLinks.length > 0
    ? await prisma.familyStudentLink.findMany({
      where: {
        familyProfileId: { in: familyProfileIdsForLinks },
        studentProfileId: { in: studentProfileIdsForLinks },
      },
      select: {
        id: true,
        familyProfileId: true,
        studentProfileId: true,
        relationship: true,
        isActive: true,
      },
    })
    : [];

  const existingLinkByKey = new Map(existingLinks.map((l) => [`${l.familyProfileId}::${l.studentProfileId}`, l]));

  const linkCreates: Array<{
    familyProfileId: string;
    studentProfileId: string;
    relationship: string;
    isPrimary: boolean;
    isActive: boolean;
    linkedById: string;
  }> = [];

  const linkUpdates: Array<{ id: string; relationship: string }> = [];

  for (const link of desiredLinks) {
    const key = `${link.familyProfileId}::${link.studentProfileId}`;
    const existing = existingLinkByKey.get(key);
    if (!existing) {
      linkCreates.push({
        familyProfileId: link.familyProfileId,
        studentProfileId: link.studentProfileId,
        relationship: link.relationship,
        isPrimary: false,
        isActive: true,
        linkedById: adminId,
      });
      continue;
    }

    if (existing.relationship !== link.relationship || !existing.isActive) {
      linkUpdates.push({ id: existing.id, relationship: link.relationship });
    }
  }

  await createManyInChunks(linkCreates, args.batchSize, async (chunk) => {
    await prisma.familyStudentLink.createMany({ data: chunk, skipDuplicates: true });
  });

  await runWithConcurrency(linkUpdates, args.concurrency, async (update) => {
    await prisma.familyStudentLink.updateMany({
      where: { id: update.id },
      data: {
        relationship: update.relationship,
        isActive: true,
        linkedById: adminId,
      },
    });
  });

  stats.studentsImported = studentsPrepared.length;
  stats.familiesImported = familyPrepared.length;
  stats.linksCreated = desiredLinks.length;

  const reconciliation: Reconciliation = {
    studentProfilesForInput: studentRegs.length > 0
      ? await prisma.studentProfile.count({ where: { registrationNo: { in: studentRegs } } })
      : 0,
    familyUsersForInput: familyEmails.length > 0
      ? await prisma.user.count({ where: { email: { in: familyEmails }, role: UserRole.FAMILY } })
      : 0,
    familyProfilesForInput: familyUserIds.length > 0
      ? await prisma.familyProfile.count({ where: { userId: { in: familyUserIds } } })
      : 0,
    activeLinksForInput: familyProfileIdsForLinks.length > 0 && studentProfileIdsForLinks.length > 0
      ? await prisma.familyStudentLink.count({
        where: {
          familyProfileId: { in: familyProfileIdsForLinks },
          studentProfileId: { in: studentProfileIdsForLinks },
          isActive: true,
        },
      })
      : 0,
  };

  stats.reconciliation = reconciliation;

  console.log('Import completed:');
  console.log(JSON.stringify({
    dryRun: args.dryRun,
    studentsSheet: students.sheetName,
    familiesSheet: families.sheetName,
    autoCreateClassSection: args.autoCreateClassSection,
    ...stats,
    warningsPreview: stats.warnings.slice(0, 50),
  }, null, 2));
}

main()
  .catch((error: unknown) => {
    console.error('Import failed:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
