'use client';

import { useState, useMemo } from 'react';
import { DayOfWeek } from '@prisma/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader, EmptyState } from '@/components/shared';
import { Spinner } from '@/components/shared';
import {
  TimetableGrid,
  PeriodSlotManager,
  TimetableEntryForm,
  ClassTeacherManager,
  ClassSectionSelector,
} from '@/modules/timetable/components';
import {
  useTimetableByClass,
  useTeacherProfiles,
  useActivePeriodSlots,
} from '@/modules/timetable/hooks/use-timetable';
import { buildTimetableGrid } from '@/modules/timetable/timetable.utils';
import type { PeriodSlotListItem, TimetableEntryWithRelations } from '@/modules/timetable/timetable.types';
import type { RefClass } from '@/stores';
import { useReferenceStore } from '@/stores';

type Props = {
  periodSlots: PeriodSlotListItem[];
  classes: RefClass[];
  currentSessionId: string;
};

export function TimetableView({ periodSlots, classes, currentSessionId }: Props) {
  const { subjects } = useReferenceStore();
  const [selectedClassId, setSelectedClassId] = useState(classes[0]?.id ?? '');
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [entryFormOpen, setEntryFormOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<DayOfWeek | undefined>();
  const [selectedPeriodSlotId, setSelectedPeriodSlotId] = useState<string | undefined>();
  const [selectedEntry, setSelectedEntry] = useState<TimetableEntryWithRelations | null>(null);

  const selectedClass = classes.find((c) => c.id === selectedClassId);
  const sections = selectedClass?.sections ?? [];

  // Auto-select first section when class changes
  const sectionId = selectedSectionId || sections[0]?.id || '';

  const { data: timetableEntries, isLoading } = useTimetableByClass(
    selectedClassId,
    sectionId,
    currentSessionId,
    !!selectedClassId && !!sectionId && !!currentSessionId,
  );

  const { data: teachers } = useTeacherProfiles();

  // Get effective period slots (3-tier: global → class → section)
  const { data: classSpecificSlots } = useActivePeriodSlots(selectedClassId || undefined, sectionId || undefined);
  const effectivePeriodSlots = classSpecificSlots ?? periodSlots;

  // Build grid from flat entries
  const grid = useMemo(() => buildTimetableGrid(timetableEntries, effectivePeriodSlots), [timetableEntries, effectivePeriodSlots]);

  function handleCellClick(dayOfWeek: DayOfWeek, periodSlotId: string, entry: unknown) {
    setSelectedDay(dayOfWeek);
    setSelectedPeriodSlotId(periodSlotId);
    setSelectedEntry(entry as TimetableEntryWithRelations | null);
    setEntryFormOpen(true);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Timetable Management"
        description="Configure period slots and manage class timetables."
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Timetable' },
        ]}
      />

      <Tabs defaultValue="timetable">
        <TabsList>
          <TabsTrigger value="timetable">Timetable</TabsTrigger>
          <TabsTrigger value="periods">Period Slots</TabsTrigger>
          <TabsTrigger value="class-teachers">Class Teachers</TabsTrigger>
        </TabsList>

        <TabsContent value="timetable" className="space-y-4 mt-4">
          {/* Class / Section selector */}
          <div className="flex flex-wrap items-end gap-4">
            <ClassSectionSelector
              classes={classes}
              selectedClassId={selectedClassId}
              selectedSectionId={selectedSectionId}
              onClassChange={setSelectedClassId}
              onSectionChange={setSelectedSectionId}
            />
          </div>

          {/* Timetable grid */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : !selectedClassId || !sectionId ? (
            <EmptyState
              title="Select a class and section"
              description="Choose a class and section to view or edit the timetable."
            />
          ) : (
            <TimetableGrid
              periodSlots={effectivePeriodSlots}
              grid={grid}
              onCellClick={handleCellClick}
            />
          )}
        </TabsContent>

        <TabsContent value="periods" className="mt-4">
          <PeriodSlotManager />
        </TabsContent>

        <TabsContent value="class-teachers" className="mt-4">
          <ClassTeacherManager />
        </TabsContent>
      </Tabs>

      {/* Entry form dialog */}
      {entryFormOpen && (
        <TimetableEntryForm
          open={entryFormOpen}
          onOpenChange={setEntryFormOpen}
          classId={selectedClassId}
          sectionId={sectionId}
          academicSessionId={currentSessionId}
          periodSlots={effectivePeriodSlots}
          subjects={subjects}
          teachers={teachers ?? []}
          initialDayOfWeek={selectedDay}
          initialPeriodSlotId={selectedPeriodSlotId}
          existingEntry={selectedEntry}
        />
      )}
    </div>
  );
}
