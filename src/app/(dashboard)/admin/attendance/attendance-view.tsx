'use client';

import { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader, EmptyState, Spinner } from '@/components/shared';
import {
  DailyAttendanceTable,
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
  useSchoolAttendanceOverview,
} from '@/modules/attendance/hooks/use-attendance-stats';
import { DailyAttendanceMarker } from '@/modules/attendance/components';
import { getTodayDate } from '@/modules/attendance/attendance.utils';
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
      {schoolOverview && Array.isArray(schoolOverview) && schoolOverview.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {(() => {
            let totalPresent = 0, totalAbsent = 0, totalLate = 0, totalExcused = 0;
            for (const r of schoolOverview as any[]) {
              const status = r.status as string;
              const count = Number(r._count?.id ?? 0);
              if (status === 'PRESENT') totalPresent += count;
              else if (status === 'ABSENT') totalAbsent += count;
              else if (status === 'LATE') totalLate += count;
              else if (status === 'EXCUSED') totalExcused += count;
            }
            const total = totalPresent + totalAbsent + totalLate + totalExcused;
            return (
              <AttendanceSummaryCard
                counts={{ present: totalPresent, absent: totalAbsent, late: totalLate, excused: totalExcused, total }}
                title={`School Overview - ${selectedDate}`}
              />
            );
          })()}
        </div>
      )}

      <Tabs defaultValue="mark">
        <TabsList>
          <TabsTrigger value="mark">Mark / View</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="mark" className="space-y-4 mt-4">
          {/* Selectors */}
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Class</Label>
              <Select
                value={selectedClassId}
                onValueChange={(v) => {
                  setSelectedClassId(v);
                  setSelectedSectionId('');
                }}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Section</Label>
              <Select
                value={sectionId}
                onValueChange={setSelectedSectionId}
                disabled={!sections.length}
              >
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Select section" />
                </SelectTrigger>
                <SelectContent>
                  {sections.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
                    students={(students as any[]) ?? []}
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
                {(students as any[])?.length ? (
                  <DailyAttendanceMarker
                    classId={selectedClassId}
                    sectionId={sectionId}
                    date={selectedDate}
                    students={(students as any[]) ?? []}
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
            <div className="space-y-1.5">
              <Label className="text-xs">Class</Label>
              <Select
                value={selectedClassId}
                onValueChange={(v) => {
                  setSelectedClassId(v);
                  setSelectedSectionId('');
                }}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Section</Label>
              <Select
                value={sectionId}
                onValueChange={setSelectedSectionId}
                disabled={!sections.length}
              >
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Select section" />
                </SelectTrigger>
                <SelectContent>
                  {sections.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
            <StudentWiseAttendanceTable data={studentWiseData as any[]} />
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
