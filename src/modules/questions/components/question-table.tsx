'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
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
import { Copy, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { deleteQuestionAction } from '@/modules/questions/question-actions';
import { duplicateQuestionAction } from '@/modules/questions/update-question-actions';
import { EditQuestionDialog } from './edit-question-dialog';
import { toast } from 'sonner';
import { truncate } from '@/utils/format';
import type { QuestionWithRelations } from '@/modules/questions/question-queries';
import type { DeepSerialize } from '@/utils/serialize';

const difficultyColors: Record<string, string> = {
  EASY: 'bg-green-100 text-green-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HARD: 'bg-red-100 text-red-800',
};

const typeLabels: Record<string, string> = {
  MCQ: 'MCQ',
  SHORT_ANSWER: 'Short',
  LONG_ANSWER: 'Long',
};

type Props = { questions: DeepSerialize<QuestionWithRelations>[] };

export function QuestionTable({ questions }: Props) {
  const [isPending, startTransition] = useTransition();
  const [editingQuestion, setEditingQuestion] = useState<DeepSerialize<QuestionWithRelations> | null>(null);
  const router = useRouter();

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteQuestionAction(id);
      if (result.success) {
        toast.success('Question deleted');
        router.refresh();
      } else {
        toast.error(result.error ?? 'Failed');
      }
    });
  }

  function handleDuplicate(id: string) {
    startTransition(async () => {
      const result = await duplicateQuestionAction(id);
      if (result.success) {
        toast.success('Question duplicated');
        router.refresh();
      } else {
        toast.error(result.error ?? 'Failed');
      }
    });
  }

  return (
  <>
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-50">Title</TableHead>
            <TableHead className="hidden sm:table-cell">Subject</TableHead>
            <TableHead className="hidden md:table-cell">Type</TableHead>
            <TableHead className="hidden md:table-cell">Difficulty</TableHead>
            <TableHead>Marks</TableHead>
            <TableHead className="hidden lg:table-cell">Used In</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {questions.map((q) => (
            <TableRow key={q.id}>
              <TableCell className="font-medium">{truncate(q.title, 60)}</TableCell>
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
              <TableCell>{String(q.marks)}</TableCell>
              <TableCell className="hidden lg:table-cell">{q._count.examQuestions} exams</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" disabled={isPending}>
                      <MoreHorizontal className="h-4 w-4" />
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
                    <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(q.id)}>
                      <Trash2 className="mr-2 h-4 w-4" />Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
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
  </>
  );
}
