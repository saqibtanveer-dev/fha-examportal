'use server';

import { requireRole } from '@/lib/auth-utils';
import { safeFetchAction } from '@/lib/safe-action';
import { serialize } from '@/utils/serialize';
import {
  getFeeOverview,
  getClassWiseSummary,
  getSectionWiseSummary,
  getStudentWiseSummary,
  getDefaulterList,
  getCollectionByDateRange,
} from './fee-report-queries';
import { getCurrentAcademicSessionId } from './fee-queries';

async function resolveSessionId(explicit?: string | null): Promise<string | null> {
  if (explicit) return explicit;
  return getCurrentAcademicSessionId();
}

export const fetchFeeOverviewAction = safeFetchAction(
  async (academicSessionId?: string) => {
    await requireRole('ADMIN', 'PRINCIPAL');
    const sessionId = await resolveSessionId(academicSessionId);
    if (!sessionId) return null;
    return getFeeOverview(sessionId);
  },
);

export const fetchClassWiseSummaryAction = safeFetchAction(
  async (academicSessionId?: string) => {
    await requireRole('ADMIN', 'PRINCIPAL');
    const sessionId = await resolveSessionId(academicSessionId);
    if (!sessionId) return [];
    return getClassWiseSummary(sessionId);
  },
);

export const fetchSectionWiseSummaryAction = safeFetchAction(
  async (classId: string, academicSessionId?: string) => {
    await requireRole('ADMIN', 'PRINCIPAL');
    const sessionId = await resolveSessionId(academicSessionId);
    if (!sessionId) return [];
    return getSectionWiseSummary(sessionId, classId);
  },
);

export const fetchStudentWiseSummaryAction = safeFetchAction(
  async (classId: string, sectionId?: string, academicSessionId?: string) => {
    await requireRole('ADMIN', 'PRINCIPAL');
    const sessionId = await resolveSessionId(academicSessionId);
    if (!sessionId) return [];
    return getStudentWiseSummary(sessionId, classId, sectionId);
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
