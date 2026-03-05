'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
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
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { DUTY_ROLES, DUTY_ROLE_LABELS } from '../datesheet.constants';
import type { DutyRole } from '../datesheet.constants';
import type { DeepSerialize } from '@/utils/serialize';
import type { DatesheetDutyWithTeacher } from '../datesheet.types';

type SerializedDuty = DeepSerialize<DatesheetDutyWithTeacher>;

type TeacherOption = {
  id: string;
  employeeId: string;
  user: { id: string; firstName: string; lastName: string };
};

type Props = {
  open: boolean;
  onClose: () => void;
  entryId: string;
  existingDuties: SerializedDuty[];
  teachers: TeacherOption[];
  onAssign: (data: { datesheetEntryId: string; teacherProfileId: string; role: DutyRole; room?: string }) => void;
  onRemove: (dutyId: string) => void;
  isPending: boolean;
};

export function DatesheetDutyForm({ open, onClose, entryId, existingDuties, teachers, onAssign, onRemove, isPending }: Props) {
  const [teacherId, setTeacherId] = useState('');
  const [role, setRole] = useState<DutyRole>('INVIGILATOR');
  const [room, setRoom] = useState('');

  const assignedTeacherIds = new Set(existingDuties.map((d) => d.teacherProfileId));
  const availableTeachers = teachers.filter((t) => !assignedTeacherIds.has(t.id));

  const handleAssign = () => {
    if (!teacherId) return;
    onAssign({
      datesheetEntryId: entryId,
      teacherProfileId: teacherId,
      role,
      room: room || undefined,
    });
    setTeacherId('');
    setRoom('');
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-115">
        <DialogHeader>
          <DialogTitle>Manage Duties</DialogTitle>
        </DialogHeader>

        {existingDuties.length > 0 && (
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs">Current Duties</Label>
            {existingDuties.map((d) => (
              <div key={d.id} className="flex items-center justify-between rounded-md border px-3 py-2">
                <div>
                  <span className="font-medium text-sm">
                    {d.teacherProfile.user.firstName} {d.teacherProfile.user.lastName}
                  </span>
                  <Badge variant="outline" className="ml-2 text-xs">{DUTY_ROLE_LABELS[d.role] ?? d.role}</Badge>
                </div>
                <Button variant="ghost" size="icon" onClick={() => onRemove(d.id)} disabled={isPending}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-3 border-t pt-3">
          <Label className="text-muted-foreground text-xs">Add Duty</Label>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Teacher</Label>
              <Select value={teacherId} onValueChange={setTeacherId}>
                <SelectTrigger><SelectValue placeholder="Select teacher" /></SelectTrigger>
                <SelectContent>
                  {availableTeachers.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.user.firstName} {t.user.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Role</Label>
              <Select value={role} onValueChange={(v) => setRole(v as DutyRole)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DUTY_ROLES.map((r) => (
                    <SelectItem key={r} value={r}>{DUTY_ROLE_LABELS[r]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1">
            <Label>Room Override (optional)</Label>
            <Input value={room} onChange={(e) => setRoom(e.target.value)} placeholder="Room 101" />
          </div>
          <Button onClick={handleAssign} disabled={!teacherId || isPending} className="w-full">
            {isPending ? 'Assigning...' : 'Assign Duty'}
          </Button>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
