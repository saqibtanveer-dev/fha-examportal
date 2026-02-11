import { prisma } from '@/lib/prisma';
import type { Prisma, UserRole } from '@prisma/client';
import type { PaginationParams } from '@/utils/pagination';
import { getSkipTake, buildPaginatedResult } from '@/utils/pagination';

// ============================================
// Types
// ============================================

export type UserWithProfile = Prisma.UserGetPayload<{
  include: {
    studentProfile: { include: { class: true; section: true } };
    teacherProfile: true;
  };
}>;

export type UserListFilters = {
  search?: string;
  role?: UserRole;
  isActive?: boolean;
};

// ============================================
// List Users
// ============================================

export async function listUsers(params: PaginationParams, filters: UserListFilters) {
  const where: Prisma.UserWhereInput = { deletedAt: null };

  if (filters.role) where.role = filters.role;
  if (filters.isActive !== undefined) where.isActive = filters.isActive;
  if (filters.search) {
    where.OR = [
      { firstName: { contains: filters.search, mode: 'insensitive' } },
      { lastName: { contains: filters.search, mode: 'insensitive' } },
      { email: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  const [data, totalCount] = await Promise.all([
    prisma.user.findMany({
      where,
      ...getSkipTake(params),
      orderBy: { createdAt: 'desc' },
      include: {
        studentProfile: { include: { class: true, section: true } },
        teacherProfile: true,
      },
    }),
    prisma.user.count({ where }),
  ]);

  return buildPaginatedResult(data, totalCount, params);
}

// ============================================
// Get Single User
// ============================================

export async function getUserById(id: string): Promise<UserWithProfile | null> {
  return prisma.user.findUnique({
    where: { id, deletedAt: null },
    include: {
      studentProfile: { include: { class: true, section: true } },
      teacherProfile: true,
    },
  });
}

// ============================================
// Toggle Active
// ============================================

export async function toggleUserActive(id: string) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return null;

  return prisma.user.update({
    where: { id },
    data: { isActive: !user.isActive },
  });
}

// ============================================
// Soft Delete
// ============================================

export async function softDeleteUser(id: string) {
  return prisma.user.update({
    where: { id },
    data: { deletedAt: new Date(), isActive: false },
  });
}
