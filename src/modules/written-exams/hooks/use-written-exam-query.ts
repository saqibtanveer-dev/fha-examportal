'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { useInvalidateCache } from '@/lib/cache-utils';
import { fetchWrittenExamMarkEntryAction } from '@/modules/written-exams/written-exam-fetch-actions';
import {
  initializeWrittenExamSessionsAction,
  enterWrittenMarksAction,
  batchEnterWrittenMarksAction,
} from '@/modules/written-exams/written-exam-actions';
import {
  bulkEnterWrittenMarksAction,
  markStudentAbsentAction,
  unmarkStudentAbsentAction,
} from '@/modules/written-exams/written-exam-finalize-actions';
import {
  finalizeWrittenExamAction,
  refinalizeWrittenExamAction,
} from '@/modules/written-exams/written-exam-result-actions';
import { toast } from 'sonner';

/**
 * Fetch complete marks entry data for a written exam.
 */
export function useWrittenExamMarkEntry(examId: string) {
  return useQuery({
    queryKey: queryKeys.writtenExams.markEntry(examId),
    queryFn: () => fetchWrittenExamMarkEntryAction(examId),
    staleTime: 30 * 1000,
  });
}

/**
 * Initialize sessions for all students.
 */
export function useInitializeWrittenSessions(examId: string) {
  const invalidate = useInvalidateCache();
  return useMutation({
    mutationFn: () => initializeWrittenExamSessionsAction({ examId }),
    onSuccess: async (result) => {
      if (result.success) {
        toast.success(`${result.data?.sessionsCreated ?? 0} student sessions created`);
        await invalidate.afterWrittenMarksChange(examId);
      } else {
        toast.error(result.error ?? 'Initialization failed');
      }
    },
    onError: () => toast.error('Failed to initialize sessions'),
  });
}

/**
 * Enter marks for a single question.
 */
export function useEnterWrittenMarks(examId: string) {
  const invalidate = useInvalidateCache();
  return useMutation({
    mutationFn: enterWrittenMarksAction,
    onSuccess: async (result) => {
      if (!result.success) toast.error(result.error ?? 'Failed to save marks');
      else await invalidate.afterWrittenMarksChange(examId);
    },
    onError: () => toast.error('Failed to save marks'),
  });
}

/**
 * Batch enter all marks for one student.
 */
export function useBatchEnterWrittenMarks(examId: string) {
  const invalidate = useInvalidateCache();
  return useMutation({
    mutationFn: batchEnterWrittenMarksAction,
    onSuccess: async (result) => {
      if (result.success) {
        toast.success('Marks saved successfully');
        await invalidate.afterWrittenMarksChange(examId);
      } else {
        toast.error(result.error ?? 'Failed to save marks');
      }
    },
    onError: () => toast.error('Failed to save marks'),
  });
}

/**
 * Bulk enter marks from spreadsheet view.
 */
export function useBulkEnterWrittenMarks(examId: string) {
  const invalidate = useInvalidateCache();
  return useMutation({
    mutationFn: bulkEnterWrittenMarksAction,
    onSuccess: async (result) => {
      if (result.success) {
        toast.success(`${result.data?.totalEntriesSaved ?? 0} entries saved`);
        await invalidate.afterWrittenMarksChange(examId);
      } else {
        toast.error(result.error ?? 'Failed to save marks');
      }
    },
    onError: () => toast.error('Bulk save failed'),
  });
}

/**
 * Mark/unmark student as absent.
 */
export function useMarkAbsent(examId: string) {
  const invalidate = useInvalidateCache();

  const markAbsent = useMutation({
    mutationFn: markStudentAbsentAction,
    onSuccess: async (result) => {
      if (result.success) {
        toast.success('Student marked absent');
        await invalidate.afterWrittenMarksChange(examId);
      } else {
        toast.error(result.error ?? 'Failed');
      }
    },
  });

  const unmarkAbsent = useMutation({
    mutationFn: unmarkStudentAbsentAction,
    onSuccess: async (result) => {
      if (result.success) {
        toast.success('Absent status removed');
        await invalidate.afterWrittenMarksChange(examId);
      } else {
        toast.error(result.error ?? 'Failed');
      }
    },
  });

  return { markAbsent, unmarkAbsent };
}

/**
 * Finalize written exam results.
 */
export function useFinalizeWrittenExam(examId: string) {
  const invalidate = useInvalidateCache();
  return useMutation({
    mutationFn: () => finalizeWrittenExamAction({ examId }),
    onSuccess: async (result) => {
      if (result.success) {
        toast.success(`${result.data?.resultsCreated ?? 0} results calculated`);
        await invalidate.afterWrittenExamFinalize(examId);
      } else {
        toast.error(result.error ?? 'Finalization failed');
      }
    },
    onError: () => toast.error('Finalization failed'),
  });
}

/**
 * Refinalize (recalculate after corrections).
 */
export function useRefinalizeWrittenExam(examId: string) {
  const invalidate = useInvalidateCache();
  return useMutation({
    mutationFn: () => refinalizeWrittenExamAction({ examId }),
    onSuccess: async (result) => {
      if (result.success) {
        toast.success(`${result.data?.resultsUpdated ?? 0} results recalculated`);
        await invalidate.afterWrittenExamFinalize(examId);
      } else {
        toast.error(result.error ?? 'Refinalization failed');
      }
    },
    onError: () => toast.error('Refinalization failed'),
  });
}
