'use client';

import { useQuery } from '@tanstack/react-query';
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

// =============================================
// Dashboard Queries
// =============================================

/**
 * Dashboard stats (counts, totals).
 */
export function useDashboardStats() {
  return useQuery({
    queryKey: ['principal', 'dashboard', 'stats'],
    queryFn: fetchDashboardStatsAction,
    staleTime: 10 * 60 * 1000, // 10 minutes — dashboard data rarely changes
  });
}

/**
 * Recent activity feed.
 */
export function useRecentActivity() {
  return useQuery({
    queryKey: ['principal', 'dashboard', 'activity'],
    queryFn: fetchRecentActivityAction,
    staleTime: 2 * 60 * 1000, // 2 minutes — activity updates more often
  });
}

/**
 * Performance trends (monthly averages).
 */
export function usePerformanceTrends() {
  return useQuery({
    queryKey: ['principal', 'dashboard', 'trends'],
    queryFn: fetchPerformanceTrendsAction,
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Grade distribution chart data.
 */
export function useGradeDistribution() {
  return useQuery({
    queryKey: ['principal', 'dashboard', 'gradeDistribution'],
    queryFn: fetchGradeDistributionAction,
    staleTime: 10 * 60 * 1000,
  });
}

// =============================================
// List Queries
// =============================================

/**
 * Students list with pagination and filtering.
 */
export function useStudentsList(params?: {
  search?: string;
  classId?: string;
  sectionId?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}) {
  return useQuery({
    queryKey: ['principal', 'students', params ?? {}],
    queryFn: () => fetchStudentsListAction(params),
  });
}

/**
 * Teachers list with pagination and filtering.
 */
export function useTeachersList(params?: {
  search?: string;
  page?: number;
  pageSize?: number;
}) {
  return useQuery({
    queryKey: ['principal', 'teachers', params ?? {}],
    queryFn: () => fetchTeachersListAction(params),
  });
}

/**
 * Exams list with pagination and filtering.
 */
export function useExamsList(params?: {
  search?: string;
  status?: string;
  subjectId?: string;
  type?: string;
  page?: number;
  pageSize?: number;
}) {
  return useQuery({
    queryKey: ['principal', 'exams', params ?? {}],
    queryFn: () => fetchExamsListAction(params),
  });
}

/**
 * Classes list.
 */
export function useClassesList() {
  return useQuery({
    queryKey: ['principal', 'classes'],
    queryFn: fetchClassesListAction,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Filter options (subjects, classes, sections).
 * Cached for 30 minutes since these rarely change.
 */
export function useFilterOptions() {
  return useQuery({
    queryKey: ['principal', 'filterOptions'],
    queryFn: fetchFilterOptionsAction,
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });
}
