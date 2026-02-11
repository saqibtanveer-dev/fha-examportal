'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
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
import { Badge } from '@/components/ui/badge';
import { deleteDepartmentAction } from '@/modules/departments/department-actions';
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
  const router = useRouter();

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteDepartmentAction(id);
      if (result.success) {
        toast.success('Department deleted');
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
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => handleDelete(dept.id)}
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
  );
}
