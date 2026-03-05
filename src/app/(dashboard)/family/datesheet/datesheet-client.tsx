'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageHeader, EmptyState, Spinner } from '@/components/shared';
import { useReferenceStore } from '@/stores';
import { useSelectedChild } from '@/modules/family/hooks';
import { ChildSelector } from '@/modules/family/components/child-selector';
import { DatesheetClassView } from '@/modules/datesheet/components';
import { fetchPublishedDatesheetForChildAction } from '@/modules/datesheet/datesheet-fetch-actions';
import { queryKeys } from '@/lib/query-keys';

export function FamilyDatesheetClient() {
  const { academicSessions } = useReferenceStore();
  const currentSession = academicSessions.find((s) => s.isCurrent);
  const { children, selectedChild, selectedChildId, isLoading: childrenLoading } = useSelectedChild();

  const { data: datesheets, isLoading: entriesLoading } = useQuery({
    queryKey: [...queryKeys.datesheet.all, 'family', selectedChildId, currentSession?.id],
    queryFn: () => fetchPublishedDatesheetForChildAction(selectedChildId!, currentSession!.id),
    enabled: !!selectedChildId && !!currentSession,
  });

  const entries = useMemo(() => {
    if (!datesheets || !Array.isArray(datesheets)) return [];
    return datesheets.flatMap((d: any) => d.entries ?? []);
  }, [datesheets]);

  const isLoading = childrenLoading || entriesLoading;

  if (!currentSession) {
    return <EmptyState title="No Active Session" description="No active academic session found." />;
  }

  if (!selectedChild && !childrenLoading) {
    return <EmptyState title="No Children" description="No students linked to your account." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Exam Datesheet"
        description={selectedChild ? `${selectedChild.studentName}'s exam schedule` : 'Exam datesheet'}
        breadcrumbs={[
          { label: 'Family', href: '/family' },
          { label: 'Datesheet' },
        ]}
      />

      {children.length > 1 && (
        <ChildSelector children={children} selectedChildId={selectedChildId} />
      )}

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : entries.length === 0 ? (
        <EmptyState title="No Datesheet" description="No published exam datesheet available for your child's class." />
      ) : (
        <DatesheetClassView
          title={selectedChild ? `${selectedChild.studentName}'s Exam Schedule` : 'Exam Schedule'}
          entries={entries}
        />
      )}
    </div>
  );
}
