'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { fetchNotificationCountAction } from '../notification-fetch-actions';
import { queryKeys } from '@/lib/query-keys';
import { useAuthStore } from '@/stores/auth-store';

/**
 * React Query hook for notification count with polling.
 * Syncs with Zustand auth store for immediate UI updates.
 */
export function useNotificationCount() {
  const setNotificationCount = useAuthStore((state) => state.setNotificationCount);
  
  const query = useQuery<number>({
    queryKey: queryKeys.notifications.unread(),
    queryFn: fetchNotificationCountAction,
    staleTime: 30 * 1000, // 30 seconds - more frequent for notifications
    refetchInterval: 60 * 1000, // Poll every 60 seconds
  });

  // Sync with Zustand store when data changes
  useEffect(() => {
    if (query.data !== undefined) {
      setNotificationCount(query.data);
    }
  }, [query.data, setNotificationCount]);

  return query;
}
