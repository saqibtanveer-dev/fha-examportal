'use client';

import { useState, useTransition } from 'react';
import { useInvalidateCache } from '@/lib/cache-utils';
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
  const invalidate = useInvalidateCache();

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteSubjectAction(id);
      if (result.success) {
        toast.success('Subject deleted');
        await invalidate.subjects();
      } else {
        toast.error(result.error ?? 'Failed');
      }
    });
  }

  return (
  <>
    {/* ── Mobile Card View ──────────────────────────────────── */}
    <div className="space-y-2 md:hidden">
      {subjects.map((subj) => (
        <div key={subj.id} className="rounded-lg border bg-card p-3 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{subj.name}</p>
              <p className="text-xs text-muted-foreground">
                {subj.code} · {subj.department.name}
              </p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Badge variant={subj.isActive ? 'default' : 'destructive'} className="text-[10px] px-1.5">
                {subj.isActive ? 'Active' : 'Inactive'}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isPending}>
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
            </div>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span>{subj._count.questions} questions</span>
            <span>·</span>
            <span>{subj._count.exams} exams</span>
            <span>·</span>
            <span>{subj._count.subjectClassLinks} classes</span>
          </div>
        </div>
      ))}
    </div>

    {/* ── Desktop Table View ────────────────────────────────── */}
    <div className="hidden md:block overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Code</TableHead>
            <TableHead className="hidden sm:table-cell">Department</TableHead>
            <TableHead className="hidden md:table-cell">Assigned Classes</TableHead>
            <TableHead className="hidden lg:table-cell">Questions</TableHead>
            <TableHead className="hidden lg:table-cell">Exams</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {subjects.map((subj) => (
            <TableRow key={subj.id}>
              <TableCell className="font-medium">{subj.name}</TableCell>
              <TableCell><code className="text-xs">{subj.code}</code></TableCell>
              <TableCell className="hidden sm:table-cell">{subj.department.name}</TableCell>
              <TableCell className="hidden md:table-cell">
                <SubjectClassManager
                  subjectId={subj.id}
                  subjectName={subj.name}
                  currentLinks={subj.subjectClassLinks}
                  allClasses={allClasses}
                />
              </TableCell>
              <TableCell className="hidden lg:table-cell">{subj._count.questions}</TableCell>
              <TableCell className="hidden lg:table-cell">{subj._count.exams}</TableCell>
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
