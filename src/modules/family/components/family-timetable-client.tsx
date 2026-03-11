'use client';

// ============================================
// Family Timetable Page — Reuses shared TimetableGrid
// ============================================

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageHeader, EmptyState, Spinner } from '@/components/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import { TimetableGrid } from '@/modules/timetable/components';
import { useActivePeriodSlots } from '@/modules/timetable/hooks/use-timetable';
import { buildTimetableGrid } from '@/modules/timetable/timetable.utils';
import { fetchCurrentAcademicSessionAction } from '@/modules/attendance/attendance-fetch-actions';
import { fetchTimetableForStudentAction } from '@/modules/timetable/timetable-fetch-actions';
import { queryKeys } from '@/lib/query-keys';
import { useSelectedChild } from '@/modules/family/hooks';
import { ChildSelector } from './child-selector';

export function FamilyTimetableClient() {
  const { children, selectedChild, selectedChildId, isLoading: childrenLoading } = useSelectedChild();

  const { data: currentSession, isLoading: sessionLoading } = useQuery({
    queryKey: queryKeys.academicSessions.current(),
    queryFn: () => fetchCurrentAcademicSessionAction(),
  });

  const { data: periodSlots, isLoading: slotsLoading } = useActivePeriodSlots(selectedChild?.classId, selectedChild?.sectionId);

  const sessionId = (currentSession as Record<string, string> | null)?.id ?? '';

  const { data: entries, isLoading: entriesLoading } = useQuery({
    queryKey: [...queryKeys.timetable.byClass(selectedChild?.classId ?? '', selectedChild?.sectionId ?? ''), 'student', selectedChild?.studentProfileId],
    queryFn: () => fetchTimetableForStudentAction(
      selectedChild!.studentProfileId,
      selectedChild!.classId,
      selectedChild!.sectionId,
      sessionId,
    ),
    enabled: !!selectedChild && !!sessionId,
  });

  const grid = useMemo(
    () => buildTimetableGrid(entries as never[], periodSlots ?? []),
    [entries, periodSlots],
  );

  const isLoading = childrenLoading || sessionLoading || slotsLoading || entriesLoading;

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!selectedChild) {
    return <EmptyState icon={<Clock className="h-12 w-12 text-muted-foreground" />} title="No Children" description="No students linked." />;
  }

  return (
    <div>
      <PageHeader title="Timetable" description={`${selectedChild.studentName}'s weekly schedule`} />
      <div className="mb-4">
        <ChildSelector children={children} selectedChildId={selectedChildId} />
      </div>

      {!currentSession ? (
        <EmptyState title="No Active Session" description="No active academic session found." />
      ) : !periodSlots?.length ? (
        <EmptyState icon={<Clock className="h-12 w-12 text-muted-foreground" />} title="No Timetable" description="Timetable has not been configured yet." />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Weekly Schedule &mdash; {(currentSession as unknown as Record<string, string>)?.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TimetableGrid periodSlots={periodSlots} grid={grid} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
