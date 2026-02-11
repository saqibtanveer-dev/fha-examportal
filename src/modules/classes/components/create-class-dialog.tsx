'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Spinner } from '@/components/shared';
import { createClassAction, createSectionAction } from '@/modules/classes/class-actions';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type ClassItem = { id: string; name: string };

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'class' | 'section';
  classes?: ClassItem[];
};

export function CreateClassDialog({ open, onOpenChange, mode, classes }: Props) {
  const [isPending, startTransition] = useTransition();
  const [classId, setClassId] = useState('');
  const router = useRouter();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      let result;
      if (mode === 'class') {
        result = await createClassAction({
          name: formData.get('name') as string,
          grade: parseInt(formData.get('grade') as string, 10),
        });
      } else {
        result = await createSectionAction({
          name: formData.get('name') as string,
          classId,
        });
      }
      if (result.success) {
        toast.success(`${mode === 'class' ? 'Class' : 'Section'} created`);
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
          <DialogTitle>Create {mode === 'class' ? 'Class' : 'Section'}</DialogTitle>
          <DialogDescription>
            {mode === 'class' ? 'Add a new class/grade.' : 'Add a section to a class.'}
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              placeholder={mode === 'class' ? 'e.g. Grade 10' : 'e.g. Section A'}
              required
              disabled={isPending}
            />
          </div>
          {mode === 'class' ? (
            <div className="space-y-2">
              <Label htmlFor="grade">Grade Number</Label>
              <Input id="grade" name="grade" type="number" min={1} max={12} required disabled={isPending} />
            </div>
          ) : (
            <div className="space-y-2">
              <Label>Class</Label>
              <Select value={classId} onValueChange={setClassId} disabled={isPending}>
                <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                <SelectContent>
                  {classes?.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isPending || (mode === 'section' && !classId)}>
              {isPending && <Spinner size="sm" className="mr-2" />}Create
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
