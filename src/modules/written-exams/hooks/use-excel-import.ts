'use client';

import { useState, useCallback } from 'react';
import { useBulkEnterWrittenMarks } from './use-written-exam-query';
import { parseMarksExcel, type ImportParseResult } from '../excel-import';
import { toast } from 'sonner';
import { useInvalidateCache } from '@/lib/cache-utils';
import {
  markStudentAbsentAction,
  unmarkStudentAbsentAction,
} from '@/modules/written-exams/written-exam-finalize-actions';

const MAX_ENTRIES_PER_BATCH = 500;

type ImportState =
  | { status: 'idle' }
  | { status: 'parsing' }
  | { status: 'preview'; result: ImportParseResult }
  | { status: 'importing'; progress: number; total: number }
  | { status: 'done'; imported: number }
  | { status: 'error'; message: string };

export function useExcelImport(examId: string) {
  const [state, setState] = useState<ImportState>({ status: 'idle' });
  const bulkMutation = useBulkEnterWrittenMarks(examId);
  const invalidate = useInvalidateCache();

  const parseFile = useCallback(async (file: File) => {
    setState({ status: 'parsing' });

    try {
      const result = await parseMarksExcel(file);

      // Validate exam ID matches
      if (result.examId && result.examId !== examId) {
        setState({
          status: 'error',
          message: 'This file was exported for a different exam. Please use the correct template.',
        });
        return;
      }

      const hasActionableData =
        result.entries.length > 0 ||
        result.absentSessionIds.length > 0 ||
        result.unmarkAbsentSessionIds.length > 0;

      if (!hasActionableData && result.errors.length > 0) {
        setState({ status: 'error', message: result.errors[0] ?? 'No valid marks found' });
        return;
      }

      setState({ status: 'preview', result });
    } catch {
      setState({ status: 'error', message: 'Failed to parse Excel file. Make sure it is a valid .xlsx file.' });
    }
  }, [examId]);

  const confirmImport = useCallback(async (result: ImportParseResult) => {
    const { entries } = result;
    const absentIds = [...new Set(result.absentSessionIds)];
    const unmarkIds = [...new Set(result.unmarkAbsentSessionIds)];
    const totalBatches = Math.ceil(entries.length / MAX_ENTRIES_PER_BATCH);
    const totalOperations = unmarkIds.length + absentIds.length + totalBatches;

    if (totalOperations === 0) {
      setState({ status: 'error', message: 'No actionable marks found in file.' });
      return;
    }

    setState({ status: 'importing', progress: 0, total: totalOperations });

    let imported = 0;
    let done = 0;

    for (const sessionId of unmarkIds) {
      const res = await unmarkStudentAbsentAction({ sessionId });
      if (!res.success) {
        const message = res.error ?? 'Failed to remove absent status during import.';
        toast.error(message);
        setState({ status: 'error', message });
        return;
      }
      done++;
      setState({ status: 'importing', progress: done, total: totalOperations });
    }

    for (const sessionId of absentIds) {
      const res = await markStudentAbsentAction({ sessionId });
      if (!res.success) {
        const message = res.error ?? 'Failed to mark absent during import.';
        toast.error(message);
        setState({ status: 'error', message });
        return;
      }
      done++;
      setState({ status: 'importing', progress: done, total: totalOperations });
    }

    for (let i = 0; i < totalBatches; i++) {
      const batch = entries.slice(i * MAX_ENTRIES_PER_BATCH, (i + 1) * MAX_ENTRIES_PER_BATCH);

      try {
        await bulkMutation.mutateAsync({ examId, entries: batch });
        imported += batch.length;
        done++;
        setState({ status: 'importing', progress: done, total: totalOperations });
      } catch {
        toast.error(`Failed on marks batch ${i + 1}/${totalBatches}. ${imported} entries saved so far.`);
        setState({ status: 'error', message: `Import partially failed. ${imported}/${entries.length} entries saved.` });
        return;
      }
    }

    await invalidate.afterWrittenMarksChange(examId);

    const absentMessage = absentIds.length > 0 ? `, ${absentIds.length} marked absent` : '';
    toast.success(`${imported} mark entries imported for ${result.studentCount} students${absentMessage}`);
    setState({ status: 'done', imported });
  }, [examId, bulkMutation, invalidate]);

  const reset = useCallback(() => setState({ status: 'idle' }), []);

  return { state, parseFile, confirmImport, reset };
}
