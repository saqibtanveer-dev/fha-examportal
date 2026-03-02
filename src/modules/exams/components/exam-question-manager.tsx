'use client';

import { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Search, Award } from 'lucide-react';
import {
  addQuestionToExamAction,
  removeQuestionFromExamAction,
} from '@/modules/exams/exam-question-actions';
import { useInvalidateCache } from '@/lib/cache-utils';
import { toast } from 'sonner';
import {
  ExamQuestionsTable,
  QuestionPickerList,
} from './exam-question-sub-components';
import type {
  ExamQuestion,
  AvailableQuestion,
  LoadingKey,
} from './exam-question-sub-components';

type Props = {
  examId: string;
  examStatus: string;
  examQuestions: ExamQuestion[];
  availableQuestions: AvailableQuestion[];
};

export function ExamQuestionManager({
  examId,
  examStatus,
  examQuestions,
  availableQuestions,
}: Props) {
  const [loadingKeys, setLoadingKeys] = useState<Set<LoadingKey>>(new Set());
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const invalidate = useInvalidateCache();

  const startLoading = useCallback((key: LoadingKey) => {
    setLoadingKeys((prev) => new Set(prev).add(key));
  }, []);

  const stopLoading = useCallback((key: LoadingKey) => {
    setLoadingKeys((prev) => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
  }, []);

  const isDraft = examStatus === 'DRAFT';
  const assignedIds = new Set(examQuestions.map((eq) => eq.question.id));
  const isAnyLoading = loadingKeys.size > 0;

  const totalMarks = useMemo(
    () => examQuestions.reduce((sum, eq) => sum + Number(eq.marks), 0),
    [examQuestions],
  );

  const filtered = useMemo(
    () =>
      availableQuestions.filter(
        (q) =>
          !assignedIds.has(q.id) &&
          q.title.toLowerCase().includes(search.toLowerCase()),
      ),
    [availableQuestions, assignedIds, search],
  );

  async function handleAdd(questionId: string) {
    const key: LoadingKey = `add:${questionId}`;
    startLoading(key);
    try {
      const result = await addQuestionToExamAction(examId, questionId);
      if (result.success) {
        toast.success('Question added');
        await invalidate.exams();
      } else {
        toast.error(result.error ?? 'Failed to add question');
      }
    } catch {
      toast.error('Failed to add question');
    } finally {
      stopLoading(key);
    }
  }

  async function handleRemove(questionId: string) {
    const key: LoadingKey = `remove:${questionId}`;
    startLoading(key);
    try {
      const result = await removeQuestionFromExamAction(examId, questionId);
      if (result.success) {
        toast.success('Question removed');
        await invalidate.exams();
      } else {
        toast.error(result.error ?? 'Failed to remove question');
      }
    } catch {
      toast.error('Failed to remove question');
    } finally {
      stopLoading(key);
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <CardTitle className="text-base">Questions</CardTitle>
          {examQuestions.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span>{examQuestions.length} questions</span>
              <span>&middot;</span>
              <span className="flex items-center gap-1 font-medium text-primary">
                <Award className="h-3.5 w-3.5" />
                {totalMarks} marks
              </span>
            </div>
          )}
        </div>
        {isDraft && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="mr-1 h-4 w-4" /> Add Question
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Question to Exam</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search questions..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <QuestionPickerList
                  questions={filtered}
                  onAdd={handleAdd}
                  loadingKeys={loadingKeys}
                  isAnyLoading={isAnyLoading}
                />
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent>
        {examQuestions.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No questions added yet.{isDraft ? ' Click "Add Question" to start.' : ''}
          </p>
        ) : (
          <ExamQuestionsTable
            questions={examQuestions}
            isDraft={isDraft}
            onRemove={handleRemove}
            loadingKeys={loadingKeys}
            isAnyLoading={isAnyLoading}
          />
        )}
      </CardContent>
    </Card>
  );
}
