'use client';

import { AttendanceStatus } from '@prisma/client';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AttendanceStatusBadge } from './attendance-status-badge';
import { formatAttendanceDate } from '../attendance.utils';

// Note: Records coming from server actions are serialized (dates as strings).
// We use permissive types to handle both raw Prisma and serialized data.

// ── Daily attendance table ──

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
    <div className="rounded-md border">
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
  );
}

// ── Subject attendance table ──

type SubjectRecord = {
  id: string;
  date: string | Date;
  status: AttendanceStatus;
  remarks: string | null;
  studentProfile?: { rollNumber: string; user: { firstName: string; lastName: string } };
  subject: { name: string };
  periodSlot: { shortName: string };
};

type SubjectTableProps = {
  records: SubjectRecord[];
  showStudent?: boolean;
  showDate?: boolean;
  showSubject?: boolean;
};

export function SubjectAttendanceTable({
  records,
  showStudent = true,
  showDate = true,
  showSubject = true,
}: SubjectTableProps) {
  if (!records.length) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">
        No subject attendance records found.
      </p>
    );
  }

  return (
    <div className="rounded-md border">
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
            {showSubject && <TableHead>Subject</TableHead>}
            <TableHead>Period</TableHead>
            <TableHead>Status</TableHead>
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
              {showSubject && (
                <TableCell>
                  <Badge variant="secondary">{r.subject.name}</Badge>
                </TableCell>
              )}
              <TableCell className="text-sm">
                {r.periodSlot.shortName}
              </TableCell>
              <TableCell>
                <AttendanceStatusBadge status={r.status} />
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {r.remarks ?? '—'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// ── Student-wise summary table ──

type StudentWiseRow = {
  studentProfileId: string;
  studentName: string;
  rollNumber: string;
  present: number;
  absent: number;
  late: number;
  excused: number;
  total: number;
  percentage: number;
};

type StudentWiseTableProps = {
  data: StudentWiseRow[];
};

export function StudentWiseAttendanceTable({ data }: StudentWiseTableProps) {
  if (!data.length) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">
        No attendance data available.
      </p>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">#</TableHead>
            <TableHead className="w-20">Roll No.</TableHead>
            <TableHead>Student Name</TableHead>
            <TableHead className="text-center w-16">P</TableHead>
            <TableHead className="text-center w-16">A</TableHead>
            <TableHead className="text-center w-16">L</TableHead>
            <TableHead className="text-center w-16">E</TableHead>
            <TableHead className="text-center w-20">Total</TableHead>
            <TableHead className="text-center w-20">%</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, idx) => (
            <TableRow key={row.studentProfileId}>
              <TableCell className="text-muted-foreground">{idx + 1}</TableCell>
              <TableCell className="font-mono text-sm">{row.rollNumber}</TableCell>
              <TableCell className="font-medium">{row.studentName}</TableCell>
              <TableCell className="text-center text-green-700 font-medium">{row.present}</TableCell>
              <TableCell className="text-center text-red-700 font-medium">{row.absent}</TableCell>
              <TableCell className="text-center text-amber-700 font-medium">{row.late}</TableCell>
              <TableCell className="text-center text-blue-700 font-medium">{row.excused}</TableCell>
              <TableCell className="text-center">{row.total}</TableCell>
              <TableCell className="text-center">
                <Badge
                  variant={row.percentage >= 75 ? 'default' : 'destructive'}
                  className="font-mono"
                >
                  {row.percentage.toFixed(1)}%
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
