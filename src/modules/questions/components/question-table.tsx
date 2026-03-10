'use client';

import { useState, useCallback } from 'react';
import { useInvalidateCache } from '@/lib/cache-utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Copy, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Spinner } from '@/components/shared';
import { deleteQuestionAction } from '@/modules/questions/question-actions';
import { duplicateQuestionAction } from '@/modules/questions/update-question-actions';
import { EditQuestionDialog } from './edit-question-dialog';
import { toast } from 'sonner';
import type { QuestionWithRelations } from '@/modules/questions/question-queries';
import type { DeepSerialize } from '@/utils/serialize';

const difficultyColors: Record<string, string> = {
  EASY: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  MEDIUM: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  HARD: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

const typeLabels: Record<string, string> = {
  MCQ: 'MCQ',
  SHORT_ANSWER: 'Short',
  LONG_ANSWER: 'Long',
  TRUE_FALSE: 'T/F',
  FILL_IN_BLANK: 'Fill',
  MATCHING: 'Match',
};

type Props = { questions: DeepSerialize<QuestionWithRelations>[] };

/** Per-question loading keys */
type LoadingKey = `${string}:${'delete' | 'duplicate'}`;

export function QuestionTable({ questions }: Props) {
  const [loadingKeys, setLoadingKeys] = useState<Set<LoadingKey>>(new Set());
  const [editingQuestion, setEditingQuestion] = useState<DeepSerialize<QuestionWithRelations> | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; title: string } | null>(null);
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

  const isLoading = useCallback(
    (id: string, action?: 'delete' | 'duplicate') => {
      if (action) return loadingKeys.has(`${id}:${action}`);
      return loadingKeys.has(`${id}:delete`) || loadingKeys.has(`${id}:duplicate`);
    },
    [loadingKeys],
  );

  async function handleDelete(id: string) {
    const key: LoadingKey = `${id}:delete`;
    startLoading(key);
    try {
      const result = await deleteQuestionAction(id);
      if (result.success) {
        toast.success('Question deleted');
        await invalidate.questions();
      } else {
        toast.error(result.error ?? 'Failed');
      }
    } catch {
      toast.error('Delete failed unexpectedly');
    } finally {
      stopLoading(key);
      setDeleteConfirm(null);
    }
  }

  async function handleDuplicate(id: string) {
    const key: LoadingKey = `${id}:duplicate`;
    startLoading(key);
    try {
      const result = await duplicateQuestionAction(id);
      if (result.success) {
        toast.success('Question duplicated');
        await invalidate.questions();
      } else {
        toast.error(result.error ?? 'Failed');
      }
    } catch {
      toast.error('Duplicate failed unexpectedly');
    } finally {
      stopLoading(key);
    }
  }

  return (
  <>
    {/* ── Mobile Card View ──────────────────────────────────── */}
    <div className="space-y-2 md:hidden">
      {questions.map((q) => {
        const qPending = isLoading(q.id);
        return (
          <div key={q.id} className={`rounded-lg border bg-card p-3 space-y-2 ${qPending ? 'opacity-50' : ''}`}>
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-medium line-clamp-2 break-words flex-1">{q.title}</p>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" disabled={qPending}>
                    {qPending ? <Spinner size="sm" /> : <MoreHorizontal className="h-4 w-4" />}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setEditingQuestion(q)}>
                    <Pencil className="mr-2 h-4 w-4" />Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDuplicate(q.id)}>
                    <Copy className="mr-2 h-4 w-4" />Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive" onClick={() => setDeleteConfirm({ id: q.id, title: q.title })}>
                    <Trash2 className="mr-2 h-4 w-4" />Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge variant="outline" className="text-[10px] px-1.5">{q.subject.code}</Badge>
              <Badge variant="secondary" className="text-[10px] px-1.5">{typeLabels[q.type] ?? q.type}</Badge>
              <Badge className={`${difficultyColors[q.difficulty] ?? ''} text-[10px] px-1.5`} variant="outline">
                {q.difficulty}
              </Badge>
              <span className="text-xs text-muted-foreground">{Number(q.marks)} marks</span>
              <span className="text-xs text-muted-foreground">· {q._count.examQuestions} exams</span>
            </div>
          </div>
        );
      })}
    </div>

    {/* ── Desktop Table View ────────────────────────────────── */}
    <div className="hidden md:block overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[200px]">Title</TableHead>
            <TableHead className="hidden sm:table-cell">Subject</TableHead>
            <TableHead className="hidden md:table-cell">Type</TableHead>
            <TableHead className="hidden md:table-cell">Difficulty</TableHead>
            <TableHead>Marks</TableHead>
            <TableHead className="hidden lg:table-cell">Used In</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {questions.map((q) => {
            const qPending = isLoading(q.id);
            return (
              <TableRow key={q.id} className={qPending ? 'opacity-50' : ''}>
                <TableCell className="max-w-xs font-medium">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="line-clamp-2 break-words">{q.title}</span>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-sm">
                      <p className="whitespace-pre-wrap break-words">{q.title}</p>
                    </TooltipContent>
                  </Tooltip>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Badge variant="outline">{q.subject.code}</Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Badge variant="secondary">{typeLabels[q.type] ?? q.type}</Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Badge className={difficultyColors[q.difficulty] ?? ''} variant="outline">
                    {q.difficulty}
                  </Badge>
                </TableCell>
                <TableCell>{Number(q.marks)}</TableCell>
                <TableCell className="hidden lg:table-cell">{q._count.examQuestions} exams</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" disabled={qPending}>
                        {qPending ? <Spinner size="sm" /> : <MoreHorizontal className="h-4 w-4" />}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditingQuestion(q)}>
                        <Pencil className="mr-2 h-4 w-4" />Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicate(q.id)}>
                        <Copy className="mr-2 h-4 w-4" />Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => setDeleteConfirm({ id: q.id, title: q.title })}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>

    {editingQuestion && (
      <EditQuestionDialog
        open
        onOpenChange={(open) => !open && setEditingQuestion(null)}
        question={editingQuestion}
      />
    )}

    {/* Delete confirmation dialog */}
    <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Question</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this question? This action cannot be undone.
            {deleteConfirm && (
              <span className="mt-2 block text-sm font-medium text-foreground">
                &quot;{deleteConfirm.title.length > 100
                  ? deleteConfirm.title.slice(0, 100) + '...'
                  : deleteConfirm.title}&quot;
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteConfirm ? isLoading(deleteConfirm.id, 'delete') : false}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={() => deleteConfirm && handleDelete(deleteConfirm.id)}
            disabled={deleteConfirm ? isLoading(deleteConfirm.id, 'delete') : false}
          >
            {deleteConfirm && isLoading(deleteConfirm.id, 'delete') && <Spinner size="sm" className="mr-2" />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </>
  );
}
