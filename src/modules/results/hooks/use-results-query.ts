'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { 
  fetchTeacherExamsAction, 
  fetchResultsByExamAction, 
  fetchExamAnalyticsAction,
  fetchStudentResultsAction 
} from '@/modules/results/result-fetch-actions';

/**
 * Client-first data fetching for teacher exams list (for results page).
 */
export function useTeacherExamsForResults() {
  return useQuery({
    queryKey: queryKeys.results.lists(),
    queryFn: fetchTeacherExamsAction,
  });
}

export function useResultsByExam(examId: string) {
  return useQuery({
    queryKey: queryKeys.results.list({ examId }),
    queryFn: () => fetchResultsByExamAction(examId),
    enabled: !!examId,
  });
}

export function useExamAnalytics(examId: string) {
  return useQuery({
    queryKey: queryKeys.results.analytics(examId),
    queryFn: () => fetchExamAnalyticsAction(examId),
    enabled: !!examId,
  });
}

/**
 * Client-first data fetching for student's own results.
 */
export function useStudentResults() {
  return useQuery({
    queryKey: ['student', 'results'],
    queryFn: fetchStudentResultsAction,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
