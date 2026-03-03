'use client';

import { useState, useMemo } from 'react';
import { DayOfWeek } from '@prisma/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { PageHeader, EmptyState } from '@/components/shared';
import { Spinner } from '@/components/shared';
import {
  TimetableGrid,
  PeriodSlotManager,
  TimetableEntryForm,
  ClassTeacherManager,
} from '@/modules/timetable/components';
import {
  useTimetableByClass,
  useTeacherProfiles,
} from '@/modules/timetable/hooks/use-timetable';
import { ORDERED_DAYS } from '@/modules/timetable/timetable.constants';
import type { PeriodSlotListItem, TimetableEntryWithRelations } from '@/modules/timetable/timetable.types';
import type { RefClass, RefSubject } from '@/stores';
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

  // Build grid from flat entries
  const grid = useMemo(() => {
    const g: Record<string, Record<string, TimetableEntryWithRelations | null>> = {};
    for (const day of ORDERED_DAYS) {
      g[day] = {};
      for (const slot of periodSlots) g[day][slot.id] = null;
    }
    if (timetableEntries) {
      for (const entry of timetableEntries) {
        const e = entry as unknown as TimetableEntryWithRelations;
        const daySlots = g[e.dayOfWeek];
        if (daySlots) {
          daySlots[e.periodSlotId] = e;
        }
      }
    }
    return g;
  }, [timetableEntries, periodSlots]);

  function handleCellClick(dayOfWeek: DayOfWeek, periodSlotId: string, entry: TimetableEntryWithRelations | null) {
    setSelectedDay(dayOfWeek);
    setSelectedPeriodSlotId(periodSlotId);
    setSelectedEntry(entry);
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
            <div className="space-y-1.5">
              <Label className="text-xs">Class</Label>
              <Select
                value={selectedClassId}
                onValueChange={(v) => {
                  setSelectedClassId(v);
                  setSelectedSectionId('');
                }}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Section</Label>
              <Select
                value={sectionId}
                onValueChange={setSelectedSectionId}
                disabled={!sections.length}
              >
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Select section" />
                </SelectTrigger>
                <SelectContent>
                  {sections.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
              periodSlots={periodSlots}
              grid={grid}
              onCellClick={handleCellClick}
            />
          )}
        </TabsContent>

        <TabsContent value="periods" className="mt-4">
          <PeriodSlotManager periodSlots={periodSlots} />
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
          periodSlots={periodSlots}
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
