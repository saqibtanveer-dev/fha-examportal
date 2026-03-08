'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { fetchSubjectsAction, fetchSubjectByIdAction } from '@/modules/subjects/subject-fetch-actions';

const STALE_TIME = 2 * 60 * 1000; // 2 minutes

export function useSubjectsList() {
  return useQuery({
    queryKey: queryKeys.subjects.all,
    queryFn: fetchSubjectsAction,
    staleTime: STALE_TIME,
  });
}

export function useSubjectById(subjectId: string) {
  return useQuery({
    queryKey: queryKeys.subjects.detail(subjectId),
    queryFn: () => fetchSubjectByIdAction(subjectId),
    enabled: Boolean(subjectId),
  });
}
