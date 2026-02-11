'use server';

import { prisma } from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth-utils';
import { revalidatePath } from 'next/cache';

type ActionResult = { success: boolean; error?: string };

export async function markNotificationReadAction(id: string): Promise<ActionResult> {
  const session = await getAuthSession();
  if (!session) return { success: false, error: 'Unauthorized' };

  await prisma.notification.updateMany({
    where: { id, userId: session.user.id },
    data: { isRead: true },
  });

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

  revalidatePath('/');
  return { success: true };
}

export async function deleteNotificationAction(id: string): Promise<ActionResult> {
  const session = await getAuthSession();
  if (!session) return { success: false, error: 'Unauthorized' };

  await prisma.notification.deleteMany({
    where: { id, userId: session.user.id },
  });

  revalidatePath('/');
  return { success: true };
}
