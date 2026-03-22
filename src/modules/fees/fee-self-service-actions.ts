'use server';

import { requireRole } from '@/lib/auth-utils';
import { serialize } from '@/utils/serialize';
import { prisma } from '@/lib/prisma';
import { safeFetchAction } from '@/lib/safe-action';
import { findStudentAssignments, getCurrentAcademicSessionId } from './fee-queries';

// ── Family Children with Pending Fees ──
export const fetchFamilyChildrenWithFeesAction = safeFetchAction(
  async (familyProfileId: string) => {
    const session = await requireRole('ADMIN', 'FAMILY');

    if (session.user.role === 'FAMILY') {
      const profile = await prisma.familyProfile.findFirst({
        where: { userId: session.user.id },
        select: { id: true },
      });
      if (!profile || profile.id !== familyProfileId) {
        throw new Error('Access denied');
      }
    }

    const links = await prisma.familyStudentLink.findMany({
      where: { familyProfileId, isActive: true },
      include: {
        studentProfile: {
          select: {
            id: true, rollNumber: true,
            user: { select: { firstName: true, lastName: true } },
            class: { select: { name: true } },
          },
        },
      },
    });

    const sessionId = await getCurrentAcademicSessionId();
    if (!sessionId) return [];

    const childIds = links.map((l) => l.studentProfile.id);
    const allAssignments = await prisma.feeAssignment.findMany({
      where: {
        studentProfileId: { in: childIds },
        academicSessionId: sessionId,
        status: { in: ['PENDING', 'PARTIAL', 'OVERDUE'] },
        balanceAmount: { gt: 0 },
      },
      include: { lineItems: { select: { id: true, categoryName: true, amount: true } } },
      orderBy: [{ generatedForMonth: 'asc' }, { dueDate: 'asc' }],
    });

    const byStudent = new Map<string, typeof allAssignments>();
    for (const a of allAssignments) {
      const list = byStudent.get(a.studentProfileId) ?? [];
      list.push(a);
      byStudent.set(a.studentProfileId, list);
    }

    return links.map((link) => ({
      child: serialize(link.studentProfile),
      assignments: serialize(byStudent.get(link.studentProfile.id) ?? []),
    }));
  },
);

// ── Student Self-Service ──
export const fetchMyFeesAction = safeFetchAction(async () => {
  const session = await requireRole('STUDENT');
  const profile = await prisma.studentProfile.findFirst({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!profile) return [];

  const sessionId = await getCurrentAcademicSessionId();
  if (!sessionId) return [];
  return serialize(await findStudentAssignments(profile.id, sessionId));
});

// ── Student Self-Service: fees WITH payment transactions (for receipt history view) ──
export const fetchMyFeesWithPaymentsAction = safeFetchAction(async () => {
  const session = await requireRole('STUDENT');
  const profile = await prisma.studentProfile.findFirst({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!profile) return [];

  const sessionId = await getCurrentAcademicSessionId();
  if (!sessionId) return [];

  const assignments = await prisma.feeAssignment.findMany({
    where: { studentProfileId: profile.id, academicSessionId: sessionId, status: { not: 'CANCELLED' } },
    include: {
      lineItems: { select: { id: true, categoryName: true, amount: true } },
      payments: {
        where: { status: { in: ['COMPLETED', 'REVERSED'] } },
        orderBy: { paidAt: 'desc' },
        select: {
          id: true, amount: true, paymentMethod: true,
          referenceNumber: true, receiptNumber: true, status: true, paidAt: true,
        },
      },
    },
    orderBy: [{ generatedForMonth: 'asc' }, { dueDate: 'asc' }],
  });
  return serialize(assignments);
});

// ── Student Credit Balance ──
export const fetchMyCreditBalanceAction = safeFetchAction(async () => {
  const session = await requireRole('STUDENT');
  const profile = await prisma.studentProfile.findFirst({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!profile) return 0;

  const credits = await prisma.feeCredit.findMany({
    where: { studentProfileId: profile.id, status: 'ACTIVE', remainingAmount: { gt: 0 } },
    select: { remainingAmount: true },
  });
  return credits.reduce((sum, c) => sum + Number(c.remainingAmount), 0);
});

// ── Family Self-Service ──
export const fetchFamilyFeesOverviewAction = safeFetchAction(async () => {
  const session = await requireRole('FAMILY');

  const profile = await prisma.familyProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      studentLinks: {
        where: { isActive: true },
        include: {
          studentProfile: {
            select: {
              id: true, rollNumber: true,
              user: { select: { firstName: true, lastName: true } },
              class: { select: { name: true } },
            },
          },
        },
      },
    },
  });

  if (!profile) throw new Error('Family profile not found');

  const sessionId = await getCurrentAcademicSessionId();
  if (!sessionId) return { children: [], familyPayments: [], directPayments: [] };

  // Batch fetch all assignments for all children at once (avoids N+1)
  const childIds = profile.studentLinks.map((l) => l.studentProfile.id);
  const allAssignments = await prisma.feeAssignment.findMany({
    where: { studentProfileId: { in: childIds }, academicSessionId: sessionId, status: { not: 'CANCELLED' } },
    include: {
      lineItems: { select: { id: true, categoryName: true, amount: true } },
      discounts: { select: { amount: true, source: true } },
    },
    orderBy: [{ generatedForMonth: 'asc' }, { dueDate: 'asc' }],
  });
  const byStudent = new Map<string, typeof allAssignments>();
  for (const a of allAssignments) {
    const list = byStudent.get(a.studentProfileId) ?? [];
    list.push(a);
    byStudent.set(a.studentProfileId, list);
  }

  const children = profile.studentLinks.map((link) => ({
    child: serialize(link.studentProfile),
    assignments: serialize(byStudent.get(link.studentProfile.id) ?? []),
  }));

  const [familyPayments, directPayments] = await Promise.all([
    prisma.familyPayment.findMany({
      where: { familyProfileId: profile.id },
      include: {
        recordedBy: { select: { firstName: true, lastName: true } },
        childPayments: {
          include: {
            feeAssignment: {
              select: {
                generatedForMonth: true,
                studentProfile: {
                  select: { rollNumber: true, user: { select: { firstName: true, lastName: true } } },
                },
              },
            },
          },
        },
      },
      orderBy: { paidAt: 'desc' },
      take: 100,
    }),
    childIds.length > 0
      ? prisma.feePayment.findMany({
          where: {
            familyPaymentId: null,
            status: { in: ['COMPLETED', 'REVERSED'] },
            feeAssignment: { studentProfileId: { in: childIds } },
          },
          select: {
            id: true, amount: true, receiptNumber: true,
            paymentMethod: true, referenceNumber: true, status: true, paidAt: true,
            recordedBy: { select: { firstName: true, lastName: true } },
            feeAssignment: {
              select: {
                generatedForMonth: true,
                studentProfile: {
                  select: { rollNumber: true, user: { select: { firstName: true, lastName: true } } },
                },
              },
            },
          },
          orderBy: { paidAt: 'desc' },
          take: 100,
        })
      : Promise.resolve([]),
  ]);

  return { children, familyPayments: serialize(familyPayments), directPayments: serialize(directPayments) };
});

// ── Family Fee Summary — lightweight for dashboard widget ──
export const fetchFamilyFeesSummaryAction = safeFetchAction(async () => {
  const session = await requireRole('FAMILY');

  const profile = await prisma.familyProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      studentLinks: {
        where: { isActive: true },
        select: { studentProfileId: true },
      },
    },
  });

  if (!profile) throw new Error('Family profile not found');

  const sessionId = await getCurrentAcademicSessionId();
  if (!sessionId) return { totalBalance: 0, overdueCount: 0, childrenWithDues: 0, totalChildren: 0 };

  const childIds = profile.studentLinks.map((l) => l.studentProfileId);
  if (childIds.length === 0) return { totalBalance: 0, overdueCount: 0, childrenWithDues: 0, totalChildren: 0 };

  const [summary, overdueCount, childrenWithDuesData] = await Promise.all([
    prisma.feeAssignment.aggregate({
      where: {
        studentProfileId: { in: childIds },
        academicSessionId: sessionId,
        status: { notIn: ['CANCELLED', 'PAID', 'WAIVED'] },
        balanceAmount: { gt: 0 },
      },
      _sum: { balanceAmount: true },
    }),
    prisma.feeAssignment.count({
      where: {
        studentProfileId: { in: childIds },
        academicSessionId: sessionId,
        status: 'OVERDUE',
        balanceAmount: { gt: 0 },
      },
    }),
    prisma.feeAssignment.findMany({
      where: {
        studentProfileId: { in: childIds },
        academicSessionId: sessionId,
        status: { notIn: ['CANCELLED', 'PAID', 'WAIVED'] },
        balanceAmount: { gt: 0 },
      },
      select: { studentProfileId: true },
      distinct: ['studentProfileId'],
    }),
  ]);

  return {
    totalBalance: Number(summary._sum.balanceAmount ?? 0),
    overdueCount,
    childrenWithDues: childrenWithDuesData.length,
    totalChildren: childIds.length,
  };
});
