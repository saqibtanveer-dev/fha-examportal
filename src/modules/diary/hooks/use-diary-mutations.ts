'use client';

// ============================================
// Diary Module — Mutation Hooks
// ============================================

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { toast } from 'sonner';
import {
  createDiaryEntryAction,
  updateDiaryEntryAction,
  deleteDiaryEntryAction,
  publishDiaryEntryAction,
  copyDiaryToSectionsAction,
} from '../diary-mutation-actions';
import {
  markDiaryReadAction,
  addPrincipalNoteAction,
} from '../diary-secondary-actions';
import type { CreateDiaryEntryInput, UpdateDiaryEntryInput } from '@/validations/diary-schemas';

function useInvalidateDiary() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: queryKeys.diary.all });
}

export function useCreateDiaryEntry() {
  const invalidate = useInvalidateDiary();

  return useMutation({
    mutationFn: (input: CreateDiaryEntryInput) => createDiaryEntryAction(input),
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Diary entry created');
        invalidate();
      } else {
        toast.error(result.error ?? 'Failed to create diary entry');
      }
    },
    onError: () => toast.error('Failed to create diary entry'),
  });
}

export function useUpdateDiaryEntry() {
  const invalidate = useInvalidateDiary();

  return useMutation({
    mutationFn: (input: { entryId: string } & UpdateDiaryEntryInput) =>
      updateDiaryEntryAction(input),
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Diary entry updated');
        invalidate();
      } else {
        toast.error(result.error ?? 'Failed to update diary entry');
      }
    },
    onError: () => toast.error('Failed to update diary entry'),
  });
}

export function useDeleteDiaryEntry() {
  const invalidate = useInvalidateDiary();

  return useMutation({
    mutationFn: (entryId: string) => deleteDiaryEntryAction(entryId),
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Diary entry deleted');
        invalidate();
      } else {
        toast.error(result.error ?? 'Failed to delete diary entry');
      }
    },
    onError: () => toast.error('Failed to delete diary entry'),
  });
}

export function usePublishDiaryEntry() {
  const invalidate = useInvalidateDiary();

  return useMutation({
    mutationFn: (entryId: string) => publishDiaryEntryAction(entryId),
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Diary entry published');
        invalidate();
      } else {
        toast.error(result.error ?? 'Failed to publish diary entry');
      }
    },
    onError: () => toast.error('Failed to publish'),
  });
}

export function useCopyDiaryToSections() {
  const invalidate = useInvalidateDiary();

  return useMutation({
    mutationFn: (input: { entryId: string; targetSectionIds: string[] }) =>
      copyDiaryToSectionsAction(input),
    onSuccess: (result) => {
      if (result.success) {
        toast.success(`Diary copied to ${result.data?.count ?? 0} sections`);
        invalidate();
      } else {
        toast.error(result.error ?? 'Failed to copy diary');
      }
    },
    onError: () => toast.error('Failed to copy diary'),
  });
}

export function useMarkDiaryRead() {
  return useMutation({
    mutationFn: (diaryEntryId: string) => markDiaryReadAction(diaryEntryId),
  });
}

export function useAddPrincipalNote() {
  const invalidate = useInvalidateDiary();

  return useMutation({
    mutationFn: (input: { diaryEntryId: string; note: string }) =>
      addPrincipalNoteAction(input),
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Note added');
        invalidate();
      } else {
        toast.error(result.error ?? 'Failed to add note');
      }
    },
    onError: () => toast.error('Failed to add note'),
  });
}
