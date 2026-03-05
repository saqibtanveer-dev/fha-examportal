'use client';

import { useMemo } from 'react';
import { useReferenceStore } from '@/stores';
import { PageHeader, EmptyState, SkeletonPage } from '@/components/shared';
import { useStudentDatesheet } from '@/modules/datesheet/hooks/use-datesheet';
import { DatesheetClassView } from '@/modules/datesheet/components';

export function StudentDatesheetClient() {
  const { academicSessions } = useReferenceStore();
  const currentSession = academicSessions.find((s) => s.isCurrent);

  const { data: datesheets, isLoading } = useStudentDatesheet(currentSession?.id ?? '');

  const entries = useMemo(() => {
    if (!datesheets || !Array.isArray(datesheets)) return [];
    return datesheets.flatMap((d: any) => d.entries ?? []);
  }, [datesheets]);

  if (!currentSession) {
    return <EmptyState title="No Active Session" description="No active academic session found." />;
  }

  if (isLoading) return <SkeletonPage />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Exam Datesheet"
        description="Your upcoming exam schedule."
        breadcrumbs={[
          { label: 'Student', href: '/student' },
          { label: 'Datesheet' },
        ]}
      />

      {entries.length === 0 ? (
        <EmptyState title="No Datesheet" description="No published exam datesheet available for your class." />
      ) : (
        <DatesheetClassView title="My Exam Schedule" entries={entries} />
      )}
    </div>
  );
}
