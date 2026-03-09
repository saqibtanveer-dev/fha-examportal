'use client';

import { useState, useTransition } from 'react';
import { useInvalidateCache } from '@/lib/cache-utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Spinner } from '@/components/shared';
import { bulkCreateStructuresAction } from '@/modules/fees/fee-structure-actions';
import { useReferenceStore } from '@/stores/reference-store';
import { toast } from 'sonner';
import type { SerializedFeeCategory } from '@/modules/fees/fee.types';

type ClassOption = { id: string; name: string; grade: number };

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: SerializedFeeCategory[];
  classes: ClassOption[];
};

export function BulkCreateStructureDialog({ open, onOpenChange, categories, classes }: Props) {
  const [isPending, startTransition] = useTransition();
  const [categoryId, setCategoryId] = useState('');
  const [amounts, setAmounts] = useState<Record<string, string>>({});
  const invalidate = useInvalidateCache();
  const { academicSessions } = useReferenceStore();
  const currentSessionId = academicSessions.find((s) => s.isCurrent)?.id;

  function handleAmountChange(classId: string, value: string) {
    setAmounts((prev) => ({ ...prev, [classId]: value }));
  }

  function handleApplyToAll() {
    const firstValue = Object.values(amounts).find((v) => v && Number(v) > 0);
    if (!firstValue) return;
    const newAmounts: Record<string, string> = {};
    for (const c of classes) {
      newAmounts[c.id] = firstValue;
    }
    setAmounts(newAmounts);
  }

  function handleSubmit() {
    if (!categoryId) {
      toast.error('Select a category');
      return;
    }
    if (!currentSessionId) {
      toast.error('No active academic session');
      return;
    }

    const classAmounts = classes
      .filter((c) => amounts[c.id] && Number(amounts[c.id]) > 0)
      .map((c) => ({ classId: c.id, amount: Number(amounts[c.id]) }));

    if (classAmounts.length === 0) {
      toast.error('Enter amounts for at least one class');
      return;
    }

    startTransition(async () => {
      const result = await bulkCreateStructuresAction({
        categoryId,
        academicSessionId: currentSessionId,
        classAmounts,
      });

      if (result.success) {
        toast.success(`Structures created for ${result.data?.count ?? 0} classes`);
        onOpenChange(false);
        setCategoryId('');
        setAmounts({});
        await invalidate.feeStructures();
      } else {
        toast.error(result.error ?? 'Failed');
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Setup Fee Structure</DialogTitle>
          <DialogDescription>Set the amount for a fee category across all classes.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Fee Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId} disabled={isPending}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.filter((c) => c.isActive).map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end">
            <Button type="button" variant="outline" size="sm" onClick={handleApplyToAll}>
              Apply First Amount to All
            </Button>
          </div>

          <div className="space-y-2">
            {classes
              .sort((a, b) => a.grade - b.grade)
              .map((cls) => (
                <div key={cls.id} className="flex items-center gap-3">
                  <Label className="w-32 shrink-0">{cls.name}</Label>
                  <Input
                    type="number"
                    min={0}
                    step={1}
                    placeholder="Amount"
                    value={amounts[cls.id] ?? ''}
                    onChange={(e) => handleAmountChange(cls.id, e.target.value)}
                    disabled={isPending}
                    className="font-mono"
                  />
                </div>
              ))}
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={isPending || !categoryId}>
              {isPending && <Spinner size="sm" className="mr-2" />}
              Save Structures
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
