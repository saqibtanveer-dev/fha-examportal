'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { fetchGradingSessionsAction } from '@/modules/grading/grading-fetch-actions';

/**
 * Client-first data fetching for grading sessions.
 * Uses React Query cache (5min staleTime from provider).
 */
export function useGradingSessionsQuery() {
  return useQuery({
    queryKey: queryKeys.grading.sessions(),
    queryFn: fetchGradingSessionsAction,
  });
}
