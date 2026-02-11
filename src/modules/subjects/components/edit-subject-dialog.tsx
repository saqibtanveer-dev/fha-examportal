'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Spinner } from '@/components/shared';
import { updateSubjectAction } from '@/modules/subjects/subject-actions';
import { toast } from 'sonner';

type Subject = {
  id: string;
  name: string;
  code: string;
  description: string | null;
  departmentId: string;
  isActive: boolean;
};

type Department = { id: string; name: string };

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subject: Subject;
  departments: Department[];
};

export function EditSubjectDialog({ open, onOpenChange, subject, departments }: Props) {
  const [isPending, startTransition] = useTransition();
  const [departmentId, setDepartmentId] = useState(subject.departmentId);
  const [isActive, setIsActive] = useState(subject.isActive);
  const router = useRouter();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await updateSubjectAction(subject.id, {
        name: formData.get('name') as string,
        code: formData.get('code') as string,
        departmentId,
        description: (formData.get('description') as string) || undefined,
        isActive,
      });
      if (result.success) {
        toast.success('Subject updated');
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
          <DialogTitle>Edit Subject</DialogTitle>
          <DialogDescription>Update subject details.</DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subjName">Name</Label>
            <Input
              id="subjName"
              name="name"
              defaultValue={subject.name}
              required
              disabled={isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subjCode">Code</Label>
            <Input
              id="subjCode"
              name="code"
              defaultValue={subject.code}
              required
              disabled={isPending}
            />
          </div>
          <div className="space-y-2">
            <Label>Department</Label>
            <Select value={departmentId} onValueChange={setDepartmentId} disabled={isPending}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {departments.map((d) => (
                  <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="subjDesc">Description (optional)</Label>
            <Textarea
              id="subjDesc"
              name="description"
              defaultValue={subject.description ?? ''}
              rows={3}
              disabled={isPending}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="subjActive">Active</Label>
            <Switch
              id="subjActive"
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
