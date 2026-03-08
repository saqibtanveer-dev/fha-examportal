'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { safeFetchAction } from '@/lib/safe-action';

/**
 * Server action to fetch notification count for the current user.
 * Used by React Query for caching and polling.
 */
export const fetchNotificationCountAction = safeFetchAction(async () : Promise<number> => {
  const session = await auth();
  if (!session?.user?.id) return 0;
  
  return prisma.notification.count({
    where: { userId: session.user.id, isRead: false },
  });
});
