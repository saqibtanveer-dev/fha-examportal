'use client';

// ============================================
// Family Module — Query Hooks
// ============================================

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { FAMILY_QUERY_STALE_TIME, FAMILY_DASHBOARD_REFRESH_INTERVAL } from '../family.constants';

import { fetchFamilyProfileAction, fetchLinkedChildrenAction } from '../family-profile-actions';
import { fetchChildDashboardStatsAction, fetchAllChildrenOverviewAction } from '../family-dashboard-actions';
import { fetchChildUpcomingExamsAction } from '../family-exam-actions';
import { fetchChildResultsWithAnalyticsAction } from '../family-results-actions';
import { fetchChildDiaryForFamilyAction, fetchChildTodayDiaryForFamilyAction } from '../family-diary-actions';

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

// ── Exams & Results ──

export function useChildUpcomingExams(childId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.family.childExams(childId),
    queryFn: () => fetchChildUpcomingExamsAction(childId),
    staleTime: FAMILY_QUERY_STALE_TIME,
    enabled: enabled && !!childId,
  });
}

export function useChildResultsWithAnalytics(childId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.family.childResultsAnalytics(childId),
    queryFn: () => fetchChildResultsWithAnalyticsAction(childId),
    staleTime: FAMILY_QUERY_STALE_TIME,
    enabled: enabled && !!childId,
  });
}

// ── Diary ──

export function useChildDiary(
  childId: string,
  startDate: string,
  endDate: string,
  subjectId?: string,
  enabled = true,
) {
  return useQuery({
    queryKey: [...queryKeys.family.childDiary(childId), startDate, endDate, subjectId],
    queryFn: () => fetchChildDiaryForFamilyAction(childId, startDate, endDate, subjectId),
    staleTime: FAMILY_QUERY_STALE_TIME,
    enabled: enabled && !!childId && !!startDate && !!endDate,
  });
}

export function useChildTodayDiary(childId: string, enabled = true) {
  return useQuery({
    queryKey: [...queryKeys.family.childDiary(childId), 'today'],
    queryFn: () => fetchChildTodayDiaryForFamilyAction(childId),
    staleTime: FAMILY_QUERY_STALE_TIME,
    enabled: enabled && !!childId,
  });
}
