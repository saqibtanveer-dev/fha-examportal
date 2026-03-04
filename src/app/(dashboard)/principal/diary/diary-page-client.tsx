'use client';

import { useReferenceStore } from '@/stores';
import { EmptyState } from '@/components/shared';
import { PrincipalDiaryView } from './diary-view';

export function PrincipalDiaryClient() {
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

  return <PrincipalDiaryView classes={classes} currentSessionId={currentSession.id} />;
}
