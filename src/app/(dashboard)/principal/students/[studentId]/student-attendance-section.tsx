'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/shared';
import {
  AttendanceSummaryCard,
  AttendanceCalendar,
  DailyAttendanceTable,
} from '@/modules/attendance/components';
import {
  useStudentDailyAttendance,
} from '@/modules/attendance/hooks/use-daily-attendance';
import { useStudentAttendanceCounts } from '@/modules/attendance/hooks/use-attendance-stats';
import { getMonthDates, isWeekend } from '@/modules/attendance/attendance.utils';
import type { AttendanceStatus } from '@prisma/client';
import type { MonthlyCalendarDay } from '@/modules/attendance/attendance.types';

type Props = {
  studentProfileId: string;
};

export function StudentAttendanceSection({ studentProfileId }: Props) {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const { start, end } = useMemo(() => {
    const firstDay = new Date(selectedYear, selectedMonth, 1);
    const lastDay = new Date(selectedYear, selectedMonth + 1, 0);
    return {
      start: firstDay.toISOString().split('T')[0]!,
      end: lastDay.toISOString().split('T')[0]!,
    };
  }, [selectedYear, selectedMonth]);

  const yearStart = `${selectedYear}-01-01`;
  const yearEnd = `${selectedYear}-12-31`;

  const { data: dailyRecords, isLoading: dailyLoading } = useStudentDailyAttendance(
    studentProfileId, start, end,
  );

  const { data: attendanceCounts } = useStudentAttendanceCounts(
    studentProfileId, yearStart, yearEnd,
  );

  // Build calendar
  const calendarDays: MonthlyCalendarDay[] = useMemo(() => {
    const dates = getMonthDates(selectedYear, selectedMonth);
    const recordMap = new Map<string, AttendanceStatus>();
    if (dailyRecords) {
      for (const r of dailyRecords as any[]) {
        const dateStr = typeof r.date === 'string'
          ? r.date.split('T')[0]
          : new Date(r.date).toISOString().split('T')[0];
        recordMap.set(dateStr, r.status);
      }
    }
    return dates.map((dateStr) => ({
      date: dateStr,
      status: recordMap.get(dateStr) ?? null,
      isWeekend: isWeekend(dateStr),
    }));
  }, [dailyRecords, selectedYear, selectedMonth]);

  // Parse counts
  const stats = useMemo(() => {
    if (!attendanceCounts || !Array.isArray(attendanceCounts)) {
      return { present: 0, absent: 0, late: 0, excused: 0 };
    }
    let present = 0, absent = 0, late = 0, excused = 0;
    for (const r of attendanceCounts as any[]) {
      const count = Number(r._count?.id ?? 0);
      switch (r.status as string) {
        case 'PRESENT': present = count; break;
        case 'ABSENT': absent = count; break;
        case 'LATE': late = count; break;
        case 'EXCUSED': excused = count; break;
      }
    }
    return { present, absent, late, excused };
  }, [attendanceCounts]);

  const monthLabel = new Date(selectedYear, selectedMonth).toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="space-y-4">
      <AttendanceSummaryCard
        counts={{
          present: stats.present,
          absent: stats.absent,
          late: stats.late,
          excused: stats.excused,
          total: stats.present + stats.absent + stats.late + stats.excused,
        }}
        title={`${selectedYear} Overview`}
      />

      <div className="flex items-end gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs">Month</Label>
          <Input
            type="month"
            value={`${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`}
            onChange={(e) => {
              const [y, m] = e.target.value.split('-');
              setSelectedYear(Number(y));
              setSelectedMonth(Number(m) - 1);
            }}
            className="w-44"
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{monthLabel} — Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          {dailyLoading ? (
            <div className="flex justify-center py-8"><Spinner size="lg" /></div>
          ) : (
            <AttendanceCalendar year={selectedYear} month={selectedMonth} days={calendarDays} />
          )}
        </CardContent>
      </Card>

      {(dailyRecords as any[])?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{monthLabel} — Daily Records</CardTitle>
          </CardHeader>
          <CardContent>
            <DailyAttendanceTable records={dailyRecords as any} showStudent={false} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
