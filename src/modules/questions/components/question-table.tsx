'use client';

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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Trash2 } from 'lucide-react';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { deleteQuestionAction } from '@/modules/questions/question-actions';
import { toast } from 'sonner';
import { truncate } from '@/utils/format';
import type { QuestionWithRelations } from '@/modules/questions/question-queries';

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

type Props = { questions: QuestionWithRelations[] };

export function QuestionTable({ questions }: Props) {
  const [isPending, startTransition] = useTransition();
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

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-50">Title</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Difficulty</TableHead>
            <TableHead>Marks</TableHead>
            <TableHead>Used In</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {questions.map((q) => (
            <TableRow key={q.id}>
              <TableCell className="font-medium">{truncate(q.title, 60)}</TableCell>
              <TableCell>
                <Badge variant="outline">{q.subject.code}</Badge>
              </TableCell>
              <TableCell>
                <Badge variant="secondary">{typeLabels[q.type] ?? q.type}</Badge>
              </TableCell>
              <TableCell>
                <Badge className={difficultyColors[q.difficulty] ?? ''} variant="outline">
                  {q.difficulty}
                </Badge>
              </TableCell>
              <TableCell>{String(q.marks)}</TableCell>
              <TableCell>{q._count.examQuestions} exams</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" disabled={isPending}>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
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
  );
}
