'use client';

import { useAuthStore } from '@/stores';
import { useReferenceStore } from '@/stores';
import { EmptyState, Spinner } from '@/components/shared';
import { useTeacherAssignedSections } from '@/modules/timetable/hooks/use-timetable';
import { TeacherAttendanceView } from './attendance-view';

type AssignedSection = {
  id: string;
  name: string;
  class: { id: string; name: string };
};

export function TeacherAttendanceClient() {
  const { academicSessions } = useReferenceStore();
  const teacherProfileId = useAuthStore((s) => s.teacherProfileId);
  const currentSession = academicSessions.find((s) => s.isCurrent);

  const { data: assignedSections, isLoading } = useTeacherAssignedSections();

  if (!currentSession || !teacherProfileId) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        No active academic session or teacher profile found.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  // Build class list from assigned sections only
  const classMap = new Map<string, { id: string; name: string; sections: { id: string; name: string }[] }>();
  for (const section of (assignedSections as AssignedSection[]) ?? []) {
    const cls = classMap.get(section.class.id) ?? { id: section.class.id, name: section.class.name, sections: [] };
    cls.sections.push({ id: section.id, name: section.name });
    classMap.set(section.class.id, cls);
  }
  const assignedClasses = [...classMap.values()];

  if (assignedClasses.length === 0) {
    return (
      <EmptyState
        title="No Classes Assigned"
        description="You are not assigned as class teacher for any section. Contact your administrator."
      />
    );
  }

  return (
    <TeacherAttendanceView
      classes={assignedClasses}
      teacherProfileId={teacherProfileId}
      currentSessionId={currentSession.id}
    />
  );
}
