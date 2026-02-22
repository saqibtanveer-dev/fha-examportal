'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchSubjectsAction, fetchSubjectByIdAction } from '@/modules/subjects/subject-fetch-actions';

/**
 * Subjects list.
 */
export function useSubjectsList() {
  return useQuery({
    queryKey: ['admin', 'subjects'],
    queryFn: fetchSubjectsAction,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Single subject by ID.
 */
export function useSubjectById(subjectId: string) {
  return useQuery({
    queryKey: ['admin', 'subjects', subjectId],
    queryFn: () => fetchSubjectByIdAction(subjectId),
    enabled: Boolean(subjectId),
  });
}
