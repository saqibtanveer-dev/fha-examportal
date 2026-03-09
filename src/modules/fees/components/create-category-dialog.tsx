'use client';

import { useState, useTransition } from 'react';
import { useInvalidateCache } from '@/lib/cache-utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Spinner } from '@/components/shared';
import { createFeeCategoryAction } from '@/modules/fees/fee-category-actions';
import { toast } from 'sonner';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const FREQUENCY_OPTIONS = [
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'TERM', label: 'Term-wise' },
  { value: 'ANNUAL', label: 'Annual' },
  { value: 'ONE_TIME', label: 'One Time' },
];

export function CreateCategoryDialog({ open, onOpenChange }: Props) {
  const [isPending, startTransition] = useTransition();
  const [isMandatory, setIsMandatory] = useState(true);
  const [isRefundable, setIsRefundable] = useState(false);
  const invalidate = useInvalidateCache();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await createFeeCategoryAction({
        name: formData.get('name') as string,
        description: (formData.get('description') as string) || undefined,
        frequency: formData.get('frequency') as 'MONTHLY' | 'TERM' | 'ANNUAL' | 'ONE_TIME',
        isMandatory,
        isRefundable,
        sortOrder: Number(formData.get('sortOrder') || 0),
      });

      if (result.success) {
        toast.success('Fee category created');
        onOpenChange(false);
        await invalidate.feeCategories();
      } else {
        toast.error(result.error ?? 'Failed to create category');
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Fee Category</DialogTitle>
          <DialogDescription>Define a new type of fee.</DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" placeholder="e.g. Tuition Fee" required disabled={isPending} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea id="description" name="description" rows={2} disabled={isPending} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="frequency">Frequency</Label>
            <Select name="frequency" defaultValue="MONTHLY" disabled={isPending}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FREQUENCY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sortOrder">Sort Order</Label>
            <Input id="sortOrder" name="sortOrder" type="number" defaultValue={0} min={0} disabled={isPending} />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="isMandatory">Mandatory</Label>
            <Switch id="isMandatory" checked={isMandatory} onCheckedChange={setIsMandatory} disabled={isPending} />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="isRefundable">Refundable</Label>
            <Switch id="isRefundable" checked={isRefundable} onCheckedChange={setIsRefundable} disabled={isPending} />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Spinner size="sm" className="mr-2" />}
              Create
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
