'use client';

import { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader, EmptyState, Spinner } from '@/components/shared';
import { ClassSectionSelector } from '@/modules/timetable/components';
import {
  AttendanceSummaryCard,
  DailyAttendanceTable,
  StudentWiseAttendanceTable,
} from '@/modules/attendance/components';
import {
  useDailyAttendance,
} from '@/modules/attendance/hooks/use-daily-attendance';
import {
  useDailyAttendanceCounts,
  useStudentWiseAttendance,
  useSchoolAttendanceOverview,
} from '@/modules/attendance/hooks/use-attendance-stats';
import { getTodayDate, parseSchoolOverviewCounts } from '@/modules/attendance/attendance.utils';
import type { RefClass } from '@/stores';

type Props = {
  classes: RefClass[];
  currentSessionId: string;
};

export function PrincipalAttendanceView({ classes, currentSessionId }: Props) {
  const today = getTodayDate();
  const [selectedClassId, setSelectedClassId] = useState(classes[0]?.id ?? '');
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [selectedDate, setSelectedDate] = useState(today);

  // Report date range
  const [reportStartDate, setReportStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0]!;
  });
  const [reportEndDate, setReportEndDate] = useState(today);

  const selectedClass = classes.find((c) => c.id === selectedClassId);
  const sections = selectedClass?.sections ?? [];
  const sectionId = selectedSectionId || sections[0]?.id || '';

  // Fetch data
  const { data: dailyRecords, isLoading: dailyLoading } = useDailyAttendance(
    selectedClassId, sectionId, selectedDate,
    !!selectedClassId && !!sectionId,
  );

  const { data: schoolOverview } = useSchoolAttendanceOverview(selectedDate);

  const { data: classCounts } = useDailyAttendanceCounts(
    selectedClassId, sectionId, selectedDate,
    !!selectedClassId && !!sectionId,
  );

  const { data: studentWiseData, isLoading: reportLoading } = useStudentWiseAttendance(
    selectedClassId, sectionId, reportStartDate, reportEndDate,
    !!selectedClassId && !!sectionId,
  );

  // Parse school overview into counts
  const overviewCounts = useMemo(
    () => parseSchoolOverviewCounts(schoolOverview as any),
    [schoolOverview],
  );

  // Parse class counts
  const classCountsData = useMemo(() => {
    if (!classCounts || !Array.isArray(classCounts)) return null;
    let present = 0, absent = 0, late = 0, excused = 0;
    for (const r of classCounts as any[]) {
      const status = r.status as string;
      const count = Number(r._count?.id ?? 0);
      if (status === 'PRESENT') present += count;
      else if (status === 'ABSENT') absent += count;
      else if (status === 'LATE') late += count;
      else if (status === 'EXCUSED') excused += count;
    }
    const total = present + absent + late + excused;
    return total > 0 ? { present, absent, late, excused, total } : null;
  }, [classCounts]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance Overview"
        description="Monitor attendance across all classes and students."
        breadcrumbs={[
          { label: 'Principal', href: '/principal' },
          { label: 'Attendance' },
        ]}
      />

      {/* School-wide overview */}
      {overviewCounts && (
        <AttendanceSummaryCard
          counts={overviewCounts}
          title={`School Overview — ${selectedDate}`}
        />
      )}

      <Tabs defaultValue="class-view">
        <TabsList>
          <TabsTrigger value="class-view">Class View</TabsTrigger>
          <TabsTrigger value="reports">Student Reports</TabsTrigger>
        </TabsList>

        {/* ── Class View Tab ── */}
        <TabsContent value="class-view" className="space-y-4 mt-4">
          <div className="flex flex-wrap items-end gap-4">
            <ClassSectionSelector
              classes={classes}
              selectedClassId={selectedClassId}
              selectedSectionId={selectedSectionId}
              onClassChange={setSelectedClassId}
              onSectionChange={setSelectedSectionId}
            />
            <div className="space-y-1.5">
              <Label className="text-xs">Date</Label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-40"
              />
            </div>
          </div>

          {/* Class-level summary */}
          {classCountsData && (
            <AttendanceSummaryCard
              counts={classCountsData}
              title={`${selectedClass?.name} — ${selectedDate}`}
            />
          )}

          {!selectedClassId || !sectionId ? (
            <EmptyState
              title="Select a class and section"
              description="Choose a class and section to view attendance records."
            />
          ) : dailyLoading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : (dailyRecords as any[])?.length ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Attendance Records — {selectedClass?.name} — {selectedDate}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DailyAttendanceTable records={dailyRecords as any} showDate={false} />
              </CardContent>
            </Card>
          ) : (
            <EmptyState
              title="No records"
              description="No attendance has been marked for this class on the selected date."
            />
          )}
        </TabsContent>

        {/* ── Reports Tab ── */}
        <TabsContent value="reports" className="space-y-4 mt-4">
          <div className="flex flex-wrap items-end gap-4">
            <ClassSectionSelector
              classes={classes}
              selectedClassId={selectedClassId}
              selectedSectionId={selectedSectionId}
              onClassChange={setSelectedClassId}
              onSectionChange={setSelectedSectionId}
            />
            <div className="space-y-1.5">
              <Label className="text-xs">From</Label>
              <Input
                type="date"
                value={reportStartDate}
                onChange={(e) => setReportStartDate(e.target.value)}
                className="w-40"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">To</Label>
              <Input
                type="date"
                value={reportEndDate}
                onChange={(e) => setReportEndDate(e.target.value)}
                className="w-40"
              />
            </div>
          </div>

          {reportLoading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : (studentWiseData as any[])?.length ? (
            <StudentWiseAttendanceTable data={studentWiseData as any} />
          ) : (
            <EmptyState
              title="No report data"
              description="Select a class, section, and date range to view student attendance reports."
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
