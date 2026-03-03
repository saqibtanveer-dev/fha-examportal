'use client';

import { useReferenceStore } from '@/stores';
import { SkeletonPage } from '@/components/shared';
import { AdminAttendanceView } from './attendance-view';

export function AttendancePageClient() {
  const { classes, academicSessions } = useReferenceStore();
  const currentSession = academicSessions.find((s) => s.isCurrent);

  if (!currentSession) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        No active academic session found. Please configure one first.
      </div>
    );
  }

  return <AdminAttendanceView classes={classes} currentSessionId={currentSession.id} />;
}
