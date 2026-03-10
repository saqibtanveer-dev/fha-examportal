'use client';

import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

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
    <>
      {/* ── Mobile Card View ── */}
      <div className="space-y-2 md:hidden">
        {data.map((row, idx) => (
          <div key={row.studentProfileId} className="rounded-lg border bg-card p-3 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">
                  {idx + 1}. {row.studentName}
                </p>
                <p className="text-xs text-muted-foreground">Roll: {row.rollNumber}</p>
              </div>
              <Badge variant={row.percentage >= 75 ? 'default' : 'destructive'} className="font-mono shrink-0">
                {row.percentage.toFixed(1)}%
              </Badge>
            </div>
            <div className="grid grid-cols-4 gap-1 text-center text-xs">
              <div className="rounded bg-green-50 dark:bg-green-950/30 p-1">
                <p className="font-medium text-green-700 dark:text-green-400">{row.present}</p>
                <p className="text-[10px] text-muted-foreground">Present</p>
              </div>
              <div className="rounded bg-red-50 dark:bg-red-950/30 p-1">
                <p className="font-medium text-red-700 dark:text-red-400">{row.absent}</p>
                <p className="text-[10px] text-muted-foreground">Absent</p>
              </div>
              <div className="rounded bg-amber-50 dark:bg-amber-950/30 p-1">
                <p className="font-medium text-amber-700 dark:text-amber-400">{row.late}</p>
                <p className="text-[10px] text-muted-foreground">Late</p>
              </div>
              <div className="rounded bg-blue-50 dark:bg-blue-950/30 p-1">
                <p className="font-medium text-blue-700 dark:text-blue-400">{row.excused}</p>
                <p className="text-[10px] text-muted-foreground">Excused</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Desktop Table View ── */}
      <div className="hidden md:block rounded-md border">
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
    </>
  );
}
