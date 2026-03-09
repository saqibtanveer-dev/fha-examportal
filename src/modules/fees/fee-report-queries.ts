import { prisma } from '@/lib/prisma';
import type { ClassWiseSummary, SectionWiseSummary, StudentFeeSummary, FeeOverview } from './fee.types';

// ============================================
// SCHOOL-WIDE OVERVIEW
// ============================================

export async function getFeeOverview(academicSessionId: string): Promise<FeeOverview> {
  const assignments = await prisma.feeAssignment.aggregate({
    where: { academicSessionId, status: { not: 'CANCELLED' } },
    _sum: { totalAmount: true, paidAmount: true, balanceAmount: true },
  });

  const statusCounts = await prisma.feeAssignment.groupBy({
    by: ['status'],
    where: { academicSessionId, status: { not: 'CANCELLED' } },
    _count: { id: true },
  });

  const studentCountResult = await prisma.$queryRaw<[{ count: number }]>`
    SELECT COUNT(DISTINCT "studentProfileId")::int AS count
    FROM "FeeAssignment"
    WHERE "academicSessionId" = ${academicSessionId} AND status != 'CANCELLED'
  `;
  const studentCount = studentCountResult[0]?.count ?? 0;

  const totalDue = Number(assignments._sum.totalAmount ?? 0);
  const totalCollected = Number(assignments._sum.paidAmount ?? 0);
  const totalOutstanding = Number(assignments._sum.balanceAmount ?? 0);

  let paidCount = 0;
  let partialCount = 0;
  let unpaidCount = 0;
  for (const s of statusCounts) {
    if (s.status === 'PAID' || s.status === 'WAIVED') paidCount += s._count.id;
    else if (s.status === 'PARTIAL') partialCount += s._count.id;
    else if (s.status === 'PENDING' || s.status === 'OVERDUE') unpaidCount += s._count.id;
  }

  return {
    totalDue,
    totalCollected,
    totalOutstanding,
    collectionPercentage: totalDue > 0 ? Math.round((totalCollected / totalDue) * 1000) / 10 : 0,
    totalStudents: studentCount,
    paidCount,
    partialCount,
    unpaidCount,
  };
}

// ============================================
// CLASS-WISE SUMMARY
// ============================================

export async function getClassWiseSummary(
  academicSessionId: string,
): Promise<ClassWiseSummary[]> {
  const raw = await prisma.$queryRaw<
    { classId: string; className: string; grade: number; totalDue: number; totalCollected: number; totalOutstanding: number; studentCount: number }[]
  >`
    SELECT
      c.id AS "classId",
      c.name AS "className",
      c.grade,
      COALESCE(SUM(fa."totalAmount"), 0)::float AS "totalDue",
      COALESCE(SUM(fa."paidAmount"), 0)::float AS "totalCollected",
      COALESCE(SUM(fa."balanceAmount"), 0)::float AS "totalOutstanding",
      COUNT(DISTINCT fa."studentProfileId")::int AS "studentCount"
    FROM "FeeAssignment" fa
    JOIN "StudentProfile" sp ON sp.id = fa."studentProfileId"
    JOIN "Class" c ON c.id = sp."classId"
    WHERE fa."academicSessionId" = ${academicSessionId}
      AND fa.status != 'CANCELLED'
    GROUP BY c.id, c.name, c.grade
    ORDER BY c.grade ASC
  `;

  return raw.map((r) => ({
    ...r,
    collectionPercentage: r.totalDue > 0
      ? Math.round((r.totalCollected / r.totalDue) * 1000) / 10
      : 0,
  }));
}

// ============================================
// SECTION-WISE SUMMARY (for a specific class)
// ============================================

export async function getSectionWiseSummary(
  academicSessionId: string,
  classId: string,
): Promise<SectionWiseSummary[]> {
  const raw = await prisma.$queryRaw<
    { sectionId: string; sectionName: string; totalDue: number; totalCollected: number; totalOutstanding: number; studentCount: number }[]
  >`
    SELECT
      s.id AS "sectionId",
      s.name AS "sectionName",
      COALESCE(SUM(fa."totalAmount"), 0)::float AS "totalDue",
      COALESCE(SUM(fa."paidAmount"), 0)::float AS "totalCollected",
      COALESCE(SUM(fa."balanceAmount"), 0)::float AS "totalOutstanding",
      COUNT(DISTINCT fa."studentProfileId")::int AS "studentCount"
    FROM "FeeAssignment" fa
    JOIN "StudentProfile" sp ON sp.id = fa."studentProfileId"
    JOIN "Section" s ON s.id = sp."sectionId"
    WHERE fa."academicSessionId" = ${academicSessionId}
      AND sp."classId" = ${classId}
      AND fa.status != 'CANCELLED'
    GROUP BY s.id, s.name
    ORDER BY s.name ASC
  `;

  return raw.map((r) => ({
    ...r,
    collectionPercentage: r.totalDue > 0
      ? Math.round((r.totalCollected / r.totalDue) * 1000) / 10
      : 0,
  }));
}

// ============================================
// STUDENT-WISE SUMMARY (for a class/section)
// ============================================

export async function getStudentWiseSummary(
  academicSessionId: string,
  classId: string,
  sectionId?: string,
): Promise<StudentFeeSummary[]> {
  const where: Record<string, unknown> = {
    academicSessionId,
    status: { not: 'CANCELLED' },
    studentProfile: { classId, ...(sectionId ? { sectionId } : {}) },
  };

  const assignments = await prisma.feeAssignment.findMany({
    where,
    select: {
      studentProfileId: true,
      totalAmount: true,
      paidAmount: true,
      balanceAmount: true,
      status: true,
      studentProfile: {
        select: {
          rollNumber: true,
          user: { select: { firstName: true, lastName: true } },
          section: { select: { name: true } },
        },
      },
    },
  });

  // Group by student
  const studentMap = new Map<
    string,
    {
      name: string;
      rollNumber: string;
      sectionName: string;
      totalDue: number;
      totalPaid: number;
      balance: number;
      hasPartial: boolean;
      allPaid: boolean;
    }
  >();

  for (const a of assignments) {
    const existing = studentMap.get(a.studentProfileId);
    const due = Number(a.totalAmount);
    const paid = Number(a.paidAmount);
    const bal = Number(a.balanceAmount);

    if (existing) {
      existing.totalDue += due;
      existing.totalPaid += paid;
      existing.balance += bal;
      if (a.status === 'PARTIAL') existing.hasPartial = true;
      if (a.status !== 'PAID' && a.status !== 'WAIVED') existing.allPaid = false;
    } else {
      studentMap.set(a.studentProfileId, {
        name: `${a.studentProfile.user.firstName} ${a.studentProfile.user.lastName}`,
        rollNumber: a.studentProfile.rollNumber,
        sectionName: a.studentProfile.section?.name ?? '',
        totalDue: due,
        totalPaid: paid,
        balance: bal,
        hasPartial: a.status === 'PARTIAL',
        allPaid: a.status === 'PAID' || a.status === 'WAIVED',
      });
    }
  }

  const result: StudentFeeSummary[] = [];
  for (const [id, s] of studentMap) {
    result.push({
      studentProfileId: id,
      studentName: s.name,
      rollNumber: s.rollNumber,
      sectionName: s.sectionName,
      totalDue: s.totalDue,
      totalPaid: s.totalPaid,
      balance: s.balance,
      status: s.allPaid ? 'PAID' : s.hasPartial ? 'PARTIAL' : 'UNPAID',
    });
  }

  return result.sort((a, b) => a.rollNumber.localeCompare(b.rollNumber));
}

// ============================================
// DEFAULTER LIST
// ============================================

export async function getDefaulterList(
  academicSessionId: string,
  classId?: string,
) {
  return prisma.feeAssignment.findMany({
    where: {
      academicSessionId,
      status: { in: ['OVERDUE', 'PENDING'] },
      balanceAmount: { gt: 0 },
      dueDate: { lt: new Date() },
      ...(classId ? { studentProfile: { classId } } : {}),
    },
    include: {
      studentProfile: {
        select: {
          rollNumber: true,
          user: { select: { firstName: true, lastName: true } },
          class: { select: { name: true } },
          section: { select: { name: true } },
        },
      },
      lineItems: { select: { categoryName: true, amount: true } },
    },
    orderBy: [
      { studentProfile: { class: { grade: 'asc' } } },
      { dueDate: 'asc' },
    ],
  });
}

// ============================================
// COLLECTION REPORT (daily/monthly)
// ============================================

export async function getCollectionByDateRange(
  startDate: Date,
  endDate: Date,
  academicSessionId: string,
) {
  return prisma.feePayment.groupBy({
    by: ['paymentMethod'],
    where: {
      status: 'COMPLETED',
      paidAt: { gte: startDate, lte: endDate },
      feeAssignment: { academicSessionId },
    },
    _sum: { amount: true },
    _count: { id: true },
  });
}
