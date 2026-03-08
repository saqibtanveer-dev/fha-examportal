'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import {
  fetchDashboardStatsAction,
  fetchRecentActivityAction,
  fetchPerformanceTrendsAction,
  fetchGradeDistributionAction,
  fetchStudentsListAction,
  fetchTeachersListAction,
  fetchExamsListAction,
  fetchClassesListAction,
  fetchFilterOptionsAction,
} from '@/modules/principal/principal-fetch-actions';

// ── Dashboard Queries ──

export function useDashboardStats() {
  return useQuery({
    queryKey: queryKeys.principal.dashboard.stats(),
    queryFn: fetchDashboardStatsAction,
    staleTime: 5 * 60 * 1000,
  });
}

export function useRecentActivity() {
  return useQuery({
    queryKey: queryKeys.principal.dashboard.activity(),
    queryFn: fetchRecentActivityAction,
    staleTime: 2 * 60 * 1000,
  });
}

export function usePerformanceTrends() {
  return useQuery({
    queryKey: queryKeys.principal.dashboard.trends(),
    queryFn: fetchPerformanceTrendsAction,
    staleTime: 5 * 60 * 1000,
  });
}

export function useGradeDistribution() {
  return useQuery({
    queryKey: queryKeys.principal.dashboard.gradeDistribution(),
    queryFn: fetchGradeDistributionAction,
    staleTime: 5 * 60 * 1000,
  });
}

// ── List Queries ──

export function useStudentsList(params?: {
  search?: string;
  classId?: string;
  sectionId?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}) {
  return useQuery({
    queryKey: queryKeys.principal.students(params ?? {}),
    queryFn: () => fetchStudentsListAction(params),
  });
}

export function useTeachersList(params?: {
  search?: string;
  page?: number;
  pageSize?: number;
}) {
  return useQuery({
    queryKey: queryKeys.principal.teachers(params ?? {}),
    queryFn: () => fetchTeachersListAction(params),
  });
}

export function useExamsList(params?: {
  search?: string;
  status?: string;
  subjectId?: string;
  type?: string;
  page?: number;
  pageSize?: number;
}) {
  return useQuery({
    queryKey: queryKeys.principal.exams(params ?? {}),
    queryFn: () => fetchExamsListAction(params),
  });
}

export function useClassesList() {
  return useQuery({
    queryKey: queryKeys.principal.classes({}),
    queryFn: fetchClassesListAction,
    staleTime: 2 * 60 * 1000,
  });
}

export function useFilterOptions() {
  return useQuery({
    queryKey: queryKeys.principal.filterOptions(),
    queryFn: fetchFilterOptionsAction,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}
