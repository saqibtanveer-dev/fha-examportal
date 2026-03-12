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
        status: { not: 'CANCELLED' },
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
  if (!sessionId) return { children: [], familyPayments: [] };

  // Batch fetch all assignments for all children at once (avoids N+1)
  const childIds = profile.studentLinks.map((l) => l.studentProfile.id);
  const allAssignments = await prisma.feeAssignment.findMany({
    where: { studentProfileId: { in: childIds }, academicSessionId: sessionId, status: { not: 'CANCELLED' } },
    include: { lineItems: { select: { id: true, categoryName: true, amount: true } } },
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

  const familyPayments = serialize(
    await prisma.familyPayment.findMany({
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
      take: 50,
    }),
  );

  return { children, familyPayments };
});
