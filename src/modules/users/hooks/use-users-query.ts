'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchUsersAction, fetchUserByIdAction } from '@/modules/users/user-fetch-actions';
import type { UserRole } from '@prisma/client';

/**
 * Users list with pagination and filtering.
 */
export function useUsersList(params?: {
  page?: number;
  pageSize?: number;
  search?: string;
  role?: UserRole;
}) {
  return useQuery({
    queryKey: ['admin', 'users', params ?? {}],
    queryFn: () => fetchUsersAction(params),
  });
}

/**
 * Single user by ID.
 */
export function useUserById(userId: string) {
  return useQuery({
    queryKey: ['admin', 'users', userId],
    queryFn: () => fetchUserByIdAction(userId),
    enabled: Boolean(userId),
  });
}
