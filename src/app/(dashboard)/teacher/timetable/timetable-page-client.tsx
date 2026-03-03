'use client';

import { useReferenceStore, useAuthStore } from '@/stores';
import { Spinner } from '@/components/shared';
import { TeacherScheduleView } from '@/modules/timetable/components';
import { PageHeader } from '@/components/shared';
import { useTimetableByTeacher } from '@/modules/timetable/hooks/use-timetable';
import type { TimetableEntryWithRelations } from '@/modules/timetable/timetable.types';

export function TeacherTimetableClient() {
  const teacherProfileId = useAuthStore((s) => s.teacherProfileId);
  const { academicSessions } = useReferenceStore();
  const user = useAuthStore((s) => s.user);
  const currentSession = academicSessions.find((s) => s.isCurrent);

  const { data: entries, isLoading } = useTimetableByTeacher(
    teacherProfileId ?? '',
    currentSession?.id ?? '',
    !!teacherProfileId && !!currentSession,
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Timetable"
        description="Your weekly teaching schedule."
        breadcrumbs={[
          { label: 'Teacher', href: '/teacher' },
          { label: 'Timetable' },
        ]}
      />

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : (
        <TeacherScheduleView
          entries={(entries as unknown as TimetableEntryWithRelations[]) ?? []}
          teacherName={user ? `${user.firstName} ${user.lastName}` : undefined}
        />
      )}
    </div>
  );
}
