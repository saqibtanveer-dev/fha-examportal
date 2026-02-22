'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { fetchExamsAction, fetchStudentExamsAction } from '@/modules/exams/exam-fetch-actions';
import type { PaginationParams } from '@/utils/pagination';
import type { ExamListFilters } from '@/modules/exams/exam-queries';

/**
 * Client-first data fetching for exams (teacher/admin).
 * Uses React Query cache (5min staleTime from provider).
 */
export function useExamsQuery(
  params: PaginationParams,
  filters: ExamListFilters,
) {
  return useQuery({
    queryKey: queryKeys.exams.list({ ...params, ...filters }),
    queryFn: () => fetchExamsAction(params, filters),
  });
}

/**
 * Client-first data fetching for student's available exams.
 */
export function useStudentExamsQuery() {
  return useQuery({
    queryKey: ['student', 'exams'],
    queryFn: fetchStudentExamsAction,
    staleTime: 2 * 60 * 1000, // 2 minutes - exams may become available
  });
}
