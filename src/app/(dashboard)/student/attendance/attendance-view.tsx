'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader, Spinner } from '@/components/shared';
import {
  AttendanceCalendar,
  AttendanceSummaryCard,
  DailyAttendanceTable,
  SubjectAttendanceTable,
} from '@/modules/attendance/components';
import {
  useStudentDailyAttendance,
  useStudentSubjectAttendance,
} from '@/modules/attendance/hooks/use-daily-attendance';
import { useStudentAttendanceCounts } from '@/modules/attendance/hooks/use-attendance-stats';
import { getMonthDates, isWeekend } from '@/modules/attendance/attendance.utils';
import type { AttendanceStatus } from '@prisma/client';
import type { MonthlyCalendarDay } from '@/modules/attendance/attendance.types';

type StudentProfile = {
  id: string;
  rollNumber: string;
  registrationNo: string;
  classId: string;
  sectionId: string;
};

type Props = {
  studentProfile: StudentProfile;
  /** Override the page title (default: "My Attendance") */
  title?: string;
  /** Override the page description */
  description?: string;
  /** Override breadcrumbs (default: Student > Attendance) */
  breadcrumbs?: { label: string; href?: string }[];
  /** Optional content rendered above the summary (e.g. ChildSelector) */
  headerSlot?: React.ReactNode;
};

export function StudentAttendanceView({
  studentProfile,
  title = 'My Attendance',
  description = 'View your daily and subject-wise attendance records.',
  breadcrumbs = [{ label: 'Student', href: '/student' }, { label: 'Attendance' }],
  headerSlot,
}: Props) {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  // Date range for current month
  const { start, end } = useMemo(() => {
    const firstDay = new Date(selectedYear, selectedMonth, 1);
    const lastDay = new Date(selectedYear, selectedMonth + 1, 0);
    return {
      start: firstDay.toISOString().split('T')[0]!,
      end: lastDay.toISOString().split('T')[0]!,
    };
  }, [selectedYear, selectedMonth]);

  // Academic year date range (approximate)
  const yearStart = `${selectedYear}-01-01`;
  const yearEnd = `${selectedYear}-12-31`;

  // Fetch attendance data
  const { data: dailyRecords, isLoading: dailyLoading } = useStudentDailyAttendance(
    studentProfile.id, start, end,
  );

  const { data: subjectRecords, isLoading: subjectLoading } = useStudentSubjectAttendance(
    studentProfile.id, start, end,
  );

  const { data: attendanceCounts } = useStudentAttendanceCounts(
    studentProfile.id, yearStart, yearEnd,
  );

  // Build calendar data
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
      isWeekend: isWeekend(new Date(dateStr)),
    }));
  }, [dailyRecords, selectedYear, selectedMonth]);

  // Calculate stats from counts
  const stats = useMemo(() => {
    if (!attendanceCounts || !Array.isArray(attendanceCounts)) {
      return { present: 0, absent: 0, late: 0, excused: 0 };
    }
    let present = 0, absent = 0, late = 0, excused = 0;
    for (const r of attendanceCounts as any[]) {
      const status = r.status as string;
      const count = Number(r._count?.id ?? 0);
      if (status === 'PRESENT') present = count;
      else if (status === 'ABSENT') absent = count;
      else if (status === 'LATE') late = count;
      else if (status === 'EXCUSED') excused = count;
    }
    return { present, absent, late, excused };
  }, [attendanceCounts]);

  const monthLabel = new Date(selectedYear, selectedMonth).toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        description={description}
        breadcrumbs={breadcrumbs}
      />

      {headerSlot}

      {/* Year-wide summary */}
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

      {/* Month selector */}
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

      <Tabs defaultValue="calendar">
        <TabsList>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="daily">Daily Records</TabsTrigger>
          <TabsTrigger value="subject">Subject Records</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{monthLabel}</CardTitle>
            </CardHeader>
            <CardContent>
              {dailyLoading ? (
                <div className="flex justify-center py-8">
                  <Spinner size="lg" />
                </div>
              ) : (
                <AttendanceCalendar
                  year={selectedYear}
                  month={selectedMonth}
                  days={calendarDays}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="daily" className="mt-4">
          {dailyLoading ? (
            <div className="flex justify-center py-8">
              <Spinner size="lg" />
            </div>
          ) : (
            <DailyAttendanceTable
              records={(dailyRecords as any[]) ?? []}
              showStudent={false}
            />
          )}
        </TabsContent>

        <TabsContent value="subject" className="mt-4">
          {subjectLoading ? (
            <div className="flex justify-center py-8">
              <Spinner size="lg" />
            </div>
          ) : (
            <SubjectAttendanceTable
              records={(subjectRecords as any[]) ?? []}
              showStudent={false}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
