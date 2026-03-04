'use client';

import { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader, EmptyState, Spinner } from '@/components/shared';
import { ClassSectionSelector } from '@/modules/timetable/components';
import {
  DailyAttendanceMarker,
  AttendanceSummaryCard,
  StudentWiseAttendanceTable,
} from '@/modules/attendance/components';
import {
  useDailyAttendance,
  useStudentsForMarking,
} from '@/modules/attendance/hooks/use-daily-attendance';
import {
  useDailyAttendanceCounts,
  useStudentWiseAttendance,
} from '@/modules/attendance/hooks/use-attendance-stats';
import { getTodayDate } from '@/modules/attendance/attendance.utils';
import type { RefClass } from '@/stores';

type Props = {
  classes: RefClass[];
  teacherProfileId: string;
  currentSessionId: string;
};

export function TeacherAttendanceView({ classes, teacherProfileId, currentSessionId }: Props) {
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

  const { data: dailyRecords, isLoading: dailyLoading } = useDailyAttendance(
    selectedClassId, sectionId, selectedDate,
    !!selectedClassId && !!sectionId,
  );

  const { data: students, isLoading: studentsLoading } = useStudentsForMarking(
    selectedClassId, sectionId,
    !!selectedClassId && !!sectionId,
  );

  const { data: classCounts } = useDailyAttendanceCounts(
    selectedClassId, sectionId, selectedDate,
    !!selectedClassId && !!sectionId,
  );

  const { data: studentWiseData, isLoading: reportLoading } = useStudentWiseAttendance(
    selectedClassId, sectionId, reportStartDate, reportEndDate,
    !!selectedClassId && !!sectionId,
  );

  const hasExistingRecords = (dailyRecords?.length ?? 0) > 0;

  const existingRecordsForMarker = useMemo(() => {
    if (!dailyRecords) return [];
    return dailyRecords.map((r: any) => ({
      id: r.id,
      studentProfileId: r.studentProfileId,
      status: r.status,
      remarks: r.remarks,
    }));
  }, [dailyRecords]);

  // Parse class counts for summary card
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
        title="Attendance"
        description="Mark daily attendance and view reports for your assigned classes."
        breadcrumbs={[
          { label: 'Teacher', href: '/teacher' },
          { label: 'Attendance' },
        ]}
      />

      <Tabs defaultValue="mark">
        <TabsList>
          <TabsTrigger value="mark">Mark Attendance</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* Mark Attendance Tab */}
        <TabsContent value="mark" className="space-y-4 mt-4">
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
              title={`${selectedClass?.name}  ${selectedDate}`}
            />
          )}

          {!selectedClassId || !sectionId ? (
            <EmptyState
              title="Select a class and section"
              description="Choose your class and section to mark daily attendance."
            />
          ) : dailyLoading || studentsLoading ? (
            <div className="flex justify-center py-12"><Spinner size="lg" /></div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {hasExistingRecords ? 'Edit' : 'Mark'} Attendance &ndash; {selectedClass?.name} &ndash; {selectedDate}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(students as any[])?.length ? (
                  <DailyAttendanceMarker
                    classId={selectedClassId}
                    sectionId={sectionId}
                    date={selectedDate}
                    students={(students as any[]) ?? []}
                    existingRecords={hasExistingRecords ? existingRecordsForMarker : undefined}
                    classDisplayName={selectedClass?.name}
                    sectionName={sections.find((s) => s.id === sectionId)?.name}
                  />
                ) : (
                  <EmptyState title="No students found" description="No active students in this section." />
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Reports Tab */}
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
            <div className="flex justify-center py-12"><Spinner size="lg" /></div>
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
