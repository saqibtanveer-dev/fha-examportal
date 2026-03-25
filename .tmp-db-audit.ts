import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const month = '2026-03';
const studentDomain = '@student.faithhorizon.edu.pk';
const familyDomain = '@family.faithhorizon.edu.pk';

async function main() {
  const [studentProfiles, familyProfiles, activeLinks, totalLinks, feeAssignmentsMonth] = await Promise.all([
    prisma.studentProfile.count(),
    prisma.familyProfile.count(),
    prisma.familyStudentLink.count({ where: { isActive: true } }),
    prisma.familyStudentLink.count(),
    prisma.feeAssignment.count({ where: { generatedForMonth: month } }),
  ]);

  const [badStudentEmails, badFamilyEmails, rollFormatIssues, studentsWithoutFamilyLink, familyWithoutAnyLink] = await Promise.all([
    prisma.studentProfile.count({ where: { user: { email: { not: { endsWith: studentDomain } } } } }),
    prisma.familyProfile.count({ where: { user: { email: { not: { endsWith: familyDomain } } } } }),
    prisma.studentProfile.count({
      where: {
        OR: [
          { rollNumber: { not: { contains: '-' } } },
          { rollNumber: { equals: '' } },
        ],
      },
    }),
    prisma.studentProfile.count({ where: { familyLinks: { none: { isActive: true } } } }),
    prisma.familyProfile.count({ where: { studentLinks: { none: { isActive: true } } } }),
  ]);

  const feeAgg = await prisma.feeAssignment.aggregate({
    where: { generatedForMonth: month },
    _sum: { totalAmount: true, balanceAmount: true, paidAmount: true },
    _count: { _all: true },
  });

  const statusBreakdown = await prisma.feeAssignment.groupBy({
    by: ['status'],
    where: { generatedForMonth: month },
    _count: { _all: true },
  });

  const out = {
    migrationAuditMonth: month,
    counts: {
      studentProfiles,
      familyProfiles,
      activeLinks,
      totalLinks,
      feeAssignmentsMonth,
    },
    formatChecks: {
      badStudentEmails,
      badFamilyEmails,
      rollFormatIssues,
    },
    integrity: {
      studentsWithoutFamilyLink,
      familyWithoutAnyLink,
    },
    feeMonthTotals: {
      count: feeAgg._count._all,
      totalAmount: feeAgg._sum.totalAmount?.toString() ?? '0',
      balanceAmount: feeAgg._sum.balanceAmount?.toString() ?? '0',
      paidAmount: feeAgg._sum.paidAmount?.toString() ?? '0',
    },
    feeStatusBreakdown: statusBreakdown.map((s) => ({ status: s.status, count: s._count._all })),
  };

  console.log(JSON.stringify(out, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
