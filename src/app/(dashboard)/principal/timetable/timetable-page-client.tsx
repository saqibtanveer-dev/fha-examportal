'use client';

import { useActivePeriodSlots } from '@/modules/timetable/hooks/use-timetable';
import { useReferenceStore } from '@/stores';
import { SkeletonPage, EmptyState } from '@/components/shared';
import { PrincipalTimetableView } from './timetable-view';

export function PrincipalTimetableClient() {
  const { classes, academicSessions } = useReferenceStore();
  const currentSession = academicSessions.find((s) => s.isCurrent);
  const { data: periodSlots, isLoading: slotsLoading } = useActivePeriodSlots();

  if (slotsLoading || !periodSlots) return <SkeletonPage />;

  if (!currentSession) {
    return (
      <EmptyState
        title="No Active Academic Session"
        description="No active academic session found. Please contact administration."
      />
    );
  }

  return (
    <PrincipalTimetableView
      periodSlots={periodSlots}
      classes={classes}
      currentSessionId={currentSession.id}
    />
  );
}
