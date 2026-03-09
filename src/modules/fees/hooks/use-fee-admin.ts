'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import {
  fetchFeeCategoriesAction,
  fetchFeeStructuresAction,
  fetchFeeSettingsAction,
  fetchFeeOverviewAction,
  fetchClassWiseSummaryAction,
  fetchSectionWiseSummaryAction,
  fetchStudentWiseSummaryAction,
  fetchDefaulterListAction,
} from '../fee-fetch-actions';

// ── Categories ──

export function useFeeCategories(activeOnly = false) {
  return useQuery({
    queryKey: [...queryKeys.fees.categories(), { activeOnly }],
    queryFn: () => fetchFeeCategoriesAction(activeOnly),
  });
}

// ── Structures ──

export function useFeeStructures(classId?: string) {
  return useQuery({
    queryKey: [...queryKeys.fees.structures(), { classId }],
    queryFn: () => fetchFeeStructuresAction(classId),
  });
}

// ── Settings ──

export function useFeeSettings() {
  return useQuery({
    queryKey: queryKeys.fees.settings(),
    queryFn: () => fetchFeeSettingsAction(),
  });
}

// ── Overview ──

export function useFeeOverview(enabled = true) {
  return useQuery({
    queryKey: queryKeys.fees.overview(),
    queryFn: () => fetchFeeOverviewAction(),
    enabled,
  });
}

// ── Class-wise Summary ──

export function useClassWiseSummary(enabled = true) {
  return useQuery({
    queryKey: [...queryKeys.fees.reports(), 'class-wise'],
    queryFn: () => fetchClassWiseSummaryAction(),
    enabled,
  });
}

// ── Section-wise Summary ──

export function useSectionWiseSummary(classId: string, enabled = true) {
  return useQuery({
    queryKey: [...queryKeys.fees.reports(), 'section-wise', classId],
    queryFn: () => fetchSectionWiseSummaryAction(classId),
    enabled: enabled && !!classId,
  });
}

// ── Student-wise Summary ──

export function useStudentWiseSummary(
  classId: string,
  sectionId?: string,
  enabled = true,
) {
  return useQuery({
    queryKey: [...queryKeys.fees.reports(), 'student-wise', classId, sectionId],
    queryFn: () => fetchStudentWiseSummaryAction(classId, sectionId),
    enabled: enabled && !!classId,
  });
}

// ── Defaulters ──

export function useDefaulterList(classId?: string, enabled = true) {
  return useQuery({
    queryKey: [...queryKeys.fees.reports(), 'defaulters', classId],
    queryFn: () => fetchDefaulterListAction(classId),
    enabled,
  });
}
