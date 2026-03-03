'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { ConfirmDialog, Spinner } from '@/components/shared';
import { useInvalidateCache } from '@/lib/cache-utils';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { createPeriodSlotAction, updatePeriodSlotAction, deletePeriodSlotAction } from '../period-slot-actions';
import { formatTimeRange } from '../timetable.utils';
import type { PeriodSlotListItem } from '../timetable.types';

type Props = {
  periodSlots: PeriodSlotListItem[];
};

type FormState = {
  name: string;
  shortName: string;
  startTime: string;
  endTime: string;
  sortOrder: string;
  isBreak: boolean;
};

const emptyForm: FormState = {
  name: '',
  shortName: '',
  startTime: '',
  endTime: '',
  sortOrder: '',
  isBreak: false,
};

export function PeriodSlotManager({ periodSlots }: Props) {
  const [isPending, startTransition] = useTransition();
  const invalidate = useInvalidateCache();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const sortedSlots = [...periodSlots].sort((a, b) => a.sortOrder - b.sortOrder);

  function openCreate() {
    setEditingId(null);
    setForm({
      ...emptyForm,
      sortOrder: String((sortedSlots.at(-1)?.sortOrder ?? 0) + 1),
    });
    setDialogOpen(true);
  }

  function openEdit(slot: PeriodSlotListItem) {
    setEditingId(slot.id);
    setForm({
      name: slot.name,
      shortName: slot.shortName,
      startTime: slot.startTime,
      endTime: slot.endTime,
      sortOrder: String(slot.sortOrder),
      isBreak: slot.isBreak,
    });
    setDialogOpen(true);
  }

  function handleSubmit() {
    startTransition(async () => {
      const input = {
        name: form.name,
        shortName: form.shortName,
        startTime: form.startTime,
        endTime: form.endTime,
        sortOrder: Number(form.sortOrder),
        isBreak: form.isBreak,
      };

      const result = editingId
        ? await updatePeriodSlotAction(editingId, input)
        : await createPeriodSlotAction(input);

      if (result.success) {
        toast.success(editingId ? 'Period slot updated' : 'Period slot created');
        setDialogOpen(false);
        await invalidate.afterTimetableMutation();
      } else {
        toast.error(result.error ?? 'Failed to save period slot');
      }
    });
  }

  function handleDelete() {
    if (!deleteId) return;
    startTransition(async () => {
      const result = await deletePeriodSlotAction(deleteId);
      if (result.success) {
        toast.success('Period slot deleted');
        setDeleteId(null);
        await invalidate.afterTimetableMutation();
      } else {
        toast.error(result.error ?? 'Failed to delete');
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Period Slots</h3>
        <Button onClick={openCreate} size="sm">
          <Plus className="mr-1 h-4 w-4" />
          Add Period
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Short Name</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedSlots.map((slot) => (
              <TableRow key={slot.id}>
                <TableCell className="text-muted-foreground">{slot.sortOrder}</TableCell>
                <TableCell className="font-medium">{slot.name}</TableCell>
                <TableCell>{slot.shortName}</TableCell>
                <TableCell className="text-sm">
                  {formatTimeRange(slot.startTime, slot.endTime)}
                </TableCell>
                <TableCell>
                  {slot.isBreak ? (
                    <Badge variant="outline">Break</Badge>
                  ) : (
                    <Badge variant="secondary">Class</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={slot.isActive ? 'default' : 'destructive'}>
                    {slot.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(slot)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={() => setDeleteId(slot.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {sortedSlots.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  No period slots configured. Add your first period slot.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Period Slot' : 'New Period Slot'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Name</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Period 1"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Short Name</Label>
                <Input
                  value={form.shortName}
                  onChange={(e) => setForm((f) => ({ ...f, shortName: e.target.value }))}
                  placeholder="P1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Start Time</Label>
                <Input
                  type="time"
                  value={form.startTime}
                  onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>End Time</Label>
                <Input
                  type="time"
                  value={form.endTime}
                  onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Sort Order</Label>
                <Input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value }))}
                  min={1}
                />
              </div>
              <div className="flex items-center gap-3 pt-6">
                <Switch
                  checked={form.isBreak}
                  onCheckedChange={(checked) => setForm((f) => ({ ...f, isBreak: checked }))}
                />
                <Label>Break Period</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={isPending}>
              {isPending && <Spinner size="sm" className="mr-2" />}
              {editingId ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Period Slot"
        description="This action cannot be undone. Active timetable entries using this slot must be removed first."
        onConfirm={handleDelete}
        isLoading={isPending}
        variant="destructive"
      />
    </div>
  );
}
