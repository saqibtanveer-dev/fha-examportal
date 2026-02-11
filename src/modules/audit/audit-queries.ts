import { prisma } from '@/lib/prisma';
import type { PaginationParams } from '@/utils/pagination';
import { getSkipTake, buildPaginatedResult } from '@/utils/pagination';

export async function listAuditLogs(params: PaginationParams, filters?: { userId?: string; action?: string }) {
  const where: Record<string, unknown> = {};
  if (filters?.userId) where.userId = filters.userId;
  if (filters?.action) where.action = { contains: filters.action, mode: 'insensitive' };

  const [data, totalCount] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      ...getSkipTake(params),
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return buildPaginatedResult(data, totalCount, params);
}

import type { Prisma } from '@prisma/client';

export async function createAuditLog(
  userId: string,
  action: string,
  entityType: string,
  entityId: string,
  metadata?: Prisma.InputJsonValue,
  ipAddress?: string,
) {
  return prisma.auditLog.create({
    data: { userId, action, entityType, entityId, metadata: metadata ?? {}, ipAddress },
  });
}
