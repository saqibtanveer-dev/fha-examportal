'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useReferenceStore } from '@/stores';
import { PageHeader, SkeletonPage, EmptyState } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft } from 'lucide-react';
import { useDatesheetDetail, useDatesheetEntries, useDatesheetStats } from '@/modules/datesheet/hooks/use-datesheet';
import { useDatesheetMutations, useDatesheetEntryMutations, useDutyMutations } from '@/modules/datesheet/hooks/use-datesheet-mutations';
import { useTeacherProfiles } from '@/modules/timetable/hooks/use-timetable';
import {
  DatesheetStatusBadge,
  DatesheetGrid,
  DatesheetEntryForm,
  DatesheetDutyForm,
  DatesheetClassView,
} from '@/modules/datesheet/components';
import { extractExamDates } from '@/modules/datesheet/datesheet.utils';
import { ROUTES } from '@/lib/constants';
import type { DatesheetEntryWithRelations } from '@/modules/datesheet/datesheet.types';
import type { DeepSerialize } from '@/utils/serialize';

type Props = { datesheetId: string };
type SerializedEntry = DeepSerialize<DatesheetEntryWithRelations>;
type TeacherOption = {
  id: string;
  employeeId: string;
  user: { id: string; firstName: string; lastName: string };
};

export function DatesheetDetailClient({ datesheetId }: Props) {
  const router = useRouter();
  const { classes, subjects, subjectClassLinks } = useReferenceStore();

  const { data: datesheet, isLoading } = useDatesheetDetail(datesheetId);
  const { data: entries } = useDatesheetEntries(datesheetId);
  const { data: stats } = useDatesheetStats(datesheetId);
  const { data: teachers } = useTeacherProfiles();

  const { publishDatesheet, unpublishDatesheet } = useDatesheetMutations(datesheetId);
  const { createEntry, updateEntry, deleteEntry } = useDatesheetEntryMutations(datesheetId);
  const { assignDuty, removeDuty } = useDutyMutations(datesheetId);

  const [entryFormOpen, setEntryFormOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<SerializedEntry | null>(null);
  const [prefilledDate, setPrefilledDate] = useState<string | undefined>();
  const [prefilledClassId, setPrefilledClassId] = useState<string | undefined>();
  const [prefilledSectionId, setPrefilledSectionId] = useState<string | undefined>();
  const [dutyFormOpen, setDutyFormOpen] = useState(false);
  const [dutyEntry, setDutyEntry] = useState<SerializedEntry | null>(null);

  // Build flat class-section list for grid rows
  const classSections = useMemo(() =>
    classes.flatMap((cls) =>
      cls.sections.map((sec) => ({
        classId: cls.id,
        className: cls.name,
        sectionId: sec.id,
        sectionName: sec.name,
      }))
    ), [classes]);

  if (isLoading) return <SkeletonPage />;
  if (!datesheet) return <EmptyState title="Not Found" description="Datesheet not found." />;

  const entryList: SerializedEntry[] = (entries ?? datesheet.entries ?? []) as SerializedEntry[];
  const isDraft = datesheet.status === 'DRAFT';
  const dates = extractExamDates(entryList);

  function handleCellClick(date: string, classId: string, sectionId: string, entry: SerializedEntry | null) {
    if (!isDraft) return;
    setPrefilledDate(date);
    setPrefilledClassId(classId);
    setPrefilledSectionId(sectionId);
    setSelectedEntry(entry);
    setEntryFormOpen(true);
  }

  function handleDutyClick(entry: SerializedEntry) {
    if (!isDraft) return;
    setDutyEntry(entry);
    setDutyFormOpen(true);
  }

  function openNewEntryForm() {
    setSelectedEntry(null);
    setPrefilledDate(undefined);
    setPrefilledClassId(undefined);
    setPrefilledSectionId(undefined);
    setEntryFormOpen(true);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={datesheet.title}
        description={datesheet.description ?? `${datesheet.examType} examination datesheet`}
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Datesheets', href: ROUTES.ADMIN.DATESHEET },
          { label: datesheet.title },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => router.push(ROUTES.ADMIN.DATESHEET)}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            {isDraft && (
              <Button size="sm" onClick={() => publishDatesheet.mutate(datesheetId)} disabled={publishDatesheet.isPending}>
                {publishDatesheet.isPending ? 'Publishing…' : 'Publish'}
              </Button>
            )}
            {datesheet.status === 'PUBLISHED' && (
              <Button variant="outline" size="sm" onClick={() => unpublishDatesheet.mutate(datesheetId)} disabled={unpublishDatesheet.isPending}>
                Unpublish
              </Button>
            )}
          </div>
        }
      />

      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <DatesheetStatusBadge status={datesheet.status} />
        <span>Entries: {stats?.entryCount ?? entryList.length}</span>
        <span>Classes: {stats?.classCount ?? '—'}</span>
        <span>Duties: {stats?.dutyCount ?? '—'}</span>
      </div>

      <Tabs defaultValue="grid">
        <TabsList>
          <TabsTrigger value="grid">Grid View</TabsTrigger>
          <TabsTrigger value="list">Class View</TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="mt-4">
          {entryList.length === 0 ? (
            <EmptyState
              title="No Entries"
              description={isDraft ? 'Click on a cell to add an exam entry.' : 'No entries in this datesheet.'}
            />
          ) : (
            <DatesheetGrid
              entries={entryList}
              dates={dates}
              classSections={classSections}
              onCellClick={isDraft ? handleCellClick : undefined}
              onDutyClick={isDraft ? handleDutyClick : undefined}
              readOnly={!isDraft}
            />
          )}
          {isDraft && (
            <Button variant="outline" className="mt-3" onClick={openNewEntryForm}>
              + Add Entry
            </Button>
          )}
        </TabsContent>

        <TabsContent value="list" className="mt-4 space-y-4">
          {classes.map((cls) => {
            const classEntries = entryList.filter((e) => e.classId === cls.id);
            if (classEntries.length === 0) return null;
            return <DatesheetClassView key={cls.id} title={cls.name} entries={classEntries} />;
          })}
        </TabsContent>
      </Tabs>

      {/* Entry form dialog */}
      {entryFormOpen && (
        <DatesheetEntryForm
          open={entryFormOpen}
          onClose={() => { setEntryFormOpen(false); setSelectedEntry(null); }}
          datesheetId={datesheetId}
          prefilledDate={prefilledDate}
          prefilledClassId={prefilledClassId}
          prefilledSectionId={prefilledSectionId}
          entry={selectedEntry}
          classes={classes}
          subjects={subjects}
          subjectClassLinks={subjectClassLinks}
          onCreate={(data) => {
            createEntry.mutate(data, {
              onSuccess: (result) => {
                setEntryFormOpen(false);
                setSelectedEntry(null);
                if (result.success && result.data) {
                  setDutyEntry({ id: result.data.id, duties: [] } as unknown as SerializedEntry);
                  setDutyFormOpen(true);
                }
              },
            });
          }}
          onUpdate={(id, data) => {
            updateEntry.mutate({ id, data }, {
              onSuccess: () => { setEntryFormOpen(false); setSelectedEntry(null); },
            });
          }}
          onDelete={(id) => {
            deleteEntry.mutate(id, {
              onSuccess: () => { setEntryFormOpen(false); setSelectedEntry(null); },
            });
          }}
          onManageDuties={(entry) => {
            setEntryFormOpen(false);
            setSelectedEntry(null);
            handleDutyClick(entry);
          }}
          isPending={createEntry.isPending || updateEntry.isPending || deleteEntry.isPending}
        />
      )}

      {/* Duty form dialog */}
      {dutyFormOpen && dutyEntry && (
        <DatesheetDutyForm
          open={dutyFormOpen}
          onClose={() => { setDutyFormOpen(false); setDutyEntry(null); }}
          entryId={dutyEntry.id}
          existingDuties={dutyEntry.duties}
          teachers={(teachers ?? []) as TeacherOption[]}
          onAssign={(data) => assignDuty.mutate(data)}
          onRemove={(dutyId) => removeDuty.mutate(dutyId)}
          isPending={assignDuty.isPending || removeDuty.isPending}
        />
      )}
    </div>
  );
}
