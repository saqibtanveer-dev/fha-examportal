'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Spinner } from '@/components/shared';
import { updateClassAction } from '@/modules/classes/update-class-actions';
import { toast } from 'sonner';

type ClassItem = {
  id: string;
  name: string;
  grade: number;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classItem: ClassItem;
};

export function EditClassDialog({ open, onOpenChange, classItem }: Props) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await updateClassAction(classItem.id, {
        name: formData.get('name') as string,
        grade: parseInt(formData.get('grade') as string, 10),
      });
      if (result.success) {
        toast.success('Class updated');
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
          <DialogTitle>Edit Class</DialogTitle>
          <DialogDescription>Update class details.</DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="className">Name</Label>
            <Input
              id="className"
              name="name"
              defaultValue={classItem.name}
              required
              disabled={isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="classGrade">Grade Number</Label>
            <Input
              id="classGrade"
              name="grade"
              type="number"
              min={1}
              max={12}
              defaultValue={classItem.grade}
              required
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
