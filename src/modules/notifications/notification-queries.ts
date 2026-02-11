import { prisma } from '@/lib/prisma';
import type { NotificationType } from '@prisma/client';

export async function getNotificationsForUser(userId: string, limit = 20) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

export async function getUnreadCount(userId: string): Promise<number> {
  return prisma.notification.count({
    where: { userId, isRead: false },
  });
}

export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  actionUrl?: string,
) {
  return prisma.notification.create({
    data: { userId, type, title, message, actionUrl },
  });
}

export async function createBulkNotifications(
  userIds: string[],
  type: NotificationType,
  title: string,
  message: string,
  actionUrl?: string,
) {
  return prisma.notification.createMany({
    data: userIds.map((userId) => ({ userId, type, title, message, actionUrl })),
  });
}
