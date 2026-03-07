'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader, Spinner, EmptyState } from '@/components/shared';
import { TimetableGrid } from '@/modules/timetable/components';
import { useActivePeriodSlots, useTimetableByClass } from '@/modules/timetable/hooks/use-timetable';
import { buildTimetableGrid } from '@/modules/timetable/timetable.utils';
import { fetchCurrentAcademicSessionAction } from '@/modules/attendance/attendance-fetch-actions';

type StudentProfile = {
  id: string;
  rollNumber: string;
  registrationNo: string;
  classId: string;
  sectionId: string;
};

type Props = {
  studentProfile: StudentProfile;
};

export function StudentTimetableView({ studentProfile }: Props) {
  const { data: currentSession, isLoading: sessionLoading } = useQuery({
    queryKey: ['current-academic-session'],
    queryFn: () => fetchCurrentAcademicSessionAction(),
  });

  const { data: periodSlots, isLoading: slotsLoading } = useActivePeriodSlots(studentProfile.classId);

  const sessionId = (currentSession as any)?.id ?? '';

  const { data: entries, isLoading: entriesLoading } = useTimetableByClass(
    studentProfile.classId,
    studentProfile.sectionId,
    sessionId,
    !!sessionId,
  );

  const grid = useMemo(
    () => buildTimetableGrid(entries as any, periodSlots ?? []),
    [entries, periodSlots],
  );

  const isLoading = sessionLoading || slotsLoading || entriesLoading;

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Timetable"
        description="Your weekly class schedule."
        breadcrumbs={[
          { label: 'Student', href: '/student' },
          { label: 'Timetable' },
        ]}
      />

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : !currentSession ? (
        <EmptyState
          title="No Active Session"
          description="No active academic session found. Please contact administration."
        />
      ) : !periodSlots?.length ? (
        <EmptyState
          title="No Timetable Available"
          description="The timetable has not been configured yet."
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Weekly Schedule &mdash; {(currentSession as any)?.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TimetableGrid
              periodSlots={periodSlots}
              grid={grid}
              compact={false}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
