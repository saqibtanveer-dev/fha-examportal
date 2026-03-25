'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { fetchUsersAction, fetchUserByIdAction } from '@/modules/users/user-fetch-actions';
import type { UserRole } from '@prisma/client';

const STALE_TIME = 2 * 60 * 1000; // 2 minutes

export function useUsersList(params?: {
  page?: number;
  pageSize?: number;
  search?: string;
  role?: UserRole;
  classId?: string;
}) {
  return useQuery({
    queryKey: queryKeys.users.list(params ?? {}),
    queryFn: () => fetchUsersAction(params),
    staleTime: STALE_TIME,
  });
}

export function useUserById(userId: string) {
  return useQuery({
    queryKey: queryKeys.users.detail(userId),
    queryFn: () => fetchUserByIdAction(userId),
    enabled: Boolean(userId),
  });
}
