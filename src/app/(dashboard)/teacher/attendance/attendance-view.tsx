'use client';

import { useState, useMemo } from 'react';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader, EmptyState, Spinner } from '@/components/shared';
import { DailyAttendanceMarker } from '@/modules/attendance/components';
import {
  useDailyAttendance,
  useStudentsForMarking,
} from '@/modules/attendance/hooks/use-daily-attendance';
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance"
        description="Mark daily attendance for your assigned classes."
        breadcrumbs={[
          { label: 'Teacher', href: '/teacher' },
          { label: 'Attendance' },
        ]}
      />

      {/* Class / Section / Date selectors */}
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
          description="Choose your class and section to mark daily attendance."
        />
      ) : dailyLoading || studentsLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
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
              <EmptyState
                title="No students found"
                description="No active students in this section."
              />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
