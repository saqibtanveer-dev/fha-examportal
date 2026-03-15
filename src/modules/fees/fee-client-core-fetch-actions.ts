'use server';

import { requireRole, assertFamilyStudentAccess } from '@/lib/auth-utils';
import { assertStudentDataAccess } from '@/lib/authorization-guards';
import { safeFetchAction } from '@/lib/safe-action';
import { serialize } from '@/utils/serialize';
import { prisma } from '@/lib/prisma';
import {
  findAllFeeCategories,
  findFeeStructures,
  findStudentAssignments,
  findAssignmentById,
  findFamilyPayments,
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

async function resolveSessionId(explicit?: string | null): Promise<string | null> {
  if (explicit) return explicit;
  return getCurrentAcademicSessionId();
}

const fetchFeeCategories = safeFetchAction(async (activeOnly?: boolean) => {
  await requireRole('ADMIN', 'PRINCIPAL');
  return serialize(await findAllFeeCategories(activeOnly));
});

export async function fetchFeeCategoriesAction(activeOnly?: boolean) {
  return fetchFeeCategories(activeOnly);
}

const fetchFeeStructures = safeFetchAction(async (classId?: string, academicSessionId?: string) => {
  await requireRole('ADMIN', 'PRINCIPAL');
  const sessionId = await resolveSessionId(academicSessionId);
  if (!sessionId) return [];
  return serialize(await findFeeStructures(sessionId, classId));
});

export async function fetchFeeStructuresAction(classId?: string, academicSessionId?: string) {
  return fetchFeeStructures(classId, academicSessionId);
}

const fetchFeeSettings = safeFetchAction(async () => {
  await requireRole('ADMIN', 'PRINCIPAL');
  const sessionId = await getCurrentAcademicSessionId();
  if (!sessionId) return null;
  return serialize(await findFeeSettings(sessionId));
});

export async function fetchFeeSettingsAction() {
  return fetchFeeSettings();
}

const fetchFeeOverview = safeFetchAction(async (academicSessionId?: string) => {
  await requireRole('ADMIN', 'PRINCIPAL');
  const sessionId = await resolveSessionId(academicSessionId);
  if (!sessionId) return null;
  return getFeeOverview(sessionId);
});

export async function fetchFeeOverviewAction(academicSessionId?: string) {
  return fetchFeeOverview(academicSessionId);
}

const fetchClassWiseSummary = safeFetchAction(async (academicSessionId?: string) => {
  await requireRole('ADMIN', 'PRINCIPAL');
  const sessionId = await resolveSessionId(academicSessionId);
  if (!sessionId) return [];
  return getClassWiseSummary(sessionId);
});

export async function fetchClassWiseSummaryAction(academicSessionId?: string) {
  return fetchClassWiseSummary(academicSessionId);
}

const fetchSectionWiseSummary = safeFetchAction(async (classId: string, academicSessionId?: string) => {
  await requireRole('ADMIN', 'PRINCIPAL');
  const sessionId = await resolveSessionId(academicSessionId);
  if (!sessionId) return [];
  return getSectionWiseSummary(sessionId, classId);
});

export async function fetchSectionWiseSummaryAction(classId: string, academicSessionId?: string) {
  return fetchSectionWiseSummary(classId, academicSessionId);
}

const fetchStudentWiseSummary = safeFetchAction(async (
  classId: string,
  sectionId?: string,
  academicSessionId?: string,
) => {
  await requireRole('ADMIN', 'PRINCIPAL');
  const sessionId = await resolveSessionId(academicSessionId);
  if (!sessionId) return [];
  return getStudentWiseSummary(sessionId, classId, sectionId);
});

export async function fetchStudentWiseSummaryAction(classId: string, sectionId?: string, academicSessionId?: string) {
  return fetchStudentWiseSummary(classId, sectionId, academicSessionId);
}

const fetchDefaulterList = safeFetchAction(async (classId?: string, academicSessionId?: string) => {
  await requireRole('ADMIN', 'PRINCIPAL');
  const sessionId = await resolveSessionId(academicSessionId);
  if (!sessionId) return [];
  return serialize(await getDefaulterList(sessionId, classId));
});

export async function fetchDefaulterListAction(classId?: string, academicSessionId?: string) {
  return fetchDefaulterList(classId, academicSessionId);
}

const fetchCollectionReport = safeFetchAction(async (
  startDate: string,
  endDate: string,
  academicSessionId?: string,
) => {
  await requireRole('ADMIN', 'PRINCIPAL');
  const sessionId = await resolveSessionId(academicSessionId);
  if (!sessionId) return [];
  return serialize(await getCollectionByDateRange(
    new Date(startDate + 'T00:00:00.000Z'),
    new Date(endDate + 'T23:59:59.999Z'),
    sessionId,
  ));
});

export async function fetchCollectionReportAction(startDate: string, endDate: string, academicSessionId?: string) {
  return fetchCollectionReport(startDate, endDate, academicSessionId);
}

const fetchStudentAssignments = safeFetchAction(async (studentProfileId: string, month?: string) => {
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
});

export async function fetchStudentAssignmentsAction(studentProfileId: string, month?: string) {
  return fetchStudentAssignments(studentProfileId, month);
}

const fetchFamilyPayments = safeFetchAction(async (familyProfileId: string) => {
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
});

export async function fetchFamilyPaymentsAction(familyProfileId: string) {
  return fetchFamilyPayments(familyProfileId);
}

const fetchPendingAssignments = safeFetchAction(async (studentProfileId: string) => {
  await requireRole('ADMIN', 'PRINCIPAL');
  const sessionId = await getCurrentAcademicSessionId();
  if (!sessionId) return [];
  return serialize(await findPendingAssignmentsForStudent(studentProfileId, sessionId));
});

export async function fetchPendingAssignmentsAction(studentProfileId: string) {
  return fetchPendingAssignments(studentProfileId);
}

const fetchAssignmentDetail = safeFetchAction(async (assignmentId: string) => {
  await requireRole('ADMIN', 'PRINCIPAL');
  return serialize(await findAssignmentById(assignmentId));
});

export async function fetchAssignmentDetailAction(assignmentId: string) {
  return fetchAssignmentDetail(assignmentId);
}
