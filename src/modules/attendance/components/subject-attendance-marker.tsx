'use client';

import { useState, useTransition, useMemo } from 'react';
import { AttendanceStatus } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/shared';
import { useInvalidateCache } from '@/lib/cache-utils';
import { toast } from 'sonner';
import { RotateCcw, Save } from 'lucide-react';
import { markSubjectAttendanceAction } from '../subject-attendance-actions';
import { ATTENDANCE_STATUSES, ATTENDANCE_STATUS_CONFIG, DEFAULT_ATTENDANCE_STATUS } from '../attendance.constants';
import { AttendanceStatusBadge } from './attendance-status-badge';
import type { AttendanceMarkEntry } from '../attendance.types';

type Student = {
  id: string;
  rollNumber: string;
  user: { firstName: string; lastName: string };
};

type ExistingRecord = {
  id: string;
  studentProfileId: string;
  status: AttendanceStatus;
  remarks: string | null;
};

type Props = {
  classId: string;
  sectionId: string;
  subjectId: string;
  periodSlotId: string;
  timetableEntryId?: string;
  date: string;
  students: Student[];
  existingRecords?: ExistingRecord[];
  subjectName?: string;
  periodName?: string;
};

type StudentState = {
  studentProfileId: string;
  status: AttendanceStatus;
  remarks: string;
};

export function SubjectAttendanceMarker({
  classId,
  sectionId,
  subjectId,
  periodSlotId,
  timetableEntryId,
  date,
  students,
  existingRecords = [],
  subjectName,
  periodName,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const invalidate = useInvalidateCache();

  const existingMap = useMemo(() => {
    const map = new Map<string, ExistingRecord>();
    for (const r of existingRecords) map.set(r.studentProfileId, r);
    return map;
  }, [existingRecords]);

  const [records, setRecords] = useState<StudentState[]>(() =>
    students.map((s) => {
      const existing = existingMap.get(s.id);
      return {
        studentProfileId: s.id,
        status: existing?.status ?? DEFAULT_ATTENDANCE_STATUS,
        remarks: existing?.remarks ?? '',
      };
    }),
  );

  const isEditing = existingRecords.length > 0;

  function updateStatus(studentProfileId: string, status: AttendanceStatus) {
    setRecords((prev) =>
      prev.map((r) => (r.studentProfileId === studentProfileId ? { ...r, status } : r)),
    );
  }

  function updateRemarks(studentProfileId: string, remarks: string) {
    setRecords((prev) =>
      prev.map((r) => (r.studentProfileId === studentProfileId ? { ...r, remarks } : r)),
    );
  }

  function markAllAs(status: AttendanceStatus) {
    setRecords((prev) => prev.map((r) => ({ ...r, status })));
  }

  function resetAll() {
    setRecords(
      students.map((s) => {
        const existing = existingMap.get(s.id);
        return {
          studentProfileId: s.id,
          status: existing?.status ?? DEFAULT_ATTENDANCE_STATUS,
          remarks: existing?.remarks ?? '',
        };
      }),
    );
  }

  function handleSubmit() {
    startTransition(async () => {
      const input = {
        classId,
        sectionId,
        subjectId,
        periodSlotId,
        ...(timetableEntryId ? { timetableEntryId } : {}),
        date,
        records: records.map((r) => ({
          studentProfileId: r.studentProfileId,
          status: r.status,
          ...(r.remarks ? { remarks: r.remarks } : {}),
        })) as AttendanceMarkEntry[],
      };

      const result = await markSubjectAttendanceAction(input);
      if (result.success) {
        toast.success(
          isEditing ? 'Subject attendance updated' : 'Subject attendance marked',
        );
        await invalidate.afterSubjectAttendanceMark();
      } else {
        toast.error(result.error ?? 'Failed to mark subject attendance');
      }
    });
  }

  const statusCounts = useMemo(() => {
    const counts = { PRESENT: 0, ABSENT: 0, LATE: 0, EXCUSED: 0 };
    for (const r of records) counts[r.status]++;
    return counts;
  }, [records]);

  return (
    <div className="space-y-4">
      {/* Header info */}
      <div className="flex flex-wrap items-center gap-2">
        {subjectName && (
          <Badge variant="secondary" className="text-sm">{subjectName}</Badge>
        )}
        {periodName && (
          <Badge variant="outline" className="text-sm">{periodName}</Badge>
        )}
      </div>

      {/* Quick stats + bulk actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {ATTENDANCE_STATUSES.map((status) => (
            <Badge key={status} variant="outline" className="gap-1.5">
              <AttendanceStatusBadge status={status} size="sm" showLabel={false} />
              <span className="text-xs">
                {ATTENDANCE_STATUS_CONFIG[status].label}: {statusCounts[status]}
              </span>
            </Badge>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Mark all:</span>
          {ATTENDANCE_STATUSES.map((status) => (
            <Button
              key={status}
              variant="outline"
              size="sm"
              onClick={() => markAllAs(status)}
              disabled={isPending}
              className="h-7 px-2 text-xs"
            >
              {ATTENDANCE_STATUS_CONFIG[status].shortLabel}
            </Button>
          ))}
          <Button variant="ghost" size="sm" onClick={resetAll} disabled={isPending} className="h-7">
            <RotateCcw className="mr-1 h-3 w-3" />
            Reset
          </Button>
        </div>
      </div>

      {/* Student table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead className="w-20">Roll No.</TableHead>
              <TableHead>Student Name</TableHead>
              <TableHead className="w-36">Status</TableHead>
              <TableHead className="w-48">Remarks</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student, idx) => {
              const record = records.find((r) => r.studentProfileId === student.id);
              if (!record) return null;

              return (
                <TableRow key={student.id}>
                  <TableCell className="text-muted-foreground">{idx + 1}</TableCell>
                  <TableCell className="font-mono text-sm">{student.rollNumber}</TableCell>
                  <TableCell className="font-medium">
                    {student.user.firstName} {student.user.lastName}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={record.status}
                      onValueChange={(v) => updateStatus(student.id, v as AttendanceStatus)}
                      disabled={isPending}
                    >
                      <SelectTrigger className="h-8 w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ATTENDANCE_STATUSES.map((status) => (
                          <SelectItem key={status} value={status}>
                            <span className="flex items-center gap-1.5">
                              <span>{ATTENDANCE_STATUS_CONFIG[status].icon}</span>
                              <span>{ATTENDANCE_STATUS_CONFIG[status].label}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input
                      value={record.remarks}
                      onChange={(e) => updateRemarks(student.id, e.target.value)}
                      placeholder="Optional remarks..."
                      disabled={isPending}
                      className="h-8"
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Submit */}
      <div className="flex items-center justify-end">
        <Button onClick={handleSubmit} disabled={isPending} size="lg">
          {isPending ? (
            <Spinner size="sm" className="mr-2" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {isEditing ? 'Update Attendance' : 'Save Attendance'}
        </Button>
      </div>
    </div>
  );
}
