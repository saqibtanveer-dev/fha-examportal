'use client';

import { usePeriodSlots } from '@/modules/timetable/hooks/use-timetable';
import { useReferenceStore } from '@/stores';
import { SkeletonPage, EmptyState } from '@/components/shared';
import { TimetableView } from './timetable-view';

export function TimetablePageClient() {
  const { classes, academicSessions } = useReferenceStore();
  const currentSession = academicSessions.find((s) => s.isCurrent);
  const { data: periodSlots, isLoading: slotsLoading } = usePeriodSlots();

  if (slotsLoading || !periodSlots) return <SkeletonPage />;

  if (!currentSession) {
    return (
      <EmptyState
        title="No Active Academic Session"
        description="Please set an active academic session before managing the timetable."
      />
    );
  }

  return (
    <TimetableView
      periodSlots={periodSlots}
      classes={classes}
      currentSessionId={currentSession.id}
    />
  );
}
