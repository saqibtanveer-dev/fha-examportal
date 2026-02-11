'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Spinner } from '@/components/shared';
import { updateDepartmentAction } from '@/modules/departments/department-actions';
import { toast } from 'sonner';

type Department = {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  department: Department;
};

export function EditDepartmentDialog({ open, onOpenChange, department }: Props) {
  const [isPending, startTransition] = useTransition();
  const [isActive, setIsActive] = useState(department.isActive);
  const router = useRouter();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await updateDepartmentAction(department.id, {
        name: formData.get('name') as string,
        description: (formData.get('description') as string) || undefined,
        isActive,
      });
      if (result.success) {
        toast.success('Department updated');
        onOpenChange(false);
        router.refresh();
      } else {
        toast.error(result.error ?? 'Failed to update');
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Department</DialogTitle>
          <DialogDescription>Update department details.</DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="deptName">Name</Label>
            <Input
              id="deptName"
              name="name"
              defaultValue={department.name}
              required
              disabled={isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="deptDesc">Description (optional)</Label>
            <Textarea
              id="deptDesc"
              name="description"
              defaultValue={department.description ?? ''}
              rows={3}
              disabled={isPending}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="deptActive">Active</Label>
            <Switch
              id="deptActive"
              checked={isActive}
              onCheckedChange={setIsActive}
              disabled={isPending}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Spinner size="sm" className="mr-2" />}
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
