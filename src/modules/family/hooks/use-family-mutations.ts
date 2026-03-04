'use client';

// ============================================
// Family Module — Mutation Hooks
// ============================================

import { useServerAction } from '@/lib/use-server-action';
import { queryKeys } from '@/lib/query-keys';
import { markDiaryAsReadAction } from '../family-diary-actions';

export function useMarkDiaryAsRead(childId: string) {
  return useServerAction(
    (diaryEntryId: string) => markDiaryAsReadAction(childId, diaryEntryId),
    {
      invalidateKeys: [[...queryKeys.family.childDiary(childId)]],
      successMessage: 'Diary entry marked as read',
    },
  );
}
