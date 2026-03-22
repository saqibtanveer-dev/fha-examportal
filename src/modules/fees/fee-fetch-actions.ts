'use server';

import { requireRole, assertFamilyStudentAccess } from '@/lib/auth-utils';
import { assertStudentDataAccess } from '@/lib/authorization-guards';
import { serialize } from '@/utils/serialize';
import { prisma } from '@/lib/prisma';
import { safeFetchAction } from '@/lib/safe-action';
import {
  findAllFeeCategories,
  findFeeStructures,
  findStudentAssignments,
  findAssignmentById,
  findPaymentByReceiptNumber,
  findFamilyPayments,
  findFamilyPaymentById,
  findFeeSettings,
  findPendingAssignmentsForStudent,
  getCurrentAcademicSessionId,
} from './fee-queries';
// ── Categories ──
export const fetchFeeCategoriesAction = safeFetchAction(
  async (activeOnly?: boolean) => {
    await requireRole('ADMIN', 'PRINCIPAL');
    return serialize(await findAllFeeCategories(activeOnly));
  },
);

// ── Helper: resolve session ID (explicit or current) ──
async function resolveSessionId(explicit?: string | null): Promise<string | null> {
  if (explicit) return explicit;
  return getCurrentAcademicSessionId();
}

// ── Academic Sessions (for session selector) ──
export const fetchAcademicSessionsAction = safeFetchAction(async () => {
  await requireRole('ADMIN', 'PRINCIPAL');
  return serialize(
    await prisma.academicSession.findMany({
      orderBy: { startDate: 'desc' },
      select: { id: true, name: true, isCurrent: true, startDate: true, endDate: true },
    }),
  );
});

// ── Structures ──
export const fetchFeeStructuresAction = safeFetchAction(
  async (classId?: string, academicSessionId?: string) => {
    await requireRole('ADMIN', 'PRINCIPAL');
    const sessionId = await resolveSessionId(academicSessionId);
    if (!sessionId) return [];
    return serialize(await findFeeStructures(sessionId, classId));
  },
);

// ── Assignments ──
export const fetchStudentAssignmentsAction = safeFetchAction(
  async (studentProfileId: string, month?: string) => {
    const session = await requireRole('ADMIN', 'PRINCIPAL', 'TEACHER', 'STUDENT', 'FAMILY');

    if (session.user.role === 'STUDENT') {
      const profile = await prisma.studentProfile.findFirst({
        where: { userId: session.user.id },
        select: { id: true },
      });
      if (!profile || profile.id !== studentProfileId) {
        throw new Error('Access denied');
      }
    } else if (session.user.role === 'FAMILY') {
      await assertFamilyStudentAccess(session.user.id, studentProfileId);
    } else if (session.user.role === 'TEACHER') {
      await assertStudentDataAccess(session.user.id, 'TEACHER', studentProfileId);
    }

    const sessionId = await getCurrentAcademicSessionId();
    if (!sessionId) return [];
    return serialize(await findStudentAssignments(studentProfileId, sessionId, month));
  },
);

export const fetchAssignmentDetailAction = safeFetchAction(
  async (assignmentId: string) => {
    await requireRole('ADMIN', 'PRINCIPAL');
    return serialize(await findAssignmentById(assignmentId));
  },
);

export const fetchPendingAssignmentsAction = safeFetchAction(
  async (studentProfileId: string) => {
    await requireRole('ADMIN', 'PRINCIPAL');
    const sessionId = await getCurrentAcademicSessionId();
    if (!sessionId) return [];
    return serialize(await findPendingAssignmentsForStudent(studentProfileId, sessionId));
  },
);

// ── Payments ──
export const fetchPaymentByReceiptAction = safeFetchAction(
  async (receiptNumber: string) => {
    await requireRole('ADMIN', 'PRINCIPAL');
    return serialize(await findPaymentByReceiptNumber(receiptNumber));
  },
);

export const fetchFamilyPaymentsAction = safeFetchAction(
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

    return serialize(await findFamilyPayments(familyProfileId));
  },
);

export const fetchFamilyPaymentDetailAction = safeFetchAction(
  async (paymentId: string) => {
    const session = await requireRole('ADMIN', 'FAMILY');
    const payment = await findFamilyPaymentById(paymentId);

    if (session.user.role === 'FAMILY' && payment) {
      const profile = await prisma.familyProfile.findFirst({
        where: { userId: session.user.id },
        select: { id: true },
      });
      if (!profile || payment.familyProfileId !== profile.id) {
        throw new Error('Access denied');
      }
    }

    return serialize(payment);
  },
);

// ── Settings ──
export const fetchFeeSettingsAction = safeFetchAction(async () => {
  await requireRole('ADMIN', 'PRINCIPAL');
  const sessionId = await getCurrentAcademicSessionId();
  if (!sessionId) return null;
  return serialize(await findFeeSettings(sessionId));
});

// ── Family Full Ledger — FamilyPayments + direct student-wise FeePayments ──
// Fixes the bug where student-wise fee collection is invisible in the family ledger.
export const fetchFamilyFullLedgerAction = safeFetchAction(
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
      select: { studentProfileId: true },
    });
    const childIds = links.map((l) => l.studentProfileId);

    const childPaymentSelect = {
      id: true,
      amount: true,
      receiptNumber: true,
      status: true,
      feeAssignment: {
        select: {
          generatedForMonth: true,
          studentProfile: {
            select: { rollNumber: true, user: { select: { firstName: true, lastName: true } } },
          },
        },
      },
    } as const;

    const [familyPayments, directPayments] = await Promise.all([
      prisma.familyPayment.findMany({
        where: { familyProfileId },
        include: {
          recordedBy: { select: { firstName: true, lastName: true } },
          childPayments: {
            select: childPaymentSelect,
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
              id: true,
              amount: true,
              receiptNumber: true,
              paymentMethod: true,
              referenceNumber: true,
              status: true,
              paidAt: true,
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

    return serialize({ familyPayments, directPayments });
  },
);

