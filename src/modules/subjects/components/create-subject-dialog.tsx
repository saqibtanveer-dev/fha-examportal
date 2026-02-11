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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Spinner } from '@/components/shared';
import { createSubjectAction } from '@/modules/subjects/subject-actions';
import { toast } from 'sonner';

type Department = { id: string; name: string };

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  departments: Department[];
};

export function CreateSubjectDialog({ open, onOpenChange, departments }: Props) {
  const [isPending, startTransition] = useTransition();
  const [departmentId, setDepartmentId] = useState('');
  const router = useRouter();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await createSubjectAction({
        name: formData.get('name') as string,
        code: formData.get('code') as string,
        departmentId,
        description: (formData.get('description') as string) || undefined,
      });
      if (result.success) {
        toast.success('Subject created');
        onOpenChange(false);
        router.refresh();
      } else {
        toast.error(result.error ?? 'Failed');
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Subject</DialogTitle>
          <DialogDescription>Add a new subject.</DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" required disabled={isPending} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="code">Code</Label>
            <Input id="code" name="code" placeholder="e.g. MATH101" required disabled={isPending} />
          </div>
          <div className="space-y-2">
            <Label>Department</Label>
            <Select value={departmentId} onValueChange={setDepartmentId} disabled={isPending}>
              <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
              <SelectContent>
                {departments.map((d) => (
                  <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea id="description" name="description" rows={3} disabled={isPending} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isPending || !departmentId}>
              {isPending && <Spinner size="sm" className="mr-2" />}Create
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
