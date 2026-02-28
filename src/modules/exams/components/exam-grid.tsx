'use client';

import { useState, useCallback } from 'react';
import { useInvalidateCache } from '@/lib/cache-utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { MoreHorizontal, Pencil, Trash2, Send, Clock, FileQuestion, Users } from 'lucide-react';
import { Spinner } from '@/components/shared';
import { publishExamAction, deleteExamAction } from '@/modules/exams/exam-actions';
import { EditExamDialog } from './edit-exam-dialog';
import { toast } from 'sonner';
import { formatDate, formatDuration } from '@/utils/format';
import type { ExamWithRelations } from '@/modules/exams/exam-queries';
import type { DeepSerialize } from '@/utils/serialize';

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  PUBLISHED: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  ACTIVE: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  COMPLETED: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  ARCHIVED: 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
};

type Props = { exams: DeepSerialize<ExamWithRelations>[] };

/** Track per-exam loading states */
type LoadingKey = `${string}:${'publish' | 'delete'}`;

export function ExamGrid({ exams }: Props) {
  const [loadingKeys, setLoadingKeys] = useState<Set<LoadingKey>>(new Set());
  const [editingExam, setEditingExam] = useState<DeepSerialize<ExamWithRelations> | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; title: string } | null>(null);
  const [publishConfirm, setPublishConfirm] = useState<{ id: string; title: string } | null>(null);
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

  const isLoading = useCallback((examId: string, action?: 'publish' | 'delete') => {
    if (action) return loadingKeys.has(`${examId}:${action}`);
    return loadingKeys.has(`${examId}:publish`) || loadingKeys.has(`${examId}:delete`);
  }, [loadingKeys]);

  async function handlePublish(id: string) {
    const key: LoadingKey = `${id}:publish`;
    startLoading(key);
    try {
      const result = await publishExamAction(id);
      if (result.success) {
        toast.success('Exam published');
        await invalidate.afterExamPublish();
      } else {
        toast.error(result.error ?? 'Failed');
      }
    } catch {
      toast.error('Publish failed unexpectedly');
    } finally {
      stopLoading(key);
      setPublishConfirm(null);
    }
  }

  async function handleDelete(id: string) {
    const key: LoadingKey = `${id}:delete`;
    startLoading(key);
    try {
      const result = await deleteExamAction(id);
      if (result.success) {
        toast.success('Exam deleted');
        await invalidate.exams();
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

  return (
  <>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {exams.map((exam) => {
        const examPending = isLoading(exam.id);
        return (
          <Card key={exam.id} className="flex flex-col">
            <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
              <div className="min-w-0 flex-1 space-y-1">
                <CardTitle className="line-clamp-2 break-words text-base leading-snug">{exam.title}</CardTitle>
                <Badge variant="outline">{exam.subject.code}</Badge>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Badge className={statusColors[exam.status] ?? ''} variant="outline">
                  {exam.status}
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8" disabled={examPending}>
                      {examPending ? <Spinner size="sm" /> : <MoreHorizontal className="h-4 w-4" />}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {exam.status === 'DRAFT' && (
                      <DropdownMenuItem onClick={() => setEditingExam(exam)}>
                        <Pencil className="mr-2 h-4 w-4" />Edit
                      </DropdownMenuItem>
                    )}
                    {exam.status === 'DRAFT' && (
                      <DropdownMenuItem onClick={() => setPublishConfirm({ id: exam.id, title: exam.title })}>
                        <Send className="mr-2 h-4 w-4" />Publish
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => setDeleteConfirm({ id: exam.id, title: exam.title })}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="grid grid-cols-3 gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {formatDuration(exam.duration)}
                </div>
                <div className="flex items-center gap-1">
                  <FileQuestion className="h-3.5 w-3.5" />
                  {exam.examQuestions.length}Q
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {exam._count.examSessions}
                </div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {Number(exam.totalMarks)} marks &middot; Pass: {Number(exam.passingMarks)}
              </p>
              {exam.scheduledStartAt && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Start: {formatDate(exam.scheduledStartAt, 'dd MMM yyyy, hh:mm a')}
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>

    {editingExam && (
      <EditExamDialog
        open
        onOpenChange={(open) => !open && setEditingExam(null)}
        exam={editingExam}
      />
    )}

    {/* Publish confirmation dialog */}
    <AlertDialog open={!!publishConfirm} onOpenChange={(open) => !open && setPublishConfirm(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Publish Exam</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to publish &quot;{publishConfirm?.title}&quot;? Students in assigned classes will be notified. This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={publishConfirm ? isLoading(publishConfirm.id, 'publish') : false}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => publishConfirm && handlePublish(publishConfirm.id)}
            disabled={publishConfirm ? isLoading(publishConfirm.id, 'publish') : false}
          >
            {publishConfirm && isLoading(publishConfirm.id, 'publish') && <Spinner size="sm" className="mr-2" />}
            Publish
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    {/* Delete confirmation dialog */}
    <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Exam</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete &quot;{deleteConfirm?.title}&quot;? This action cannot be undone.
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
