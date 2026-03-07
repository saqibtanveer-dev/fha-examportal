'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader, EmptyState, Spinner } from '@/components/shared';
import {
  TimetableGrid,
  ClassSectionSelector,
} from '@/modules/timetable/components';
import { useActivePeriodSlots, useTimetableByClass } from '@/modules/timetable/hooks/use-timetable';
import { buildTimetableGrid } from '@/modules/timetable/timetable.utils';
import type { PeriodSlotListItem } from '@/modules/timetable/timetable.types';
import type { RefClass } from '@/stores';

type Props = {
  periodSlots: PeriodSlotListItem[];
  classes: RefClass[];
  currentSessionId: string;
};

export function PrincipalTimetableView({ periodSlots, classes, currentSessionId }: Props) {
  const [selectedClassId, setSelectedClassId] = useState(classes[0]?.id ?? '');
  const [selectedSectionId, setSelectedSectionId] = useState('');

  const selectedClass = classes.find((c) => c.id === selectedClassId);
  const sections = selectedClass?.sections ?? [];
  const sectionId = selectedSectionId || sections[0]?.id || '';

  const { data: classSpecificSlots } = useActivePeriodSlots(selectedClassId || undefined, sectionId || undefined);
  const effectivePeriodSlots = classSpecificSlots ?? periodSlots;

  const { data: entries, isLoading } = useTimetableByClass(
    selectedClassId,
    sectionId,
    currentSessionId,
    !!selectedClassId && !!sectionId,
  );

  const grid = useMemo(
    () => buildTimetableGrid(entries as any, effectivePeriodSlots),
    [entries, effectivePeriodSlots],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Timetable Overview"
        description="View class timetables across the school."
        breadcrumbs={[
          { label: 'Principal', href: '/principal' },
          { label: 'Timetable' },
        ]}
      />

      <div className="flex flex-wrap items-end gap-4">
        <ClassSectionSelector
          classes={classes}
          selectedClassId={selectedClassId}
          selectedSectionId={selectedSectionId}
          onClassChange={setSelectedClassId}
          onSectionChange={setSelectedSectionId}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : !selectedClassId || !sectionId ? (
        <EmptyState
          title="Select a class and section"
          description="Choose a class and section to view the timetable."
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {selectedClass?.name} &mdash; {sections.find((s) => s.id === sectionId)?.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TimetableGrid
              periodSlots={effectivePeriodSlots}
              grid={grid}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
