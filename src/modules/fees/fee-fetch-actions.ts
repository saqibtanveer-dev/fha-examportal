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

// ── Structures ──
export const fetchFeeStructuresAction = safeFetchAction(
  async (classId?: string) => {
    await requireRole('ADMIN', 'PRINCIPAL');
    const sessionId = await getCurrentAcademicSessionId();
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
export const fetchFeeOverviewAction = safeFetchAction(async () => {
  await requireRole('ADMIN', 'PRINCIPAL');
  const sessionId = await getCurrentAcademicSessionId();
  if (!sessionId) return null;
  return await getFeeOverview(sessionId);
});

export const fetchClassWiseSummaryAction = safeFetchAction(async () => {
  await requireRole('ADMIN', 'PRINCIPAL');
  const sessionId = await getCurrentAcademicSessionId();
  if (!sessionId) return [];
  return await getClassWiseSummary(sessionId);
});

export const fetchSectionWiseSummaryAction = safeFetchAction(
  async (classId: string) => {
    await requireRole('ADMIN', 'PRINCIPAL');
    const sessionId = await getCurrentAcademicSessionId();
    if (!sessionId) return [];
    return await getSectionWiseSummary(sessionId, classId);
  },
);

export const fetchStudentWiseSummaryAction = safeFetchAction(
  async (classId: string, sectionId?: string) => {
    await requireRole('ADMIN', 'PRINCIPAL');
    const sessionId = await getCurrentAcademicSessionId();
    if (!sessionId) return [];
    return await getStudentWiseSummary(sessionId, classId, sectionId);
  },
);

export const fetchDefaulterListAction = safeFetchAction(
  async (classId?: string) => {
    await requireRole('ADMIN', 'PRINCIPAL');
    const sessionId = await getCurrentAcademicSessionId();
    if (!sessionId) return [];
    return serialize(await getDefaulterList(sessionId, classId));
  },
);

export const fetchCollectionReportAction = safeFetchAction(
  async (startDate: string, endDate: string) => {
    await requireRole('ADMIN', 'PRINCIPAL');
    const sessionId = await getCurrentAcademicSessionId();
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


