'use client';

import { useMemo } from 'react';
import { useReferenceStore } from '@/stores';
import { PageHeader, EmptyState, SkeletonPage } from '@/components/shared';
import { useMyDutyRoster } from '@/modules/datesheet/hooks/use-datesheet';
import { TeacherDutyView } from '@/modules/datesheet/components';

export function TeacherDatesheetClient() {
  const { academicSessions } = useReferenceStore();
  const currentSession = academicSessions.find((s) => s.isCurrent);

  const { data: rawDuties, isLoading } = useMyDutyRoster(currentSession?.id ?? '');

  const duties = useMemo(() => {
    if (!rawDuties || !Array.isArray(rawDuties)) return [];
    return rawDuties.map((d: any) => ({
      ...d,
      entry: d.datesheetEntry ?? d.entry,
    }));
  }, [rawDuties]);

  if (!currentSession) {
    return <EmptyState title="No Active Session" description="No active academic session found." />;
  }

  if (isLoading) return <SkeletonPage />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Exam Duty Roster"
        description="Your assigned exam invigilation and duty schedule."
        breadcrumbs={[
          { label: 'Teacher', href: '/teacher' },
          { label: 'Datesheet' },
        ]}
      />

      {duties.length === 0 ? (
        <EmptyState title="No Duties" description="You have no exam duties assigned for this session." />
      ) : (
        <TeacherDutyView duties={duties} />
      )}
    </div>
  );
}
