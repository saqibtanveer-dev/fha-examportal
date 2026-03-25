import { readRowsFromWorkbook } from './importers/excel-reader';
import { firstValue, parseList } from './importers/normalizers';
import { prisma } from '../src/lib/prisma';

type Args = {
  studentsPath: string;
  familiesPath: string;
  adminEmail: string;
  generatedForMonth: string;
  dueDate: string;
  academicSessionId?: string;
  studentsSheet?: string;
  familiesSheet?: string;
  onExisting: 'skip' | 'merge' | 'fail';
  dryRun: boolean;
  batchSize: number;
  concurrency: number;
};

type Reconciliation = {
  targetedStudents: number;
  targetedAssignmentsCount: number;
  targetedTotalAmount: number;
  targetedBalanceAmount: number;
  globalAssignmentsCountForMonth: number;
  globalTotalAmountForMonth: number;
  globalBalanceAmountForMonth: number;
};

type Stats = {
  dryRun: boolean;
  generatedForMonth: string;
  dueDate: string;
  academicSessionId: string;
  studentsSheet: string;
  familiesSheet: string;
  familiesTotal: number;
  familiesWithBalance: number;
  familiesSkippedNoChildren: number;
  familiesUsingRegistrationTargets: number;
  assignmentsPlanned: number;
  assignmentsCreated: number;
  assignmentsMerged: number;
  assignmentsSkippedExisting: number;
  assignmentsFailed: number;
  totalBalanceRead: number;
  totalAllocated: number;
  warnings: string[];
  batchSize: number;
  concurrency: number;
  reconciliation?: Reconciliation;
};

function parsePositiveInt(input: string, fallback: number): number {
  const parsed = Number(input);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.floor(parsed);
}

function chunkArray<T>(items: T[], size: number): T[][] {
  if (size <= 0) return [items];
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size));
  }
  return out;
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
    console.log('Usage: pnpm import:financial-continuity --students <students.xlsx> --families <families.xlsx> --admin-email <admin@school.com> --generated-for-month <YYYY-MM> --due-date <YYYY-MM-DD> [--academic-session-id <id>] [--students-sheet <name>] [--families-sheet <name>] [--on-existing skip|merge|fail] [--batch-size <n>] [--concurrency <n>] [--dry-run]');
    process.exit(0);
  }

  const onExistingRaw = (get('--on-existing') || 'skip').toLowerCase();
  const onExisting = onExistingRaw === 'merge' || onExistingRaw === 'fail' ? onExistingRaw : 'skip';

  const args: Args = {
    studentsPath: get('--students'),
    familiesPath: get('--families'),
    adminEmail: get('--admin-email').toLowerCase(),
    generatedForMonth: get('--generated-for-month'),
    dueDate: get('--due-date'),
    academicSessionId: get('--academic-session-id') || undefined,
    studentsSheet: get('--students-sheet') || undefined,
    familiesSheet: get('--families-sheet') || undefined,
    onExisting,
    dryRun: argv.includes('--dry-run'),
    batchSize: parsePositiveInt(get('--batch-size'), 500),
    concurrency: parsePositiveInt(get('--concurrency'), 20),
  };

  if (!args.studentsPath || !args.familiesPath || !args.adminEmail || !args.generatedForMonth || !args.dueDate) {
    throw new Error('Missing required args: --students, --families, --admin-email, --generated-for-month, --due-date');
  }
  if (!/^\d{4}-\d{2}$/.test(args.generatedForMonth)) {
    throw new Error('Invalid --generated-for-month format. Expected YYYY-MM');
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(args.dueDate)) {
    throw new Error('Invalid --due-date format. Expected YYYY-MM-DD');
  }

  return args;
}

function toNumber(value: string): number {
  const cleaned = value.replace(/,/g, '').trim();
  if (!cleaned) return 0;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function buildRegistrationNo(row: Record<string, string>, index: number): string {
  const familyCode = firstValue(row, ['family_code']);
  const seq = firstValue(row, ['student_seq', 'seq']) || String(index + 1);
  return firstValue(row, ['registration_no', 'registration', 'reg_no']) || `REG-${(familyCode || 'NA').toUpperCase()}-${String(seq).padStart(3, '0')}`;
}

async function resolveAcademicSessionId(inputId?: string): Promise<string> {
  if (inputId) return inputId;
  const current = await prisma.academicSession.findFirst({ where: { isCurrent: true }, select: { id: true } });
  if (!current) throw new Error('No current academic session found. Pass --academic-session-id explicitly.');
  return current.id;
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const academicSessionId = await resolveAcademicSessionId(args.academicSessionId);
  const dueDate = new Date(`${args.dueDate}T00:00:00.000Z`);
  if (Number.isNaN(dueDate.getTime())) {
    throw new Error('Invalid due date after parsing');
  }

  const students = await readRowsFromWorkbook(args.studentsPath, {
    preferredSheet: args.studentsSheet,
    fallbackContains: ['students_normalized', 'student'],
  });
  const families = await readRowsFromWorkbook(args.familiesPath, {
    preferredSheet: args.familiesSheet,
    fallbackContains: ['famil', 'sheet1'],
  });

  const regsByFamilyCode = new Map<string, string[]>();
  for (let i = 0; i < students.rows.length; i += 1) {
    const row = students.rows[i];
    if (!row) continue;
    const familyCode = firstValue(row, ['family_code']);
    if (!familyCode) continue;
    const registrationNo = buildRegistrationNo(row, i);
    const list = regsByFamilyCode.get(familyCode) ?? [];
    list.push(registrationNo);
    regsByFamilyCode.set(familyCode, list);
  }

  const registrationNos = Array.from(new Set(Array.from(regsByFamilyCode.values()).flat()));
  const studentProfiles = registrationNos.length > 0
    ? await prisma.studentProfile.findMany({ where: { registrationNo: { in: registrationNos } }, select: { id: true, registrationNo: true } })
    : [];
  const studentByReg = new Map(studentProfiles.map((s) => [s.registrationNo, s.id]));

  let adminId = '';
  if (!args.dryRun) {
    const admin = await prisma.user.findUnique({ where: { email: args.adminEmail }, select: { id: true } });
    if (!admin) throw new Error(`Admin user not found: ${args.adminEmail}`);
    adminId = admin.id;
  }

  const stats: Stats = {
    dryRun: args.dryRun,
    generatedForMonth: args.generatedForMonth,
    dueDate: args.dueDate,
    academicSessionId,
    studentsSheet: students.sheetName,
    familiesSheet: families.sheetName,
    familiesTotal: families.rows.length,
    familiesWithBalance: 0,
    familiesSkippedNoChildren: 0,
    familiesUsingRegistrationTargets: 0,
    assignmentsPlanned: 0,
    assignmentsCreated: 0,
    assignmentsMerged: 0,
    assignmentsSkippedExisting: 0,
    assignmentsFailed: 0,
    totalBalanceRead: 0,
    totalAllocated: 0,
    warnings: [],
    batchSize: args.batchSize,
    concurrency: args.concurrency,
  };

  const dbAllocationsByStudent = new Map<string, number>();
  const virtualAllocationsByReg = new Map<string, number>();

  for (let i = 0; i < families.rows.length; i += 1) {
    const row = families.rows[i];
    if (!row) continue;

    const familyCode = firstValue(row, ['family_code']);
    const balance = toNumber(firstValue(row, ['balance', 'total_due']));
    if (balance <= 0) continue;

    const explicitRegs = parseList(firstValue(row, ['student_registration_nos', 'student_registrations', 'registration_nos']));
    const codeRegs = familyCode ? regsByFamilyCode.get(familyCode) ?? [] : [];
    const regs = Array.from(new Set([...explicitRegs, ...codeRegs]));
    const linkedStudentIds = regs.map((reg) => studentByReg.get(reg)).filter((id): id is string => Boolean(id));
    const virtualRegs = args.dryRun ? regs.filter((reg) => !studentByReg.has(reg)) : [];

    const targets: Array<{ kind: 'db'; studentProfileId: string } | { kind: 'virtual'; registrationNo: string }> = [
      ...linkedStudentIds.map((studentProfileId) => ({ kind: 'db' as const, studentProfileId })),
      ...virtualRegs.map((registrationNo) => ({ kind: 'virtual' as const, registrationNo })),
    ];

    stats.familiesWithBalance += 1;
    stats.totalBalanceRead = round2(stats.totalBalanceRead + balance);

    if (targets.length === 0) {
      stats.familiesSkippedNoChildren += 1;
      stats.warnings.push(`Family ${familyCode || `row-${i + 2}`}: balance ${balance} skipped (no linked students found)`);
      continue;
    }
    if (args.dryRun && linkedStudentIds.length === 0 && virtualRegs.length > 0) {
      stats.familiesUsingRegistrationTargets += 1;
    }

    const totalCents = Math.round(balance * 100);
    const perChildCents = Math.floor(totalCents / targets.length);
    const remainder = totalCents - perChildCents * targets.length;

    for (let c = 0; c < targets.length; c += 1) {
      const target = targets[c];
      if (!target) continue;
      const shareCents = c === targets.length - 1 ? perChildCents + remainder : perChildCents;
      const share = round2(shareCents / 100);
      if (share <= 0) continue;

      stats.assignmentsPlanned += 1;
      stats.totalAllocated = round2(stats.totalAllocated + share);

      if (target.kind === 'db') {
        const previous = dbAllocationsByStudent.get(target.studentProfileId) ?? 0;
        dbAllocationsByStudent.set(target.studentProfileId, round2(previous + share));
      } else {
        const previous = virtualAllocationsByReg.get(target.registrationNo) ?? 0;
        virtualAllocationsByReg.set(target.registrationNo, round2(previous + share));
      }
    }
  }

  const targetStudentIds = Array.from(dbAllocationsByStudent.keys());

  // Cancelled-edge bug fix: do not exclude cancelled rows from existing lookup,
  // because unique constraint is status-independent.
  const existingAssignments = targetStudentIds.length > 0
    ? await prisma.feeAssignment.findMany({
      where: {
        studentProfileId: { in: targetStudentIds },
        academicSessionId,
        generatedForMonth: args.generatedForMonth,
      },
      select: {
        id: true,
        studentProfileId: true,
        status: true,
      },
    })
    : [];

  const existingByStudent = new Map(existingAssignments.map((a) => [a.studentProfileId, a]));

  const createRows: Array<{
    studentProfileId: string;
    academicSessionId: string;
    generatedForMonth: string;
    totalAmount: number;
    paidAmount: number;
    balanceAmount: number;
    discountAmount: number;
    lateFeesApplied: number;
    dueDate: Date;
    status: 'PENDING';
    generatedById: string;
  }> = [];

  const mergeRows: Array<{ id: string; incrementBy: number }> = [];

  for (const studentProfileId of targetStudentIds) {
    const amount = dbAllocationsByStudent.get(studentProfileId) ?? 0;
    if (amount <= 0) continue;

    const existing = existingByStudent.get(studentProfileId);

    if (existing && args.onExisting === 'fail') {
      throw new Error(`Existing assignment found for student ${studentProfileId} in ${args.generatedForMonth} (status: ${existing.status})`);
    }
    if (existing && args.onExisting === 'skip') {
      stats.assignmentsSkippedExisting += 1;
      continue;
    }

    if (existing && args.onExisting === 'merge') {
      mergeRows.push({ id: existing.id, incrementBy: amount });
      continue;
    }

    createRows.push({
      studentProfileId,
      academicSessionId,
      generatedForMonth: args.generatedForMonth,
      totalAmount: amount,
      paidAmount: 0,
      balanceAmount: amount,
      discountAmount: 0,
      lateFeesApplied: 0,
      dueDate,
      status: 'PENDING',
      generatedById: adminId,
    });
  }

  if (args.dryRun) {
    stats.assignmentsCreated = createRows.length;
    stats.assignmentsMerged = mergeRows.length;
  } else {
    await createManyInChunks(createRows, args.batchSize, async (chunk) => {
      await prisma.feeAssignment.createMany({ data: chunk, skipDuplicates: true });
    });
    stats.assignmentsCreated = createRows.length;

    await runWithConcurrency(mergeRows, args.concurrency, async (update) => {
      await prisma.feeAssignment.updateMany({
        where: { id: update.id },
        data: {
          totalAmount: { increment: update.incrementBy },
          balanceAmount: { increment: update.incrementBy },
          status: 'PENDING',
        },
      });
    });
    stats.assignmentsMerged = mergeRows.length;
  }

  if (!args.dryRun && virtualAllocationsByReg.size > 0) {
    for (const [reg, amount] of virtualAllocationsByReg.entries()) {
      stats.assignmentsFailed += 1;
      stats.warnings.push(`Registration ${reg}: amount ${amount} cannot apply without StudentProfile in DB`);
    }
  }

  if (!args.dryRun) {
    const targetedAggregate = targetStudentIds.length > 0
      ? await prisma.feeAssignment.aggregate({
        where: {
          academicSessionId,
          generatedForMonth: args.generatedForMonth,
          studentProfileId: { in: targetStudentIds },
        },
        _count: { _all: true },
        _sum: { totalAmount: true, balanceAmount: true },
      })
      : { _count: { _all: 0 }, _sum: { totalAmount: null, balanceAmount: null } };

    const globalAggregate = await prisma.feeAssignment.aggregate({
      where: {
        academicSessionId,
        generatedForMonth: args.generatedForMonth,
      },
      _count: { _all: true },
      _sum: { totalAmount: true, balanceAmount: true },
    });

    stats.reconciliation = {
      targetedStudents: targetStudentIds.length,
      targetedAssignmentsCount: targetedAggregate._count._all,
      targetedTotalAmount: Number(targetedAggregate._sum.totalAmount ?? 0),
      targetedBalanceAmount: Number(targetedAggregate._sum.balanceAmount ?? 0),
      globalAssignmentsCountForMonth: globalAggregate._count._all,
      globalTotalAmountForMonth: Number(globalAggregate._sum.totalAmount ?? 0),
      globalBalanceAmountForMonth: Number(globalAggregate._sum.balanceAmount ?? 0),
    };
  }

  console.log('Financial continuity import completed:');
  console.log(JSON.stringify({ ...stats, warningsPreview: stats.warnings.slice(0, 50) }, null, 2));
}

main()
  .catch((error: unknown) => {
    console.error('Financial continuity import failed:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
