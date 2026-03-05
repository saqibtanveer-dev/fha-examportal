'use client';

import { useState } from 'react';
import { useReferenceStore } from '@/stores';
import { PageHeader, EmptyState, SkeletonPage, Spinner } from '@/components/shared';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDatesheetList, useDatesheetEntries } from '@/modules/datesheet/hooks/use-datesheet';
import { DatesheetClassView, DatesheetStatusBadge } from '@/modules/datesheet/components';
import type { DatesheetEntryWithRelations } from '@/modules/datesheet/datesheet.types';
import type { DeepSerialize } from '@/utils/serialize';

type SerializedEntry = DeepSerialize<DatesheetEntryWithRelations>;

export function PrincipalDatesheetClient() {
  const { academicSessions, classes } = useReferenceStore();
  const currentSession = academicSessions.find((s) => s.isCurrent);
  const [selectedId, setSelectedId] = useState('');

  const { data: datesheets, isLoading } = useDatesheetList(currentSession?.id ?? '');
  const { data: entries, isLoading: entriesLoading } = useDatesheetEntries(selectedId);

  if (!currentSession) {
    return <EmptyState title="No Active Session" description="No active academic session found." />;
  }

  if (isLoading) return <SkeletonPage />;

  const publishedDatesheets = (datesheets ?? []).filter((d) => d.status === 'PUBLISHED');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Exam Datesheets"
        description="View exam datesheets and schedules."
        breadcrumbs={[
          { label: 'Principal', href: '/principal' },
          { label: 'Datesheets' },
        ]}
      />

      {publishedDatesheets.length === 0 ? (
        <EmptyState title="No Datesheets" description="No datesheets available for this session." />
      ) : (
        <>
          <div className="flex items-center gap-3">
            <Select value={selectedId} onValueChange={setSelectedId}>
              <SelectTrigger className="w-75">
                <SelectValue placeholder="Select a datesheet" />
              </SelectTrigger>
              <SelectContent>
                {publishedDatesheets.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.title} — {d.examType}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedId && (
              <DatesheetStatusBadge status={publishedDatesheets.find((d) => d.id === selectedId)?.status ?? 'DRAFT'} />
            )}
          </div>

          {selectedId && entriesLoading && (
            <div className="flex justify-center py-12"><Spinner size="lg" /></div>
          )}

          {selectedId && entries && (
            <div className="space-y-4">
              {classes.map((cls) => {
                const classEntries = (entries as SerializedEntry[]).filter((e) => e.classId === cls.id);
                if (classEntries.length === 0) return null;
                return <DatesheetClassView key={cls.id} title={cls.name} entries={classEntries} />;
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
