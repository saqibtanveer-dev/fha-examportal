'use server';

import { prisma } from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth-utils';
import { revalidatePath } from 'next/cache';
import { createAuditLog } from '@/modules/audit/audit-queries';
import type { ActionResult } from '@/types/action-result';

export async function markNotificationReadAction(id: string): Promise<ActionResult> {
  const session = await getAuthSession();
  if (!session) return { success: false, error: 'Unauthorized' };

  await prisma.notification.updateMany({
    where: { id, userId: session.user.id },
    data: { isRead: true },
  });

  createAuditLog(session.user.id, 'MARK_NOTIFICATION_READ', 'NOTIFICATION', id).catch(() => {});
  revalidatePath('/');
  return { success: true };
}

export async function markAllNotificationsReadAction(): Promise<ActionResult> {
  const session = await getAuthSession();
  if (!session) return { success: false, error: 'Unauthorized' };

  await prisma.notification.updateMany({
    where: { userId: session.user.id, isRead: false },
    data: { isRead: true },
  });

  createAuditLog(session.user.id, 'MARK_ALL_NOTIFICATIONS_READ', 'NOTIFICATION', 'all').catch(() => {});
  revalidatePath('/');
  return { success: true };
}

export async function deleteNotificationAction(id: string): Promise<ActionResult> {
  const session = await getAuthSession();
  if (!session) return { success: false, error: 'Unauthorized' };

  await prisma.notification.deleteMany({
    where: { id, userId: session.user.id },
  });

  createAuditLog(session.user.id, 'DELETE_NOTIFICATION', 'NOTIFICATION', id).catch(() => {});
  revalidatePath('/');
  return { success: true };
}
