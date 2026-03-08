'use server';

import { listUsers, getUserById } from '@/modules/users/user-queries';
import { requireRole } from '@/lib/auth-utils';
import { serialize } from '@/utils/serialize';
import type { UserRole } from '@prisma/client';
import { safeFetchAction } from '@/lib/safe-action';

/**
 * Fetch users list with pagination and filters.
 */
export const fetchUsersAction = safeFetchAction(async (params?: {
  page?: number;
  pageSize?: number;
  search?: string;
  role?: UserRole;
}) => {
  await requireRole('ADMIN');
  const result = await listUsers(
    { page: params?.page ?? 1, pageSize: params?.pageSize ?? 20 },
    { search: params?.search, role: params?.role }
  );
  return serialize(result);
});

/**
 * Fetch single user by ID.
 */
export const fetchUserByIdAction = safeFetchAction(async (userId: string) => {
  await requireRole('ADMIN');
  const user = await getUserById(userId);
  return serialize(user);
});
