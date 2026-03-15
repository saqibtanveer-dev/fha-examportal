'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/shared';
import { useReferenceStore } from '@/stores';

export type PeriodSlotFormState = {
  name: string;
  shortName: string;
  startTime: string;
  endTime: string;
  sortOrder: string;
  isBreak: boolean;
  classId: string | null;
  sectionId: string | null;
};

export const emptyPeriodSlotForm: PeriodSlotFormState = {
  name: '',
  shortName: '',
  startTime: '',
  endTime: '',
  sortOrder: '',
  isBreak: false,
  classId: null,
  sectionId: null,
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: PeriodSlotFormState;
  onFormChange: (form: PeriodSlotFormState) => void;
  onSubmit: () => void;
  isEditing: boolean;
  isPending: boolean;
};

export function PeriodSlotDialog({
  open,
  onOpenChange,
  form,
  onFormChange,
  onSubmit,
  isEditing,
  isPending,
}: Props) {
  const { classes } = useReferenceStore();
  const selectedClass = classes.find((c) => c.id === form.classId);
  const sections = selectedClass?.sections ?? [];
  const setField = <K extends keyof PeriodSlotFormState>(key: K, value: PeriodSlotFormState[K]) =>
    onFormChange({ ...form, [key]: value });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Period Slot' : 'New Period Slot'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Class Scope</Label>
              <Select
                value={form.classId ?? '__global__'}
                onValueChange={(v) => {
                  const newClassId = v === '__global__' ? null : v;
                  onFormChange({ ...form, classId: newClassId, sectionId: null });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select scope" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__global__">Global (All Classes)</SelectItem>
                  {classes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {form.classId && sections.length > 0 && (
              <div className="space-y-1.5">
                <Label>Section Scope</Label>
                <Select
                  value={form.sectionId ?? '__all__'}
                  onValueChange={(v) => setField('sectionId', v === '__all__' ? null : v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select section" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">All Sections</SelectItem>
                    {sections.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setField('name', e.target.value)}
                placeholder="Period 1"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Short Name</Label>
              <Input
                value={form.shortName}
                onChange={(e) => setField('shortName', e.target.value)}
                placeholder="P1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Start Time</Label>
              <Input
                type="time"
                value={form.startTime}
                onChange={(e) => setField('startTime', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>End Time</Label>
              <Input
                type="time"
                value={form.endTime}
                onChange={(e) => setField('endTime', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Sort Order</Label>
              <Input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setField('sortOrder', e.target.value)}
                min={1}
              />
            </div>
            <div className="flex items-center gap-3 pt-6">
              <Switch
                checked={form.isBreak}
                onCheckedChange={(checked) => setField('isBreak', checked)}
              />
              <Label>Break Period</Label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={onSubmit} disabled={isPending}>
            {isPending && <Spinner size="sm" className="mr-2" />}
            {isEditing ? 'Update' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
