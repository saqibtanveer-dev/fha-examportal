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
import {
  findAllStudentDiscounts,
} from './student-discount-queries';
import {
  getFeeOverview,
  getClassWiseSummary,
  getSectionWiseSummary,
  getStudentWiseSummary,
  getDefaulterList,
  getCollectionByDateRange,
} from './fee-report-queries';

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

// ── Reports ──
export const fetchFeeOverviewAction = safeFetchAction(
  async (academicSessionId?: string) => {
    await requireRole('ADMIN', 'PRINCIPAL');
    const sessionId = await resolveSessionId(academicSessionId);
    if (!sessionId) return null;
    return await getFeeOverview(sessionId);
  },
);

export const fetchClassWiseSummaryAction = safeFetchAction(
  async (academicSessionId?: string) => {
    await requireRole('ADMIN', 'PRINCIPAL');
    const sessionId = await resolveSessionId(academicSessionId);
    if (!sessionId) return [];
    return await getClassWiseSummary(sessionId);
  },
);

export const fetchSectionWiseSummaryAction = safeFetchAction(
  async (classId: string, academicSessionId?: string) => {
    await requireRole('ADMIN', 'PRINCIPAL');
    const sessionId = await resolveSessionId(academicSessionId);
    if (!sessionId) return [];
    return await getSectionWiseSummary(sessionId, classId);
  },
);

export const fetchStudentWiseSummaryAction = safeFetchAction(
  async (classId: string, sectionId?: string, academicSessionId?: string) => {
    await requireRole('ADMIN', 'PRINCIPAL');
    const sessionId = await resolveSessionId(academicSessionId);
    if (!sessionId) return [];
    return await getStudentWiseSummary(sessionId, classId, sectionId);
  },
);

export const fetchDefaulterListAction = safeFetchAction(
  async (classId?: string, academicSessionId?: string) => {
    await requireRole('ADMIN', 'PRINCIPAL');
    const sessionId = await resolveSessionId(academicSessionId);
    if (!sessionId) return [];
    return serialize(await getDefaulterList(sessionId, classId));
  },
);

export const fetchCollectionReportAction = safeFetchAction(
  async (startDate: string, endDate: string, academicSessionId?: string) => {
    await requireRole('ADMIN', 'PRINCIPAL');
    const sessionId = await resolveSessionId(academicSessionId);
    if (!sessionId) return [];
    return serialize(
      await getCollectionByDateRange(
        new Date(startDate + 'T00:00:00.000Z'),
        new Date(endDate + 'T23:59:59.999Z'),
        sessionId,
      ),
    );
  },
);

// ── Student Permanent Discounts ──
export const fetchStudentDiscountsAction = safeFetchAction(
  async (studentProfileId: string) => {
    await requireRole('ADMIN', 'PRINCIPAL');
    const sessionId = await getCurrentAcademicSessionId();
    if (!sessionId) return [];
    return serialize(await findAllStudentDiscounts(studentProfileId, sessionId));
  },
);

// ── Student Credits (advance payments) ──
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

// ── Student fee structure amounts (for discount dialog context) ──
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
      id: s.category.id, name: s.category.name, amount: Number(s.amount),
    }));
    return { total: categories.reduce((sum, c) => sum + c.amount, 0), categories };
  },
);

// ── Full student payment ledger (all months, payments, discounts, credits) ──
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
              id: true, amount: true, paymentMethod: true, referenceNumber: true,
              receiptNumber: true, paidAt: true,
              recordedBy: { select: { firstName: true, lastName: true } },
            },
          },
          discounts: {
            select: {
              id: true, amount: true, reason: true, createdAt: true,
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
          id: true, amount: true, remainingAmount: true, reason: true,
          status: true, referenceNumber: true, createdAt: true,
        },
      }),
    ]);

    return serialize({ assignments, credits });
  },
);
