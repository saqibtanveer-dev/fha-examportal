'use client';

import { useState, useMemo, useTransition } from 'react';
import { createExamAction } from '@/modules/exams/exam-actions';
import { useQuestionsForPicker } from '@/modules/questions/hooks/use-questions-query';
import { useInvalidateCache } from '@/lib/cache-utils';
import { toast } from 'sonner';
import type { QuestionItem, AcademicSessionItem } from './create-exam-types';
import { QUESTION_TIME_ESTIMATES } from './create-exam-types';

export function useCreateExamForm(
  academicSessions: AcademicSessionItem[],
  onClose: () => void,
) {
  const [isPending, startTransition] = useTransition();
  const [subjectId, setSubjectId] = useState('');
  const [type, setType] = useState('QUIZ');
  const [deliveryMode, setDeliveryMode] = useState<'ONLINE' | 'WRITTEN'>('ONLINE');
  const [duration, setDuration] = useState('');
  const [academicSessionId, setAcademicSessionId] = useState(() => {
    const current = academicSessions.find((s) => s.isCurrent);
    return current?.id ?? '';
  });
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [selectedSections, setSelectedSections] = useState<{ classId: string; sectionId: string }[]>([]);
  const invalidate = useInvalidateCache();

  const { data: pickerQuestions = [], isLoading: isLoadingQuestions } = useQuestionsForPicker(subjectId);
  const questions: QuestionItem[] = useMemo(
    () => pickerQuestions.map((q) => ({ id: q.id, title: q.title, marks: Number(q.marks), type: q.type, subjectId })),
    [pickerQuestions, subjectId],
  );

  const totalMarks = useMemo(
    () => selectedQuestions.reduce((sum, qId) => sum + (questions.find((x) => x.id === qId)?.marks ?? 0), 0),
    [selectedQuestions, questions],
  );

  const suggestedDuration = useMemo(() => {
    if (selectedQuestions.length === 0) return 0;
    const totalMin = selectedQuestions.reduce((sum, qId) => {
      const q = questions.find((x) => x.id === qId);
      return sum + (q?.estimatedTime ?? QUESTION_TIME_ESTIMATES[q?.type ?? ''] ?? 2);
    }, 0);
    return Math.max(5, Math.ceil((totalMin * 1.1) / 5) * 5);
  }, [selectedQuestions, questions]);

  function toggleQuestion(id: string) {
    setSelectedQuestions((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      if (!duration || duration === String(suggestedDuration)) {
        const newTotal = next.reduce((sum, qId) => {
          const q = questions.find((x) => x.id === qId);
          return sum + (q?.estimatedTime ?? QUESTION_TIME_ESTIMATES[q?.type ?? ''] ?? 2);
        }, 0);
        const suggested = Math.max(5, Math.ceil((newTotal * 1.1) / 5) * 5);
        if (next.length > 0) setDuration(String(suggested));
      }
      return next;
    });
  }

  function handleSubjectChange(newSubjectId: string) {
    setSubjectId(newSubjectId);
    setSelectedQuestions([]);
  }

  function resetForm() {
    setSubjectId('');
    setType('QUIZ');
    setDeliveryMode('ONLINE');
    setDuration('');
    setSelectedQuestions([]);
    setSelectedSections([]);
  }

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await createExamAction({
        title: formData.get('title') as string,
        description: (formData.get('description') as string) || undefined,
        subjectId,
        academicSessionId: academicSessionId || undefined,
        type: type as 'QUIZ' | 'MIDTERM' | 'FINAL' | 'PRACTICE' | 'CUSTOM',
        deliveryMode,
        totalMarks,
        passingMarks: parseFloat(formData.get('passingMarks') as string),
        duration: parseInt(duration, 10),
        instructions: (formData.get('instructions') as string) || undefined,
        shuffleQuestions: false,
        showResultAfter: 'IMMEDIATELY' as const,
        allowReview: true,
        maxAttempts: 1,
        questions: selectedQuestions.map((qId, i) => ({
          questionId: qId,
          sortOrder: i,
          marks: questions.find((q) => q.id === qId)?.marks ?? 1,
          isRequired: true,
        })),
        classAssignments: selectedSections,
      });
      if (result.success) {
        toast.success('Exam created');
        onClose();
        resetForm();
        await invalidate.afterExamCreate();
      } else {
        toast.error(result.error ?? 'Failed');
      }
    });
  }

  return {
    isPending,
    subjectId,
    type,
    setType,
    deliveryMode,
    setDeliveryMode,
    duration,
    setDuration,
    academicSessionId,
    setAcademicSessionId,
    selectedQuestions,
    selectedSections,
    setSelectedSections,
    questions,
    isLoadingQuestions,
    totalMarks,
    suggestedDuration,
    toggleQuestion,
    handleSubjectChange,
    handleSubmit,
    resetForm,
  };
}
