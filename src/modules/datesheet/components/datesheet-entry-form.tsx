'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
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
  DialogFooter,
} from '@/components/ui/dialog';
import { Trash2, Users, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { RefClass, RefSubjectClassLink, RefSubject } from '@/stores/reference-store';
import type { DeepSerialize } from '@/utils/serialize';
import type { DatesheetEntryWithRelations } from '../datesheet.types';

type SerializedEntry = DeepSerialize<DatesheetEntryWithRelations>;

type Props = {
  open: boolean;
  onClose: () => void;
  datesheetId: string;
  prefilledDate?: string;
  prefilledClassId?: string;
  prefilledSectionId?: string;
  entry?: SerializedEntry | null;
  classes: RefClass[];
  subjects: RefSubject[];
  subjectClassLinks: RefSubjectClassLink[];
  onCreate: (data: {
    datesheetId: string;
    classId: string;
    sectionId: string;
    subjectId: string;
    examDate: string;
    startTime: string;
    endTime: string;
    room?: string;
    instructions?: string;
    totalMarks?: number;
    applyToAllSections?: boolean;
  }) => void;
  onUpdate: (id: string, data: Record<string, unknown>) => void;
  onDelete: (id: string) => void;
  onManageDuties?: (entry: SerializedEntry) => void;
  isPending: boolean;
};

export function DatesheetEntryForm({
  open, onClose, datesheetId, prefilledDate, prefilledClassId, prefilledSectionId, entry,
  classes, subjects, subjectClassLinks, onCreate, onUpdate, onDelete, onManageDuties, isPending,
}: Props) {
  const [classId, setClassId] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [applyToAll, setApplyToAll] = useState(false);
  const [subjectId, setSubjectId] = useState('');
  const [examDate, setExamDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('12:00');
  const [room, setRoom] = useState('');
  const [instructions, setInstructions] = useState('');
  const [totalMarks, setTotalMarks] = useState('');

  const isEditing = !!entry;

  useEffect(() => {
    if (entry) {
      setClassId(entry.classId);
      setSectionId(entry.sectionId);
      setApplyToAll(false);
      setSubjectId(entry.subjectId);
      setExamDate(typeof entry.examDate === 'string' ? entry.examDate.slice(0, 10) : '');
      setStartTime(entry.startTime);
      setEndTime(entry.endTime);
      setRoom(entry.room ?? '');
      setInstructions(entry.instructions ?? '');
      setTotalMarks(entry.totalMarks ? String(Number(entry.totalMarks)) : '');
    } else {
      setClassId(prefilledClassId ?? '');
      setSectionId(prefilledSectionId ?? '');
      setApplyToAll(false);
      setSubjectId('');
      setExamDate(prefilledDate ?? '');
      setStartTime('09:00');
      setEndTime('12:00');
      setRoom('');
      setInstructions('');
      setTotalMarks('');
    }
  }, [entry, prefilledDate, prefilledClassId, prefilledSectionId, open]);

  const selectedClass = classes.find((c) => c.id === classId);
  const sections = selectedClass?.sections ?? [];
  const classLinks = subjectClassLinks.filter((l) => l.classId === classId);
  const availableSubjectIds = classLinks.map((l) => l.subjectId);
  const filteredSubjects = subjects.filter((s) => availableSubjectIds.includes(s.id));

  // Check if selected subject is elective
  const selectedSubjectLink = subjectId
    ? classLinks.find((l) => l.subjectId === subjectId)
    : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && entry) {
      onUpdate(entry.id, {
        subjectId,
        examDate,
        startTime,
        endTime,
        room: room || undefined,
        instructions: instructions || undefined,
        totalMarks: totalMarks ? Number(totalMarks) : undefined,
      });
    } else {
      onCreate({
        datesheetId,
        classId,
        sectionId,
        subjectId,
        examDate,
        startTime,
        endTime,
        room: room || undefined,
        instructions: instructions || undefined,
        totalMarks: totalMarks ? Number(totalMarks) : undefined,
        applyToAllSections: applyToAll || undefined,
      });
    }
  };

  const isValid = classId && (applyToAll || sectionId) && subjectId && examDate && startTime && endTime;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Entry' : 'Add Entry'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Class</Label>
              <Select value={classId} onValueChange={(v) => { setClassId(v); setSectionId(''); setSubjectId(''); }} disabled={isEditing}>
                <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                <SelectContent>
                  {classes.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Section</Label>
              {!isEditing && sections.length > 1 && (
                <div className="flex items-center gap-2 mb-1">
                  <Checkbox
                    id="applyToAll"
                    checked={applyToAll}
                    onCheckedChange={(v) => setApplyToAll(v === true)}
                  />
                  <label htmlFor="applyToAll" className="text-xs text-muted-foreground cursor-pointer">
                    Apply to all sections
                  </label>
                </div>
              )}
              <Select
                value={sectionId}
                onValueChange={setSectionId}
                disabled={isEditing || applyToAll}
              >
                <SelectTrigger><SelectValue placeholder={applyToAll ? 'All sections' : 'Select section'} /></SelectTrigger>
                <SelectContent>
                  {sections.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Subject</Label>
            <Select value={subjectId} onValueChange={setSubjectId}>
              <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
              <SelectContent>
                {filteredSubjects.map((s) => {
                  const link = classLinks.find((l) => l.subjectId === s.id);
                  return (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} ({s.code}){link?.isElective ? ' ⚡' : ''}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {selectedSubjectLink?.isElective && (
              <Badge variant="outline" className="mt-1 gap-1 text-xs">
                <Zap className="h-3 w-3 text-amber-500" />
                Elective{selectedSubjectLink.electiveGroupName ? ` — ${selectedSubjectLink.electiveGroupName}` : ''}
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Start Time</Label>
              <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>End Time</Label>
              <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Room (optional)</Label>
              <Input value={room} onChange={(e) => setRoom(e.target.value)} placeholder="Room 101" />
            </div>
            <div className="space-y-2">
              <Label>Total Marks (optional)</Label>
              <Input type="number" value={totalMarks} onChange={(e) => setTotalMarks(e.target.value)} placeholder="100" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Instructions (optional)</Label>
            <Textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} rows={2} placeholder="Bring calculator" />
          </div>

          <DialogFooter className="gap-2">
            {isEditing && entry && (
              <div className="flex gap-2">
                <Button type="button" variant="destructive" size="sm" onClick={() => onDelete(entry.id)} disabled={isPending}>
                  <Trash2 className="mr-1 h-4 w-4" /> Delete
                </Button>
                {onManageDuties && (
                  <Button type="button" variant="secondary" size="sm" onClick={() => onManageDuties(entry)} disabled={isPending}>
                    <Users className="mr-1 h-4 w-4" /> Duties ({entry.duties?.length ?? 0})
                  </Button>
                )}
              </div>
            )}
            <div className="flex-1" />
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={!isValid || isPending}>
              {isPending ? 'Saving...' : isEditing ? 'Update' : 'Add Entry'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
