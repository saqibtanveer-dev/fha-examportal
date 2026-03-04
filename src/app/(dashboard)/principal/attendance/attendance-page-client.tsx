'use client';

import { useReferenceStore } from '@/stores';
import { EmptyState } from '@/components/shared';
import { PrincipalAttendanceView } from './attendance-view';

export function PrincipalAttendanceClient() {
  const { classes, academicSessions } = useReferenceStore();
  const currentSession = academicSessions.find((s) => s.isCurrent);

  if (!currentSession) {
    return (
      <EmptyState
        title="No Active Academic Session"
        description="No active academic session found. Please contact administration."
      />
    );
  }

  return <PrincipalAttendanceView classes={classes} currentSessionId={currentSession.id} />;
}
