'use client';

import { useState, useCallback } from 'react';
import { useBulkEnterWrittenMarks } from './use-written-exam-query';
import { parseMarksExcel, type ImportParseResult } from '../excel-import';
import { toast } from 'sonner';

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

      if (result.entries.length === 0 && result.errors.length > 0) {
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
    const totalBatches = Math.ceil(entries.length / MAX_ENTRIES_PER_BATCH);

    setState({ status: 'importing', progress: 0, total: totalBatches });

    let imported = 0;
    for (let i = 0; i < totalBatches; i++) {
      const batch = entries.slice(i * MAX_ENTRIES_PER_BATCH, (i + 1) * MAX_ENTRIES_PER_BATCH);

      try {
        await bulkMutation.mutateAsync({ examId, entries: batch });
        imported += batch.length;
        setState({ status: 'importing', progress: i + 1, total: totalBatches });
      } catch {
        toast.error(`Failed on batch ${i + 1}/${totalBatches}. ${imported} entries saved so far.`);
        setState({ status: 'error', message: `Import partially failed. ${imported}/${entries.length} entries saved.` });
        return;
      }
    }

    toast.success(`${imported} mark entries imported for ${result.studentCount} students`);
    setState({ status: 'done', imported });
  }, [examId, bulkMutation]);

  const reset = useCallback(() => setState({ status: 'idle' }), []);

  return { state, parseFile, confirmImport, reset };
}
