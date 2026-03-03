'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ATTENDANCE_STATUS_CONFIG, ATTENDANCE_STATUSES } from '../attendance.constants';
import { calculateAttendancePercentage } from '../attendance.utils';
import type { AttendanceStatusCounts } from '../attendance.types';

type Props = {
  title?: string;
  counts: AttendanceStatusCounts;
  className?: string;
};

export function AttendanceSummaryCard({ title = 'Attendance Summary', counts, className }: Props) {
  const stats = calculateAttendancePercentage(counts);

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-baseline gap-2">
          <span className="text-3xl font-bold">{stats.percentage}%</span>
          <span className="text-sm text-muted-foreground">attendance rate</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {ATTENDANCE_STATUSES.map((status) => {
            const config = ATTENDANCE_STATUS_CONFIG[status];
            const count = {
              PRESENT: counts.present,
              ABSENT: counts.absent,
              LATE: counts.late,
              EXCUSED: counts.excused,
            }[status];

            return (
              <div
                key={status}
                className="flex items-center gap-2 rounded-lg border p-2"
              >
                <div className={`flex h-8 w-8 items-center justify-center rounded-full ${config.bgColor}`}>
                  <span className={config.color}>{config.icon}</span>
                </div>
                <div>
                  <p className="text-sm font-medium">{count}</p>
                  <p className="text-xs text-muted-foreground">{config.label}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-3 text-xs text-muted-foreground">
          Total: {counts.total} students
        </div>
      </CardContent>
    </Card>
  );
}
