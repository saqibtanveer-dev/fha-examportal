'use client';

import { useState, useMemo, useTransition } from 'react';
import { DayOfWeek } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/shared';
import { useInvalidateCache } from '@/lib/cache-utils';
import { useReferenceStore } from '@/stores';
import { toast } from 'sonner';
import { createTimetableEntryAction, updateTimetableEntryAction, deleteTimetableEntryAction } from '../timetable-entry-actions';
import { ORDERED_DAYS, DAY_LABELS } from '../timetable.constants';
import type { PeriodSlotListItem, TimetableEntryWithRelations } from '../timetable.types';
import { Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type SubjectOption = { id: string; name: string; code: string };
type TeacherOption = { id: string; employeeId: string; user: { id: string; firstName: string; lastName: string } };

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classId: string;
  sectionId: string;
  academicSessionId: string;
  periodSlots: PeriodSlotListItem[];
  subjects: SubjectOption[];
  teachers: TeacherOption[];
  initialDayOfWeek?: DayOfWeek;
  initialPeriodSlotId?: string;
  existingEntry?: TimetableEntryWithRelations | null;
};

export function TimetableEntryForm({
  open,
  onOpenChange,
  classId,
  sectionId,
  academicSessionId,
  periodSlots,
  subjects,
  teachers,
  initialDayOfWeek,
  initialPeriodSlotId,
  existingEntry,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const invalidate = useInvalidateCache();
  const { subjectClassLinks } = useReferenceStore();

  const [dayOfWeek, setDayOfWeek] = useState<DayOfWeek>(initialDayOfWeek ?? DayOfWeek.MONDAY);
  const [periodSlotId, setPeriodSlotId] = useState(initialPeriodSlotId ?? '');
  const [subjectId, setSubjectId] = useState(existingEntry?.subject.id ?? '');
  const [teacherProfileId, setTeacherProfileId] = useState(existingEntry?.teacherProfile.id ?? '');
  const [room, setRoom] = useState(existingEntry?.room ?? '');

  const isEditing = !!existingEntry;
  const activePeriods = periodSlots.filter((p) => p.isActive && !p.isBreak);

  // Filter subjects to only those linked to the selected class
  const filteredSubjects = useMemo(() => {
    if (!subjectClassLinks.length) return subjects;
    const linkedSubjectIds = new Set(
      subjectClassLinks
        .filter((link) => link.classId === classId)
        .map((link) => link.subjectId),
    );
    if (linkedSubjectIds.size === 0) return subjects;
    return subjects.filter((s) => linkedSubjectIds.has(s.id));
  }, [subjects, subjectClassLinks, classId]);

  // Check if selected subject is elective
  const selectedSubjectLink = useMemo(() => {
    if (!subjectId) return null;
    return subjectClassLinks.find((l) => l.subjectId === subjectId && l.classId === classId) ?? null;
  }, [subjectId, subjectClassLinks, classId]);

  function handleSubmit() {
    if (!periodSlotId || !subjectId || !teacherProfileId) {
      toast.error('Please fill all required fields');
      return;
    }

    startTransition(async () => {
      if (isEditing) {
        const result = await updateTimetableEntryAction(existingEntry.id, {
          subjectId,
          teacherProfileId,
          room: room || undefined,
        });
        if (result.success) {
          toast.success('Timetable entry updated');
          onOpenChange(false);
          await invalidate.afterTimetableMutation();
        } else {
          toast.error(result.error ?? 'Failed to update');
        }
      } else {
        const result = await createTimetableEntryAction({
          classId,
          sectionId,
          subjectId,
          teacherProfileId,
          periodSlotId,
          dayOfWeek,
          academicSessionId,
          room: room || undefined,
        });
        if (result.success) {
          toast.success('Timetable entry created');
          onOpenChange(false);
          await invalidate.afterTimetableMutation();
        } else {
          toast.error(result.error ?? 'Failed to create');
        }
      }
    });
  }

  function handleDelete() {
    if (!existingEntry) return;
    startTransition(async () => {
      const result = await deleteTimetableEntryAction(existingEntry.id);
      if (result.success) {
        toast.success('Entry removed');
        onOpenChange(false);
        await invalidate.afterTimetableMutation();
      } else {
        toast.error(result.error ?? 'Failed to delete');
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Timetable Entry' : 'Add Timetable Entry'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Day</Label>
              <Select value={dayOfWeek} onValueChange={(v) => setDayOfWeek(v as DayOfWeek)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ORDERED_DAYS.map((day) => (
                    <SelectItem key={day} value={day}>{DAY_LABELS[day]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Period</Label>
              <Select value={periodSlotId} onValueChange={setPeriodSlotId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  {activePeriods.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} ({p.startTime}&ndash;{p.endTime})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Subject</Label>
            <Select value={subjectId} onValueChange={setSubjectId}>
              <SelectTrigger>
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent>
                {filteredSubjects.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name} ({s.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedSubjectLink?.isElective && (
              <Badge variant="outline" className="mt-1 gap-1 text-xs">
                <Zap className="h-3 w-3 text-amber-500" />
                Elective{selectedSubjectLink.electiveGroupName ? ` — ${selectedSubjectLink.electiveGroupName}` : ''}
              </Badge>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Teacher</Label>
            <Select value={teacherProfileId} onValueChange={setTeacherProfileId}>
              <SelectTrigger>
                <SelectValue placeholder="Select teacher" />
              </SelectTrigger>
              <SelectContent>
                {teachers.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.user.firstName} {t.user.lastName} ({t.employeeId})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Room (optional)</Label>
            <Input
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              placeholder="e.g. Room 101"
              maxLength={50}
            />
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between">
          {isEditing && (
            <Button variant="destructive" onClick={handleDelete} disabled={isPending} size="sm">
              Delete
            </Button>
          )}
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={isPending}>
              {isPending && <Spinner size="sm" className="mr-2" />}
              {isEditing ? 'Update' : 'Create'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
