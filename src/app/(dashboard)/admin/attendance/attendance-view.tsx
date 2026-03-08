'use client';

import { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader, EmptyState, Spinner } from '@/components/shared';
import { ClassSectionSelector } from '@/modules/timetable/components';
import {
  DailyAttendanceTable,
  AttendanceSummaryCard,
  StudentWiseAttendanceTable,
  DailyAttendanceMarker,
} from '@/modules/attendance/components';
import {
  useDailyAttendance,
  useStudentsForMarking,
} from '@/modules/attendance/hooks/use-daily-attendance';
import {
  useStudentWiseAttendance,
  useSchoolAttendanceOverview,
} from '@/modules/attendance/hooks/use-attendance-stats';
import { getTodayDate, parseSchoolOverviewCounts } from '@/modules/attendance/attendance.utils';
import type { RefClass } from '@/stores';

type Props = {
  classes: RefClass[];
  currentSessionId: string;
};

export function AdminAttendanceView({ classes, currentSessionId }: Props) {
  const today = getTodayDate();
  const [selectedClassId, setSelectedClassId] = useState(classes[0]?.id ?? '');
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [selectedDate, setSelectedDate] = useState(today);

  // Report date range
  const [reportStartDate, setReportStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1); // first of month
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

  const { data: students, isLoading: studentsLoading } = useStudentsForMarking(
    selectedClassId, sectionId,
    !!selectedClassId && !!sectionId,
  );

  const { data: schoolOverview } = useSchoolAttendanceOverview(selectedDate);

  const { data: studentWiseData, isLoading: reportLoading } = useStudentWiseAttendance(
    selectedClassId, sectionId, reportStartDate, reportEndDate,
    !!selectedClassId && !!sectionId,
  );

  const hasExistingRecords = (dailyRecords?.length ?? 0) > 0;

  // Map existing records for the marker
  const existingRecordsForMarker = useMemo(() => {
    if (!dailyRecords) return [];
    return dailyRecords.map((r: any) => ({
      id: r.id,
      studentProfileId: r.studentProfileId,
      status: r.status,
      remarks: r.remarks,
    }));
  }, [dailyRecords]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance Management"
        description="View and manage daily attendance across all classes."
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Attendance' },
        ]}
      />

      {/* School-wide overview cards */}
      {(() => {
        const counts = parseSchoolOverviewCounts(schoolOverview);
        return counts ? (
          <AttendanceSummaryCard
            counts={counts}
            title={`School Overview - ${selectedDate}`}
          />
        ) : null;
      })()}

      <Tabs defaultValue="mark">
        <TabsList>
          <TabsTrigger value="mark">Mark / View</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="mark" className="space-y-4 mt-4">
          {/* Selectors */}
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

          {/* Attendance content */}
          {!selectedClassId || !sectionId ? (
            <EmptyState
              title="Select a class and section"
              description="Choose a class and section to view or mark attendance."
            />
          ) : dailyLoading || studentsLoading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : hasExistingRecords ? (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Attendance Records &ndash; {selectedClass?.name} &ndash; {selectedDate}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <DailyAttendanceTable records={dailyRecords!} showDate={false} />
                </CardContent>
              </Card>

              {/* Allow editing */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Edit Attendance</CardTitle>
                </CardHeader>
                <CardContent>
                  <DailyAttendanceMarker
                    classId={selectedClassId}
                    sectionId={sectionId}
                    date={selectedDate}
                    students={students ?? []}
                    existingRecords={existingRecordsForMarker}
                    classDisplayName={selectedClass?.name}
                    sectionName={sections.find((s) => s.id === sectionId)?.name}
                  />
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Mark Attendance &ndash; {selectedClass?.name} &ndash; {selectedDate}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {students?.length ? (
                  <DailyAttendanceMarker
                    classId={selectedClassId}
                    sectionId={sectionId}
                    date={selectedDate}
                    students={students ?? []}
                    classDisplayName={selectedClass?.name}
                    sectionName={sections.find((s) => s.id === sectionId)?.name}
                  />
                ) : (
                  <EmptyState
                    title="No students found"
                    description="No active students in this section."
                  />
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

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
          ) : studentWiseData && Array.isArray(studentWiseData) && studentWiseData.length > 0 ? (
            <StudentWiseAttendanceTable data={studentWiseData} />
          ) : (
            <EmptyState
              title="No report data"
              description="Select a class, section, and date range to view attendance reports."
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
