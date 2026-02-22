'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { fetchQuestionsAction, fetchQuestionsForPickerAction } from '@/modules/questions/question-fetch-actions';
import type { PaginationParams } from '@/utils/pagination';
import type { QuestionListFilters } from '@/modules/questions/question-queries';

/**
 * Client-first data fetching for questions.
 * Uses React Query cache (5min staleTime from provider).
 * First visit: fetches from server, subsequent visits: uses cache.
 */
export function useQuestionsQuery(
  params: PaginationParams,
  filters: QuestionListFilters,
) {
  return useQuery({
    queryKey: queryKeys.questions.list({ ...params, ...filters }),
    queryFn: () => fetchQuestionsAction(params, filters),
  });
}

/**
 * Lazy-loads lightweight question list for the exam question picker.
 * Only fetches when subjectId is provided (subject selected in dialog).
 */
export function useQuestionsForPicker(subjectId?: string) {
  return useQuery({
    queryKey: queryKeys.questions.picker(subjectId),
    queryFn: () => fetchQuestionsForPickerAction(subjectId),
    enabled: !!subjectId,
    staleTime: 5 * 60 * 1000,
  });
}
