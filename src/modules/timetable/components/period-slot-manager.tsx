'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { ConfirmDialog, Spinner } from '@/components/shared';
import { useInvalidateCache } from '@/lib/cache-utils';
import { useReferenceStore } from '@/stores';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { createPeriodSlotAction, updatePeriodSlotAction, deletePeriodSlotAction } from '../period-slot-actions';
import { useAllPeriodSlots } from '../hooks/use-timetable';
import { formatTimeRange } from '../timetable.utils';
import { PeriodSlotDialog, emptyPeriodSlotForm } from './period-slot-dialog';
import type { PeriodSlotFormState } from './period-slot-dialog';
import type { PeriodSlotListItem } from '../timetable.types';

export function PeriodSlotManager() {
  const [isPending, startTransition] = useTransition();
  const invalidate = useInvalidateCache();
  const { classes } = useReferenceStore();

  const { data: allSlots, isLoading } = useAllPeriodSlots();

  const [scopeClassId, setScopeClassId] = useState<string | null>(null);
  const [scopeSectionId, setScopeSectionId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<PeriodSlotFormState>(emptyPeriodSlotForm);

  // Sections for currently selected class
  const scopeClass = classes.find((c) => c.id === scopeClassId);
  const scopeSections = scopeClass?.sections ?? [];

  // Filter slots by currently selected scope (class + section)
  const filteredSlots = (allSlots ?? []).filter((slot: PeriodSlotListItem) => {
    if (scopeSectionId) return slot.classId === scopeClassId && slot.sectionId === scopeSectionId;
    if (scopeClassId) return slot.classId === scopeClassId && slot.sectionId === null;
    return slot.classId === null && slot.sectionId === null;
  });
  const sortedSlots = [...filteredSlots].sort((a, b) => a.sortOrder - b.sortOrder);

  function openCreate() {
    setEditingId(null);
    setForm({
      ...emptyPeriodSlotForm,
      sortOrder: String((sortedSlots.at(-1)?.sortOrder ?? 0) + 1),
      classId: scopeClassId ?? null,
      sectionId: scopeSectionId ?? null,
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
      classId: slot.classId ?? null,
      sectionId: slot.sectionId ?? null,
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
        classId: form.classId,
        sectionId: form.sectionId,
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
        <div>
          <h3 className="text-lg font-semibold">Period Slots</h3>
          <p className="text-sm text-muted-foreground">
            {scopeSectionId
              ? `Section-specific periods for ${scopeClass?.name} — ${scopeSections.find((s) => s.id === scopeSectionId)?.name}`
              : scopeClassId
                ? `Class-specific periods for ${scopeClass?.name ?? 'selected class'}`
                : 'Global periods (shared by all classes without custom periods)'}
          </p>
        </div>
        <Button onClick={openCreate} size="sm" disabled={isLoading}>
          <Plus className="mr-1 h-4 w-4" />
          Add Period
        </Button>
      </div>

      {/* Scope selector — pick Global, Class, or Section */}
      <div className="flex items-end gap-4">
        <div className="w-64">
          <Label className="text-xs text-muted-foreground mb-1 block">Class</Label>
          <Select
            value={scopeClassId ?? '__global__'}
            onValueChange={(v) => {
              setScopeClassId(v === '__global__' ? null : v);
              setScopeSectionId(null);
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
        {scopeClassId && scopeSections.length > 0 && (
          <div className="w-52">
            <Label className="text-xs text-muted-foreground mb-1 block">Section</Label>
            <Select
              value={scopeSectionId ?? '__all__'}
              onValueChange={(v) => setScopeSectionId(v === '__all__' ? null : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select section" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All Sections</SelectItem>
                {scopeSections.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Spinner size="lg" />
        </div>
      ) : (
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
      )}

      <PeriodSlotDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        form={form}
        onFormChange={setForm}
        onSubmit={handleSubmit}
        isEditing={!!editingId}
        isPending={isPending}
      />

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
