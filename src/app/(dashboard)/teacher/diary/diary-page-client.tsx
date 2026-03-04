'use client';

import { useAuthStore, useReferenceStore } from '@/stores';
import { EmptyState, Spinner } from '@/components/shared';
import { useTeacherSubjectClasses } from '@/modules/diary/hooks';
import { TeacherDiaryView } from './diary-view';

export function TeacherDiaryClient() {
  const teacherProfileId = useAuthStore((s) => s.teacherProfileId);
  const { academicSessions } = useReferenceStore();
  const currentSession = academicSessions.find((s) => s.isCurrent);

  const { data: assignments, isLoading } = useTeacherSubjectClasses(!!teacherProfileId);

  if (!currentSession || !teacherProfileId) {
    return (
      <EmptyState
        title="No Active Session"
        description="No active academic session or teacher profile found."
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!assignments?.length) {
    return (
      <EmptyState
        title="No Subjects Assigned"
        description="You have no subject-class assignments. Contact your administrator."
      />
    );
  }

  return (
    <TeacherDiaryView
      assignments={assignments}
      teacherProfileId={teacherProfileId}
      currentSessionId={currentSession.id}
    />
  );
}
