'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchStudentDashboardStatsAction, type StudentDashboardStats } from '../session-fetch-actions';
import { sessionKeys } from '@/lib/query-keys';

/**
 * React Query hook for student dashboard statistics.
 * Uses short staleTime since stats can change frequently.
 */
export function useStudentDashboardStats() {
  return useQuery<StudentDashboardStats>({
    queryKey: sessionKeys.studentDashboard(),
    queryFn: fetchStudentDashboardStatsAction,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
