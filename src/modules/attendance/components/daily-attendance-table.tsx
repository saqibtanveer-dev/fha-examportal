'use client';

import { AttendanceStatus } from '@prisma/client';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { AttendanceStatusBadge } from './attendance-status-badge';
import { formatAttendanceDate } from '../attendance.utils';

type DailyRecord = {
  id: string;
  date: string | Date;
  status: AttendanceStatus;
  remarks: string | null;
  studentProfile?: { rollNumber: string; user: { firstName: string; lastName: string } };
  markedBy: { firstName: string; lastName: string };
};

type DailyTableProps = {
  records: DailyRecord[];
  showStudent?: boolean;
  showDate?: boolean;
};

export function DailyAttendanceTable({
  records,
  showStudent = true,
  showDate = true,
}: DailyTableProps) {
  if (!records.length) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">
        No attendance records found.
      </p>
    );
  }

  return (
    <>
      {/* ── Mobile Card View ── */}
      <div className="space-y-2 md:hidden">
        {records.map((r) => (
          <div key={r.id} className="rounded-lg border bg-card p-3 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              {showStudent && r.studentProfile && (
                <p className="text-sm font-medium truncate">
                  {r.studentProfile.user.firstName} {r.studentProfile.user.lastName}
                  <span className="text-xs text-muted-foreground ml-1">({r.studentProfile.rollNumber})</span>
                </p>
              )}
              <AttendanceStatusBadge status={r.status} />
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
              {showDate && <span>{formatAttendanceDate(r.date)}</span>}
              <span>By: {r.markedBy.firstName} {r.markedBy.lastName}</span>
              {r.remarks && <span className="italic">{r.remarks}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* ── Desktop Table View ── */}
      <div className="hidden md:block rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {showDate && <TableHead>Date</TableHead>}
              {showStudent && (
                <>
                  <TableHead>Roll No.</TableHead>
                  <TableHead>Student Name</TableHead>
                </>
              )}
              <TableHead>Status</TableHead>
              <TableHead>Marked By</TableHead>
              <TableHead>Remarks</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((r) => (
              <TableRow key={r.id}>
                {showDate && (
                  <TableCell className="text-sm">
                    {formatAttendanceDate(r.date)}
                  </TableCell>
                )}
                {showStudent && r.studentProfile && (
                  <>
                    <TableCell className="font-mono text-sm">
                      {r.studentProfile.rollNumber}
                    </TableCell>
                    <TableCell className="font-medium">
                      {r.studentProfile.user.firstName} {r.studentProfile.user.lastName}
                    </TableCell>
                  </>
                )}
                <TableCell>
                  <AttendanceStatusBadge status={r.status} />
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {r.markedBy.firstName} {r.markedBy.lastName}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {r.remarks ?? '—'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
