'use client';

import { useState, useTransition } from 'react';
import { useInvalidateCache } from '@/lib/cache-utils';
import { Button } from '@/components/ui/button';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { deleteFeeCategoryAction } from '@/modules/fees/fee-category-actions';
import { EditCategoryDialog } from './edit-category-dialog';
import { toast } from 'sonner';
import type { SerializedFeeCategory } from '@/modules/fees/fee.types';

const FREQUENCY_LABELS: Record<string, string> = {
  MONTHLY: 'Monthly',
  TERM: 'Term',
  ANNUAL: 'Annual',
  ONE_TIME: 'One Time',
};

type Props = { categories: SerializedFeeCategory[] };

export function CategoryTable({ categories }: Props) {
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState<SerializedFeeCategory | null>(null);
  const [deleting, setDeleting] = useState<SerializedFeeCategory | null>(null);
  const invalidate = useInvalidateCache();

  function confirmDelete() {
    if (!deleting) return;
    startTransition(async () => {
      const result = await deleteFeeCategoryAction(deleting.id);
      if (result.success) {
        toast.success('Category deleted');
        await invalidate.feeCategories();
      } else {
        toast.error(result.error ?? 'Failed to delete');
      }
      setDeleting(null);
    });
  }

  return (
    <>
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Frequency</TableHead>
              <TableHead>Mandatory</TableHead>
              <TableHead>Refundable</TableHead>
              <TableHead>Structures</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((cat) => (
              <TableRow key={cat.id}>
                <TableCell className="font-medium">{cat.name}</TableCell>
                <TableCell>{FREQUENCY_LABELS[cat.frequency] ?? cat.frequency}</TableCell>
                <TableCell>{cat.isMandatory ? 'Yes' : 'No'}</TableCell>
                <TableCell>{cat.isRefundable ? 'Yes' : 'No'}</TableCell>
                <TableCell>{cat._count?.structures ?? 0}</TableCell>
                <TableCell>
                  <Badge variant={cat.isActive ? 'default' : 'destructive'}>
                    {cat.isActive ? 'Active' : 'Inactive'}
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
                      <DropdownMenuItem onClick={() => setEditing(cat)}>
                        <Pencil className="mr-2 h-4 w-4" />Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => setDeleting(cat)}
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

      {editing && (
        <EditCategoryDialog
          open
          onOpenChange={(open: boolean) => !open && setEditing(null)}
          category={editing}
        />
      )}

      <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &ldquo;{deleting?.name}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. All associated fee structures will lose their category reference.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={isPending}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
