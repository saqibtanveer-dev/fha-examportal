'use client';

import { useMutation } from '@tanstack/react-query';
import { useInvalidateCache } from '@/lib/cache-utils';
import { toast } from 'sonner';
import {
  createDatesheetAction,
  updateDatesheetAction,
  publishDatesheetAction,
  unpublishDatesheetAction,
  archiveDatesheetAction,
  deleteDatesheetAction,
} from '../datesheet-lifecycle-actions';
import {
  createDatesheetEntryAction,
  updateDatesheetEntryAction,
  deleteDatesheetEntryAction,
} from '../datesheet-entry-actions';
import {
  assignDutyAction,
  updateDutyAction,
  removeDutyAction,
} from '../datesheet-duty-actions';

export function useDatesheetMutations(datesheetId?: string) {
  const invalidate = useInvalidateCache();

  const onSettled = async () => {
    await invalidate.afterDatesheetMutation(datesheetId);
  };

  const createDatesheet = useMutation({
    mutationFn: createDatesheetAction,
    onSuccess: (result) => {
      if (result.success) toast.success('Datesheet created');
      else toast.error(result.error);
    },
    onSettled,
  });

  const updateDatesheet = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateDatesheetAction>[1] }) =>
      updateDatesheetAction(id, data),
    onSuccess: (result) => {
      if (result.success) toast.success('Datesheet updated');
      else toast.error(result.error);
    },
    onSettled,
  });

  const publishDatesheet = useMutation({
    mutationFn: publishDatesheetAction,
    onSuccess: (result) => {
      if (result.success) toast.success('Datesheet published');
      else toast.error(result.error);
    },
    onSettled: async () => {
      if (datesheetId) await invalidate.afterDatesheetPublish(datesheetId);
      else await onSettled();
    },
  });

  const unpublishDatesheet = useMutation({
    mutationFn: unpublishDatesheetAction,
    onSuccess: (result) => {
      if (result.success) toast.success('Datesheet unpublished');
      else toast.error(result.error);
    },
    onSettled,
  });

  const archiveDS = useMutation({
    mutationFn: archiveDatesheetAction,
    onSuccess: (result) => {
      if (result.success) toast.success('Datesheet archived');
      else toast.error(result.error);
    },
    onSettled,
  });

  const deleteDS = useMutation({
    mutationFn: deleteDatesheetAction,
    onSuccess: (result) => {
      if (result.success) toast.success('Datesheet deleted');
      else toast.error(result.error);
    },
    onSettled,
  });

  return {
    createDatesheet,
    updateDatesheet,
    publishDatesheet,
    unpublishDatesheet,
    archiveDatesheet: archiveDS,
    deleteDatesheet: deleteDS,
  };
}

export function useDatesheetEntryMutations(datesheetId?: string) {
  const invalidate = useInvalidateCache();

  const onSettled = async () => {
    await invalidate.afterDatesheetMutation(datesheetId);
  };

  const createEntry = useMutation({
    mutationFn: createDatesheetEntryAction,
    onSuccess: (result) => {
      if (result.success) toast.success('Entry added');
      else toast.error(result.error);
    },
    onSettled,
  });

  const updateEntry = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateDatesheetEntryAction>[1] }) =>
      updateDatesheetEntryAction(id, data),
    onSuccess: (result) => {
      if (result.success) toast.success('Entry updated');
      else toast.error(result.error);
    },
    onSettled,
  });

  const deleteEntry = useMutation({
    mutationFn: deleteDatesheetEntryAction,
    onSuccess: (result) => {
      if (result.success) toast.success('Entry deleted');
      else toast.error(result.error);
    },
    onSettled,
  });

  return { createEntry, updateEntry, deleteEntry };
}

export function useDutyMutations(datesheetId?: string) {
  const invalidate = useInvalidateCache();

  const onSettled = async () => {
    await invalidate.afterDatesheetMutation(datesheetId);
  };

  const assignDuty = useMutation({
    mutationFn: assignDutyAction,
    onSuccess: (result) => {
      if (result.success) toast.success('Duty assigned');
      else toast.error(result.error);
    },
    onSettled,
  });

  const updateDutyMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateDutyAction>[1] }) =>
      updateDutyAction(id, data),
    onSuccess: (result) => {
      if (result.success) toast.success('Duty updated');
      else toast.error(result.error);
    },
    onSettled,
  });

  const removeDutyMut = useMutation({
    mutationFn: removeDutyAction,
    onSuccess: (result) => {
      if (result.success) toast.success('Duty removed');
      else toast.error(result.error);
    },
    onSettled,
  });

  return { assignDuty, updateDuty: updateDutyMut, removeDuty: removeDutyMut };
}
