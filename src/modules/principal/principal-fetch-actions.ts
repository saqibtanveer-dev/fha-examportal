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

/**
 * Fetch principal dashboard stats.
 */
export async function fetchDashboardStatsAction() {
  await requireRole('PRINCIPAL');
  const stats = await getPrincipalDashboardStats();
  return serialize(stats);
}

/**
 * Fetch recent activity for principal dashboard.
 */
export async function fetchRecentActivityAction() {
  await requireRole('PRINCIPAL');
  const activity = await getRecentActivity();
  return serialize(activity);
}

/**
 * Fetch performance trends for principal dashboard.
 */
export async function fetchPerformanceTrendsAction() {
  await requireRole('PRINCIPAL');
  const trends = await getPerformanceTrends();
  return serialize(trends);
}

/**
 * Fetch grade distribution for principal dashboard.
 */
export async function fetchGradeDistributionAction() {
  await requireRole('PRINCIPAL');
  const distribution = await getGradeDistributionOverall();
  return serialize(distribution);
}

/**
 * Fetch students list with pagination and filters.
 */
export async function fetchStudentsListAction(params?: {
  search?: string;
  classId?: string;
  sectionId?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}) {
  await requireRole('PRINCIPAL');
  const result = await getStudentsList(params);
  return serialize(result);
}

/**
 * Fetch teachers list with pagination and filters.
 */
export async function fetchTeachersListAction(params?: {
  search?: string;
  page?: number;
  pageSize?: number;
}) {
  await requireRole('PRINCIPAL');
  const result = await getTeachersList(params);
  return serialize(result);
}

/**
 * Fetch exams list with pagination and filters.
 */
export async function fetchExamsListAction(params?: {
  search?: string;
  status?: string;
  subjectId?: string;
  type?: string;
  page?: number;
  pageSize?: number;
}) {
  await requireRole('PRINCIPAL');
  const result = await getExamsList(params);
  return serialize(result);
}

/**
 * Fetch classes list.
 */
export async function fetchClassesListAction() {
  await requireRole('PRINCIPAL');
  const result = await getClassesList();
  return serialize(result);
}

/**
 * Fetch filter options (subjects, classes, sections) — cached in reference store.
 */
export async function fetchFilterOptionsAction() {
  await requireRole('PRINCIPAL');
  const options = await getFilterOptions();
  return serialize(options);
}
