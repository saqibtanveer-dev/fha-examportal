'use server';

import {
  getPrincipalDashboardStats,
  getRecentActivity,
  getPerformanceTrends,
  getGradeDistributionOverall,
  getStudentsList,
  getTeachersList,
  getExamsList,
  getClassesList,
  getFilterOptions,
} from '@/modules/principal/principal-queries';
import { requireRole } from '@/lib/auth-utils';
import { serialize } from '@/utils/serialize';
import { safeFetchAction } from '@/lib/safe-action';

export const fetchDashboardStatsAction = safeFetchAction(async () => {
  await requireRole('PRINCIPAL');
  return serialize(await getPrincipalDashboardStats());
});

export const fetchRecentActivityAction = safeFetchAction(async () => {
  await requireRole('PRINCIPAL');
  return serialize(await getRecentActivity());
});

export const fetchPerformanceTrendsAction = safeFetchAction(async () => {
  await requireRole('PRINCIPAL');
  return serialize(await getPerformanceTrends());
});

export const fetchGradeDistributionAction = safeFetchAction(async () => {
  await requireRole('PRINCIPAL');
  return serialize(await getGradeDistributionOverall());
});

export const fetchStudentsListAction = safeFetchAction(async (params?: {
  search?: string;
  classId?: string;
  sectionId?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}) => {
  await requireRole('PRINCIPAL');
  return serialize(await getStudentsList(params));
});

export const fetchTeachersListAction = safeFetchAction(async (params?: {
  search?: string;
  page?: number;
  pageSize?: number;
}) => {
  await requireRole('PRINCIPAL');
  return serialize(await getTeachersList(params));
});

export const fetchExamsListAction = safeFetchAction(async (params?: {
  search?: string;
  status?: string;
  subjectId?: string;
  type?: string;
  page?: number;
  pageSize?: number;
}) => {
  await requireRole('PRINCIPAL');
  return serialize(await getExamsList(params));
});

export const fetchClassesListAction = safeFetchAction(async () => {
  await requireRole('PRINCIPAL');
  return serialize(await getClassesList());
});

export const fetchFilterOptionsAction = safeFetchAction(async () => {
  await requireRole('PRINCIPAL');
  return serialize(await getFilterOptions());
});
