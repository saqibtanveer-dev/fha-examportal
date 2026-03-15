'use client';

import { useState, useTransition } from 'react';
import { useInvalidateCache } from '@/lib/cache-utils';
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
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { deleteDepartmentAction } from '@/modules/departments/department-actions';
import { EditDepartmentDialog } from './edit-department-dialog';
import { ConfirmDialog } from '@/components/shared';
import { toast } from 'sonner';

type Department = {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  _count: { subjects: number };
};

type Props = { departments: Department[] };

export function DepartmentTable({ departments }: Props) {
  const [isPending, startTransition] = useTransition();
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Department | null>(null);
  const invalidate = useInvalidateCache();

  function handleDelete(dept: Department) {
    startTransition(async () => {
      const result = await deleteDepartmentAction(dept.id);
      if (result.success) {
        toast.success('Department deleted');
        await invalidate.departments();
      } else {
        toast.error(result.error ?? 'Failed');
      }
      setDeleteConfirm(null);
    });
  }

  return (
  <>
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Subjects</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {departments.map((dept) => (
            <TableRow key={dept.id}>
              <TableCell className="font-medium">{dept.name}</TableCell>
              <TableCell>{dept._count.subjects}</TableCell>
              <TableCell>
                <Badge variant={dept.isActive ? 'default' : 'destructive'}>
                  {dept.isActive ? 'Active' : 'Inactive'}
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
                    <DropdownMenuItem onClick={() => setEditingDept(dept)}>
                      <Pencil className="mr-2 h-4 w-4" />Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => setDeleteConfirm(dept)}
                    >
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

    {editingDept && (
      <EditDepartmentDialog
        open
        onOpenChange={(open) => !open && setEditingDept(null)}
        department={editingDept}
      />
    )}

    <ConfirmDialog
      open={!!deleteConfirm}
      onOpenChange={(o) => !o && setDeleteConfirm(null)}
      title="Delete Department"
      description={deleteConfirm ? `Are you sure you want to delete "${deleteConfirm.name}"? It has ${deleteConfirm._count.subjects} subject(s) linked.` : ''}
      onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)}
      isLoading={isPending}
      variant="destructive"
      confirmLabel="Delete Department"
    />
  </>
  );
}
