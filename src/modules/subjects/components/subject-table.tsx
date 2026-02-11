'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Trash2 } from 'lucide-react';
import { deleteSubjectAction } from '@/modules/subjects/subject-actions';
import { toast } from 'sonner';

type Subject = {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
  department: { id: string; name: string };
  _count: { questions: number; exams: number };
};

type Props = { subjects: Subject[] };

export function SubjectTable({ subjects }: Props) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteSubjectAction(id);
      if (result.success) {
        toast.success('Subject deleted');
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
            <TableHead>Name</TableHead>
            <TableHead>Code</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Questions</TableHead>
            <TableHead>Exams</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {subjects.map((subj) => (
            <TableRow key={subj.id}>
              <TableCell className="font-medium">{subj.name}</TableCell>
              <TableCell><code className="text-xs">{subj.code}</code></TableCell>
              <TableCell>{subj.department.name}</TableCell>
              <TableCell>{subj._count.questions}</TableCell>
              <TableCell>{subj._count.exams}</TableCell>
              <TableCell>
                <Badge variant={subj.isActive ? 'default' : 'destructive'}>
                  {subj.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" disabled={isPending}>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(subj.id)}>
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
