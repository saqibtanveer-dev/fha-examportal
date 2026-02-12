'use client';

import { useState, useTransition } from 'react';
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
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { deleteSubjectAction } from '@/modules/subjects/subject-actions';
import { EditSubjectDialog } from './edit-subject-dialog';
import { SubjectClassManager } from './subject-class-manager';
import { toast } from 'sonner';

type SubjectClassLink = {
  id: string;
  classId: string;
  isActive: boolean;
  class: { id: string; name: string; grade: number };
};

type Subject = {
  id: string;
  name: string;
  code: string;
  description: string | null;
  departmentId: string;
  isActive: boolean;
  department: { id: string; name: string };
  _count: { questions: number; exams: number; subjectClassLinks: number };
  subjectClassLinks: SubjectClassLink[];
};

type ClassInfo = { id: string; name: string; grade: number };

type Props = {
  subjects: Subject[];
  departments: { id: string; name: string }[];
  allClasses: ClassInfo[];
};

export function SubjectTable({ subjects, departments, allClasses }: Props) {
  const [isPending, startTransition] = useTransition();
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
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
  <>
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Code</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Assigned Classes</TableHead>
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
              <TableCell>
                <SubjectClassManager
                  subjectId={subj.id}
                  subjectName={subj.name}
                  currentLinks={subj.subjectClassLinks}
                  allClasses={allClasses}
                />
              </TableCell>
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
                    <DropdownMenuItem onClick={() => setEditingSubject(subj)}>
                      <Pencil className="mr-2 h-4 w-4" />Edit
                    </DropdownMenuItem>
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

    {editingSubject && (
      <EditSubjectDialog
        open
        onOpenChange={(open) => !open && setEditingSubject(null)}
        subject={editingSubject}
        departments={departments}
      />
    )}
  </>
  );
}
