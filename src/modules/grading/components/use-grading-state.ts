'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useInvalidateCache } from '@/lib/cache-utils';
import { gradeAnswerAction, batchGradeAnswersAction } from '@/modules/grading/grading-actions';
import { approveAiGradeAction, finalizeSessionAction } from '@/modules/grading/ai-grading-review-actions';
import { toast } from 'sonner';
import type { Answer, ViewMode } from './grading-types';

export function useGradingState(sessionId: string, answers: Answer[]) {
  const [loadingKeys, setLoadingKeys] = useState<Set<string>>(new Set());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [marks, setMarks] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const a of answers) {
      if (a.answerGrade) initial[a.id] = String(Number(a.answerGrade.marksAwarded));
    }
    return initial;
  });
  const [feedback, setFeedback] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const a of answers) {
      if (a.answerGrade?.feedback) initial[a.id] = a.answerGrade.feedback;
    }
    return initial;
  });
  const [editingGradeId, setEditingGradeId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('step');
  const router = useRouter();
  const invalidate = useInvalidateCache();

  const startLoading = useCallback((key: string) => {
    setLoadingKeys((prev) => new Set(prev).add(key));
  }, []);
  const stopLoading = useCallback((key: string) => {
    setLoadingKeys((prev) => { const next = new Set(prev); next.delete(key); return next; });
  }, []);
  const isItemLoading = useCallback((id: string) => {
    return loadingKeys.has(`grade:${id}`) || loadingKeys.has(`approve:${id}`);
  }, [loadingKeys]);

  const isAnyLoading = loadingKeys.size > 0;
  const ungradedAnswers = answers.filter((a) => !a.answerGrade);
  const gradedCount = answers.length - ungradedAnswers.length;

  const handleGrade = useCallback(async (answerId: string) => {
    const m = parseFloat(marks[answerId] ?? '0');
    const f = feedback[answerId] ?? '';
    const key = `grade:${answerId}`;
    startLoading(key);
    try {
      const result = await gradeAnswerAction(answerId, m, f);
      if (result.success) { toast.success('Answer graded'); await invalidate.afterGrading(sessionId); }
      else toast.error(result.error ?? 'Failed');
    } catch { toast.error('Grading failed'); } finally { stopLoading(key); }
  }, [marks, feedback, sessionId, invalidate, startLoading, stopLoading]);

  const handleApproveAi = useCallback(async (gradeId: string, overrides?: { marksAwarded?: number; feedback?: string }) => {
    const key = `approve:${gradeId}`;
    startLoading(key);
    try {
      const result = await approveAiGradeAction(gradeId, overrides);
      if (result.success) {
        toast.success(overrides ? 'AI grade updated & approved' : 'AI grade approved');
        setEditingGradeId(null);
        await invalidate.afterGrading(sessionId);
      } else toast.error(result.error ?? 'Failed to approve');
    } catch { toast.error('Approval failed'); } finally { stopLoading(key); }
  }, [sessionId, invalidate, startLoading, stopLoading]);

  const handleBatchGrade = useCallback(async (autoFinalize: boolean) => {
    const grades = answers
      .filter((a) => marks[a.id] !== undefined && marks[a.id] !== '')
      .map((a) => ({
        answerId: a.id,
        marksAwarded: parseFloat(marks[a.id] ?? '0'),
        feedback: feedback[a.id] ?? '',
      }));

    if (grades.length === 0) { toast.error('Please enter marks for at least one answer'); return; }

    const key = autoFinalize ? 'batch:finalize' : 'batch:save';
    startLoading(key);
    try {
      const result = await batchGradeAnswersAction(sessionId, grades, autoFinalize);
      if (result.success) {
        const { graded, errors } = result.data!;
        if (errors.length > 0) toast.warning(`Graded ${graded} answers. ${errors.length} errors.`);
        else toast.success(autoFinalize ? `All ${graded} answers graded & result finalized!` : `${graded} answers graded successfully`);
        await invalidate.afterGrading(sessionId);
      } else toast.error(result.error ?? 'Batch grading failed');
    } catch { toast.error('Batch grading failed'); } finally { stopLoading(key); }
  }, [answers, marks, feedback, sessionId, invalidate, startLoading, stopLoading]);

  const handleFinalize = useCallback(async () => {
    startLoading('finalize');
    try {
      const result = await finalizeSessionAction(sessionId);
      if (result.success) {
        toast.success('Result finalized and published!');
        await invalidate.afterGrading(sessionId);
        router.push('/teacher/grading');
      } else toast.error(result.error ?? 'Failed to finalize');
    } catch { toast.error('Finalization failed'); } finally { stopLoading('finalize'); }
  }, [sessionId, router, startLoading, stopLoading]);

  return {
    currentIndex, setCurrentIndex,
    marks, setMarks,
    feedback, setFeedback,
    editingGradeId, setEditingGradeId,
    viewMode, setViewMode,
    loadingKeys, isAnyLoading, isItemLoading,
    gradedCount, ungradedAnswers,
    handleGrade, handleApproveAi, handleBatchGrade, handleFinalize,
  };
}
