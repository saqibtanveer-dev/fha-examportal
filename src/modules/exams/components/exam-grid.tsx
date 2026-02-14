'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Pencil, Trash2, Send, Clock, FileQuestion, Users } from 'lucide-react';
import { publishExamAction, deleteExamAction } from '@/modules/exams/exam-actions';
import { EditExamDialog } from './edit-exam-dialog';
import { toast } from 'sonner';
import { formatDate, formatDuration } from '@/utils/format';
import type { ExamWithRelations } from '@/modules/exams/exam-queries';
import type { DeepSerialize } from '@/utils/serialize';

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  PUBLISHED: 'bg-blue-100 text-blue-800',
  ACTIVE: 'bg-green-100 text-green-800',
  COMPLETED: 'bg-purple-100 text-purple-800',
  ARCHIVED: 'bg-gray-200 text-gray-600',
};

type Props = { exams: DeepSerialize<ExamWithRelations>[] };

export function ExamGrid({ exams }: Props) {
  const [isPending, startTransition] = useTransition();
  const [editingExam, setEditingExam] = useState<DeepSerialize<ExamWithRelations> | null>(null);
  const router = useRouter();

  function handlePublish(id: string) {
    startTransition(async () => {
      const result = await publishExamAction(id);
      if (result.success) {
        toast.success('Exam published');
        router.refresh();
      } else {
        toast.error(result.error ?? 'Failed');
      }
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteExamAction(id);
      if (result.success) {
        toast.success('Exam deleted');
        router.refresh();
      } else {
        toast.error(result.error ?? 'Failed');
      }
    });
  }

  return (
  <>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {exams.map((exam) => (
        <Card key={exam.id}>
          <CardHeader className="flex flex-row items-start justify-between pb-2">
            <div className="space-y-1">
              <CardTitle className="text-base">{exam.title}</CardTitle>
              <Badge variant="outline">{exam.subject.code}</Badge>
            </div>
            <div className="flex items-center gap-1">
              <Badge className={statusColors[exam.status] ?? ''} variant="outline">
                {exam.status}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isPending}>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {exam.status === 'DRAFT' && (
                    <DropdownMenuItem onClick={() => setEditingExam(exam)}>
                      <Pencil className="mr-2 h-4 w-4" />Edit
                    </DropdownMenuItem>
                  )}
                  {exam.status === 'DRAFT' && (
                    <DropdownMenuItem onClick={() => handlePublish(exam.id)}>
                      <Send className="mr-2 h-4 w-4" />Publish
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(exam.id)}>
                    <Trash2 className="mr-2 h-4 w-4" />Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent>
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
              {String(exam.totalMarks)} marks &middot; Pass: {String(exam.passingMarks)}
            </p>
            {exam.scheduledStartAt && (
              <p className="mt-1 text-xs text-muted-foreground">
                Start: {formatDate(exam.scheduledStartAt, 'dd MMM yyyy, hh:mm a')}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>

    {editingExam && (
      <EditExamDialog
        open
        onOpenChange={(open) => !open && setEditingExam(null)}
        exam={editingExam}
      />
    )}
  </>
  );
}
