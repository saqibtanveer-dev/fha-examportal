'use server';

import { requireRole } from '@/lib/auth-utils';
import { safeFetchAction } from '@/lib/safe-action';
import { serialize } from '@/utils/serialize';
import { prisma } from '@/lib/prisma';
import { findAllStudentDiscounts } from './student-discount-queries';
import { getCurrentAcademicSessionId } from './fee-queries';

export const fetchStudentDiscountsAction = safeFetchAction(
  async (studentProfileId: string) => {
    await requireRole('ADMIN', 'PRINCIPAL');
    const sessionId = await getCurrentAcademicSessionId();
    if (!sessionId) return [];
    return serialize(await findAllStudentDiscounts(studentProfileId, sessionId));
  },
);

export const fetchStudentCreditsAction = safeFetchAction(
  async (studentProfileId: string) => {
    await requireRole('ADMIN', 'PRINCIPAL');
    const credits = await prisma.feeCredit.findMany({
      where: { studentProfileId, status: 'ACTIVE', remainingAmount: { gt: 0 } },
      orderBy: { createdAt: 'desc' },
      select: { id: true, amount: true, remainingAmount: true, reason: true, status: true, createdAt: true },
    });
    return serialize(credits);
  },
);

export const fetchStudentFeeAmountsAction = safeFetchAction(
  async (studentProfileId: string) => {
    await requireRole('ADMIN', 'PRINCIPAL');
    const sessionId = await getCurrentAcademicSessionId();
    if (!sessionId) return { total: 0, categories: [] as { id: string; name: string; amount: number }[] };

    const student = await prisma.studentProfile.findUnique({
      where: { id: studentProfileId },
      select: { classId: true },
    });
    if (!student?.classId) return { total: 0, categories: [] as { id: string; name: string; amount: number }[] };

    const structures = await prisma.feeStructure.findMany({
      where: { academicSessionId: sessionId, classId: student.classId, isActive: true },
      select: { amount: true, category: { select: { id: true, name: true } } },
    });

    const categories = structures.map((s) => ({
      id: s.category.id,
      name: s.category.name,
      amount: Number(s.amount),
    }));
    return { total: categories.reduce((sum, c) => sum + c.amount, 0), categories };
  },
);

export const fetchStudentLedgerAction = safeFetchAction(
  async (studentProfileId: string) => {
    await requireRole('ADMIN', 'PRINCIPAL');
    const sessionId = await getCurrentAcademicSessionId();
    if (!sessionId) return { assignments: [], credits: [] };

    const [assignments, credits] = await Promise.all([
      prisma.feeAssignment.findMany({
        where: { studentProfileId, academicSessionId: sessionId, status: { not: 'CANCELLED' } },
        include: {
          lineItems: { select: { id: true, categoryName: true, amount: true } },
          payments: {
            where: { status: 'COMPLETED' },
            orderBy: { paidAt: 'desc' },
            select: {
              id: true,
              amount: true,
              paymentMethod: true,
              referenceNumber: true,
              receiptNumber: true,
              paidAt: true,
              recordedBy: { select: { firstName: true, lastName: true } },
            },
          },
          discounts: {
            select: {
              id: true,
              amount: true,
              reason: true,
              createdAt: true,
              appliedBy: { select: { firstName: true, lastName: true } },
            },
          },
        },
        orderBy: { generatedForMonth: 'asc' },
      }),
      prisma.feeCredit.findMany({
        where: { studentProfileId, academicSession: { id: sessionId } },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          amount: true,
          remainingAmount: true,
          reason: true,
          status: true,
          referenceNumber: true,
          createdAt: true,
        },
      }),
    ]);

    return serialize({ assignments, credits });
  },
);
