'use client';

import { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/shared';
import { Plus, Trash2, Search, Award } from 'lucide-react';
import {
  addQuestionToExamAction,
  removeQuestionFromExamAction,
} from '@/modules/exams/exam-question-actions';
import { useInvalidateCache } from '@/lib/cache-utils';
import { toast } from 'sonner';

/* ─── Types ─── */

type ExamQuestion = {
  id: string;
  sortOrder: number;
  marks: string | number;
  question: {
    id: string;
    title: string;
    type: string;
    difficulty: string;
  };
};

type AvailableQuestion = {
  id: string;
  title: string;
  type: string;
  difficulty: string;
  marks: string | number;
};

type Props = {
  examId: string;
  examStatus: string;
  examQuestions: ExamQuestion[];
  availableQuestions: AvailableQuestion[];
};

/** Per-question loading keys */
type LoadingKey = `${'add' | 'remove'}:${string}`;

/* ─── Main Component ─── */

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

/* ─── Questions Table ─── */

function ExamQuestionsTable({
  questions,
  isDraft,
  onRemove,
  loadingKeys,
  isAnyLoading,
}: {
  questions: ExamQuestion[];
  isDraft: boolean;
  onRemove: (id: string) => void;
  loadingKeys: Set<LoadingKey>;
  isAnyLoading: boolean;
}) {
  return (
    <div className="overflow-x-auto">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-16">#</TableHead>
          <TableHead>Title</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Difficulty</TableHead>
          <TableHead className="text-right">Marks</TableHead>
          {isDraft && <TableHead className="w-16" />}
        </TableRow>
      </TableHeader>
      <TableBody>
        {questions.map((eq) => {
          const isRemoving = loadingKeys.has(`remove:${eq.question.id}`);
          return (
            <TableRow key={eq.id} className={isRemoving ? 'opacity-50' : ''}>
              <TableCell className="font-medium">{eq.sortOrder}</TableCell>
              <TableCell className="max-w-xs">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="line-clamp-2 break-words text-sm">{eq.question.title}</span>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-sm">
                    <p className="whitespace-pre-wrap break-words">{eq.question.title}</p>
                  </TooltipContent>
                </Tooltip>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{eq.question.type.replace('_', ' ')}</Badge>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{eq.question.difficulty}</Badge>
              </TableCell>
              <TableCell className="text-right font-medium">{Number(eq.marks)}</TableCell>
              {isDraft && (
                <TableCell>
                  <Button
                    size="icon"
                    variant="ghost"
                    disabled={isRemoving || isAnyLoading}
                    onClick={() => onRemove(eq.question.id)}
                  >
                    {isRemoving ? (
                      <Spinner size="sm" />
                    ) : (
                      <Trash2 className="h-4 w-4 text-destructive" />
                    )}
                  </Button>
                </TableCell>
              )}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
    </div>
  );
}

/* ─── Question Picker List ─── */

function QuestionPickerList({
  questions,
  onAdd,
  loadingKeys,
  isAnyLoading,
}: {
  questions: AvailableQuestion[];
  onAdd: (id: string) => void;
  loadingKeys: Set<LoadingKey>;
  isAnyLoading: boolean;
}) {
  if (questions.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-muted-foreground">
        No available questions match your search.
      </p>
    );
  }

  return (
    <div className="max-h-96 space-y-2 overflow-y-auto">
      {questions.map((q) => {
        const isAdding = loadingKeys.has(`add:${q.id}`);
        return (
          <div
            key={q.id}
            className="flex items-center justify-between gap-3 rounded-md border p-3"
          >
            <div className="min-w-0 flex-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <p className="line-clamp-2 break-words text-sm font-medium">{q.title}</p>
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-sm">
                  <p className="whitespace-pre-wrap break-words">{q.title}</p>
                </TooltipContent>
              </Tooltip>
              <div className="mt-1 flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {q.type.replace('_', ' ')}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {q.difficulty}
                </Badge>
                <Badge variant="secondary" className="text-xs font-semibold">
                  {Number(q.marks)}m
                </Badge>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              disabled={isAdding || isAnyLoading}
              onClick={() => onAdd(q.id)}
            >
              {isAdding ? <Spinner size="sm" /> : <Plus className="h-4 w-4" />}
            </Button>
          </div>
        );
      })}
    </div>
  );
}
