'use client';

import { useState, useTransition } from 'react';
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
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/shared';
import { Plus, Trash2, Search } from 'lucide-react';
import {
  addQuestionToExamAction,
  removeQuestionFromExamAction,
} from '@/modules/exams/exam-question-actions';
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

/* ─── Main Component ─── */

export function ExamQuestionManager({
  examId,
  examStatus,
  examQuestions,
  availableQuestions,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const isDraft = examStatus === 'DRAFT';
  const assignedIds = new Set(examQuestions.map((eq) => eq.question.id));

  const filtered = availableQuestions.filter(
    (q) =>
      !assignedIds.has(q.id) &&
      q.title.toLowerCase().includes(search.toLowerCase()),
  );

  function handleAdd(questionId: string) {
    startTransition(async () => {
      const result = await addQuestionToExamAction(examId, questionId);
      if (result.success) {
        toast.success('Question added');
      } else {
        toast.error(result.error ?? 'Failed to add question');
      }
    });
  }

  function handleRemove(questionId: string) {
    startTransition(async () => {
      const result = await removeQuestionFromExamAction(examId, questionId);
      if (result.success) {
        toast.success('Question removed');
      } else {
        toast.error(result.error ?? 'Failed to remove question');
      }
    });
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Questions</CardTitle>
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
                  isPending={isPending}
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
            isPending={isPending}
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
  isPending,
}: {
  questions: ExamQuestion[];
  isDraft: boolean;
  onRemove: (id: string) => void;
  isPending: boolean;
}) {
  return (
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
        {questions.map((eq) => (
          <TableRow key={eq.id}>
            <TableCell className="font-medium">{eq.sortOrder}</TableCell>
            <TableCell>{eq.question.title}</TableCell>
            <TableCell>
              <Badge variant="outline">{eq.question.type}</Badge>
            </TableCell>
            <TableCell>
              <Badge variant="outline">{eq.question.difficulty}</Badge>
            </TableCell>
            <TableCell className="text-right">{String(eq.marks)}</TableCell>
            {isDraft && (
              <TableCell>
                <Button
                  size="icon"
                  variant="ghost"
                  disabled={isPending}
                  onClick={() => onRemove(eq.question.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

/* ─── Question Picker List ─── */

function QuestionPickerList({
  questions,
  onAdd,
  isPending,
}: {
  questions: AvailableQuestion[];
  onAdd: (id: string) => void;
  isPending: boolean;
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
      {questions.map((q) => (
        <div
          key={q.id}
          className="flex items-center justify-between rounded-md border p-3"
        >
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{q.title}</p>
            <div className="mt-1 flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {q.type}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {q.difficulty}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {String(q.marks)} marks
              </span>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            disabled={isPending}
            onClick={() => onAdd(q.id)}
          >
            {isPending ? <Spinner size="sm" /> : <Plus className="h-4 w-4" />}
          </Button>
        </div>
      ))}
    </div>
  );
}
