import { mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import bcrypt from 'bcryptjs';
import * as XLSX from 'xlsx';
import { prisma } from '../src/lib/prisma';

type Args = {
  outPath: string;
  candidatePassword?: string;
};

type ExportRow = {
  studentName: string;
  fatherName: string;
  familyCode: string;
  studentEmail: string;
  password: string;
  passwordStatus: string;
  registrationNo: string;
  rollNumber: string;
  className: string;
  sectionName: string;
  gender: string;
  guardianPhone: string;
  familyEmail: string;
  familyPhone: string;
  studentStatus: string;
};

const EMPTY_PASSWORD = 'RESET_REQUIRED';

function parseArgs(argv: string[]): Args {
  const get = (flag: string) => {
    const index = argv.indexOf(flag);
    return index >= 0 ? (argv[index + 1] ?? '') : '';
  };

  return {
    outPath: get('--out') || 'exports/grade-9-10-login-sheets.xlsx',
    candidatePassword: get('--candidate-password') || undefined,
  };
}

function parseFamilyCodeFromEmail(email?: string | null): string {
  if (!email) return '';
  const local = email.split('@')[0] ?? '';
  if (!local) return '';
  return local.toUpperCase();
}

function classifyGroup(grade: number, sectionName: string, gender: string): string | null {
  const section = sectionName.toLowerCase();
  const g = gender.toUpperCase();

  const isBoys = section.includes('boy') || g === 'MALE';
  const isGirls = section.includes('girl') || g === 'FEMALE';

  if (grade === 10 && isGirls) return 'Grade 10 Girls';
  if (grade === 10 && isBoys) return 'Grade 10 Boys';
  if (grade === 9 && isGirls) return 'Grade 9 Girls';
  if (grade === 9 && isBoys) return 'Grade 9 Boys';

  return null;
}

function toSheetRows(rows: ExportRow[]) {
  return rows.map((r, i) => ({
    'Sr#': i + 1,
    'Student Name': r.studentName,
    'Father Name': r.fatherName,
    'Family Code': r.familyCode,
    'Student Email': r.studentEmail,
    Password: r.password,
    'Password Status': r.passwordStatus,
    'Registration No': r.registrationNo,
    'Roll No': r.rollNumber,
    Class: r.className,
    Section: r.sectionName,
    Gender: r.gender,
    'Guardian Phone': r.guardianPhone,
    'Family Email': r.familyEmail,
    'Family Phone': r.familyPhone,
    'Student Status': r.studentStatus,
  }));
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const outputPath = resolve(process.cwd(), args.outPath);

  const students = await prisma.studentProfile.findMany({
    where: {
      class: { grade: { in: [9, 10] } },
    },
    include: {
      user: true,
      class: true,
      section: true,
      familyLinks: {
        where: { isActive: true },
        orderBy: [{ isPrimary: 'desc' }, { linkedAt: 'asc' }],
        include: {
          familyProfile: {
            include: {
              user: true,
            },
          },
        },
      },
    },
    orderBy: [{ class: { grade: 'desc' } }, { section: { name: 'asc' } }, { rollNumber: 'asc' }],
  });

  const buckets: Record<string, ExportRow[]> = {
    'Grade 10 Girls': [],
    'Grade 10 Boys': [],
    'Grade 9 Girls': [],
    'Grade 9 Boys': [],
  };

  let matchedCandidateCount = 0;
  let unmatchedCandidateCount = 0;

  for (const student of students) {
    const group = classifyGroup(student.class.grade, student.section.name, String(student.gender ?? ''));
    if (!group) continue;

    const familyLink = student.familyLinks[0];
    const familyUser = familyLink?.familyProfile.user;
    const familyCode = familyUser?.lastName?.trim() || parseFamilyCodeFromEmail(familyUser?.email);

    let password = EMPTY_PASSWORD;
    let passwordStatus = 'unknown';

    if (args.candidatePassword) {
      const matches = await bcrypt.compare(args.candidatePassword, student.user.passwordHash);
      if (matches) {
        password = args.candidatePassword;
        passwordStatus = 'matches_candidate';
        matchedCandidateCount += 1;
      } else {
        password = EMPTY_PASSWORD;
        passwordStatus = 'changed_or_different';
        unmatchedCandidateCount += 1;
      }
    }

    buckets[group].push({
      studentName: `${student.user.firstName} ${student.user.lastName}`.trim(),
      fatherName: student.guardianName ?? '',
      familyCode,
      studentEmail: student.user.email,
      password,
      passwordStatus,
      registrationNo: student.registrationNo,
      rollNumber: student.rollNumber,
      className: student.class.name,
      sectionName: student.section.name,
      gender: String(student.gender ?? ''),
      guardianPhone: student.guardianPhone ?? '',
      familyEmail: familyUser?.email ?? '',
      familyPhone: familyLink?.familyProfile.emergencyPhone ?? '',
      studentStatus: String(student.status),
    });
  }

  const wb = XLSX.utils.book_new();

  const orderedSheets = ['Grade 10 Girls', 'Grade 10 Boys', 'Grade 9 Girls', 'Grade 9 Boys'];
  for (const name of orderedSheets) {
    const rows = toSheetRows(buckets[name]);
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, name);
  }

  await mkdir(dirname(outputPath), { recursive: true });
  XLSX.writeFile(wb, outputPath);

  console.log('Export completed:');
  console.log(
    JSON.stringify(
      {
        outputPath,
        counts: Object.fromEntries(orderedSheets.map((k) => [k, buckets[k].length])),
        candidatePasswordProvided: Boolean(args.candidatePassword),
        candidatePasswordMatched: matchedCandidateCount,
        candidatePasswordUnmatched: unmatchedCandidateCount,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error: unknown) => {
    console.error('Export failed:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
