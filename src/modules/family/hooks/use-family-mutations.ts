'use client';

// ============================================
// Family Module — Mutation Hooks
// ============================================

import { useServerAction } from '@/lib/use-server-action';
import { queryKeys } from '@/lib/query-keys';
import { markChildDiaryAsReadAction } from '../family-diary-actions';

export function useMarkDiaryAsRead(childId: string) {
  return useServerAction(
    (diaryEntryId: string) => markChildDiaryAsReadAction(childId, diaryEntryId),
    {
      invalidateKeys: [[...queryKeys.family.childDiary(childId)]],
      successMessage: 'Diary entry marked as read',
    },
  );
}
