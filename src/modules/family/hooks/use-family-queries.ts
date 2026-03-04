'use client';

// ============================================
// Family Module — Query Hooks
// ============================================

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { FAMILY_QUERY_STALE_TIME, FAMILY_DASHBOARD_REFRESH_INTERVAL } from '../family.constants';

import { fetchFamilyProfileAction, fetchLinkedChildrenAction } from '../family-profile-actions';
import { fetchChildDashboardStatsAction, fetchAllChildrenOverviewAction } from '../family-dashboard-actions';
import { fetchChildAttendanceSummaryAction, fetchChildAttendanceRecordsAction } from '../family-attendance-actions';
import { fetchChildExamResultsAction, fetchChildUpcomingExamsAction } from '../family-exam-actions';
import { fetchChildTimetableAction } from '../family-timetable-actions';
import { fetchChildDiaryAction } from '../family-diary-actions';

// ── Profile & Children ──

export function useFamilyProfile(enabled = true) {
  return useQuery({
    queryKey: queryKeys.family.profile(),
    queryFn: () => fetchFamilyProfileAction(),
    staleTime: FAMILY_QUERY_STALE_TIME,
    enabled,
  });
}

export function useLinkedChildren(enabled = true) {
  return useQuery({
    queryKey: queryKeys.family.children('me'),
    queryFn: () => fetchLinkedChildrenAction(),
    staleTime: FAMILY_QUERY_STALE_TIME,
    enabled,
  });
}

// ── Dashboard ──

export function useAllChildrenOverview(enabled = true) {
  return useQuery({
    queryKey: queryKeys.family.dashboard('all'),
    queryFn: () => fetchAllChildrenOverviewAction(),
    staleTime: FAMILY_QUERY_STALE_TIME,
    refetchInterval: FAMILY_DASHBOARD_REFRESH_INTERVAL,
    enabled,
  });
}

export function useChildDashboardStats(childId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.family.dashboard(childId),
    queryFn: () => fetchChildDashboardStatsAction(childId),
    staleTime: FAMILY_QUERY_STALE_TIME,
    enabled: enabled && !!childId,
  });
}

// ── Attendance ──

export function useChildAttendanceSummary(childId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.family.childAttendance(childId),
    queryFn: () => fetchChildAttendanceSummaryAction(childId),
    staleTime: FAMILY_QUERY_STALE_TIME,
    enabled: enabled && !!childId,
  });
}

export function useChildAttendanceRecords(
  childId: string,
  startDate?: string,
  endDate?: string,
  enabled = true,
) {
  return useQuery({
    queryKey: [...queryKeys.family.childAttendance(childId), 'records', startDate, endDate],
    queryFn: () => fetchChildAttendanceRecordsAction(childId, startDate, endDate),
    staleTime: FAMILY_QUERY_STALE_TIME,
    enabled: enabled && !!childId,
  });
}

// ── Exams & Results ──

export function useChildExamResults(childId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.family.childResults(childId),
    queryFn: () => fetchChildExamResultsAction(childId),
    staleTime: FAMILY_QUERY_STALE_TIME,
    enabled: enabled && !!childId,
  });
}

export function useChildUpcomingExams(childId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.family.childExams(childId),
    queryFn: () => fetchChildUpcomingExamsAction(childId),
    staleTime: FAMILY_QUERY_STALE_TIME,
    enabled: enabled && !!childId,
  });
}

// ── Timetable ──

export function useChildTimetable(childId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.family.childTimetable(childId),
    queryFn: () => fetchChildTimetableAction(childId),
    staleTime: FAMILY_QUERY_STALE_TIME,
    enabled: enabled && !!childId,
  });
}

// ── Diary ──

export function useChildDiary(
  childId: string,
  startDate?: string,
  endDate?: string,
  subjectId?: string,
  enabled = true,
) {
  return useQuery({
    queryKey: [...queryKeys.family.childDiary(childId), startDate, endDate, subjectId],
    queryFn: () => fetchChildDiaryAction(childId, startDate, endDate, subjectId),
    staleTime: FAMILY_QUERY_STALE_TIME,
    enabled: enabled && !!childId,
  });
}
