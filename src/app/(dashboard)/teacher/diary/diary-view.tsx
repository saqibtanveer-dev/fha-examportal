'use client';

import { useState, useCallback, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader, EmptyState, Spinner } from '@/components/shared';
import {
  DiaryEntryForm,
  DiaryEntryCard,
  DiaryFiltersBar,
} from '@/modules/diary/components';
import {
  useTeacherDiaryEntries,
  useCreateDiaryEntry,
  useUpdateDiaryEntry,
  useDeleteDiaryEntry,
  usePublishDiaryEntry,
  useCopyDiaryToSections,
} from '@/modules/diary/hooks';
import { groupEntriesByDate, formatDiaryDate } from '@/modules/diary/diary.utils';
import type { TeacherSubjectClass, DiaryFilters, DiaryEntryRecord } from '@/modules/diary/diary.types';
import type { CreateDiaryEntryInput } from '@/validations/diary-schemas';

type Props = {
  assignments: TeacherSubjectClass[];
  teacherProfileId: string;
  currentSessionId: string;
};

export function TeacherDiaryView({ assignments, teacherProfileId, currentSessionId }: Props) {
  const [filters, setFilters] = useState<DiaryFilters>({});
  const [editingEntry, setEditingEntry] = useState<DiaryEntryRecord | null>(null);
  const [activeTab, setActiveTab] = useState('create');

  const { data: entries, isLoading } = useTeacherDiaryEntries(filters);
  const createMutation = useCreateDiaryEntry();
  const updateMutation = useUpdateDiaryEntry();
  const deleteMutation = useDeleteDiaryEntry();
  const publishMutation = usePublishDiaryEntry();
  const copyMutation = useCopyDiaryToSections();

  // Derive subjects from assignments for filter
  const subjects = useMemo(() => {
    const map = new Map<string, { id: string; name: string; code: string }>();
    for (const a of assignments) {
      if (!map.has(a.subjectId)) {
        map.set(a.subjectId, { id: a.subjectId, name: a.subjectName, code: a.subjectCode ?? '' });
      }
    }
    return Array.from(map.values());
  }, [assignments]);

  const groupedEntries = useMemo(() => {
    if (!entries?.length) return [];
    return Array.from(groupEntriesByDate(entries as DiaryEntryRecord[]).entries());
  }, [entries]);

  const handleCreate = useCallback(
    (data: Omit<CreateDiaryEntryInput, 'status'> & { status?: 'DRAFT' | 'PUBLISHED' }, status: 'DRAFT' | 'PUBLISHED') => {
      createMutation.mutate({ ...data, status }, {
        onSuccess: (result) => {
          if (result.success) setActiveTab('entries');
        },
      });
    },
    [createMutation],
  );

  const handleUpdate = useCallback(
    (data: Omit<CreateDiaryEntryInput, 'status'> & { status?: 'DRAFT' | 'PUBLISHED' }, status: 'DRAFT' | 'PUBLISHED') => {
      if (!editingEntry) return;
      updateMutation.mutate(
        { entryId: editingEntry.id, title: data.title, content: data.content, status },
        { onSuccess: (result) => { if (result.success) { setEditingEntry(null); setActiveTab('entries'); } } },
      );
    },
    [editingEntry, updateMutation],
  );

  const handleEdit = useCallback((entry: DiaryEntryRecord) => {
    setEditingEntry(entry);
    setActiveTab('create');
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingEntry(null);
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Diary"
        description="Write daily diary entries for your classes."
        breadcrumbs={[
          { label: 'Teacher', href: '/teacher' },
          { label: 'Diary' },
        ]}
      />

      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); if (v !== 'create') setEditingEntry(null); }}>
        <TabsList>
          <TabsTrigger value="create">{editingEntry ? 'Edit Entry' : 'Create Entry'}</TabsTrigger>
          <TabsTrigger value="entries">My Entries</TabsTrigger>
        </TabsList>

        {/* Create / Edit Tab */}
        <TabsContent value="create" className="mt-4">
          {editingEntry && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="mb-3 text-sm text-muted-foreground hover:text-foreground underline"
            >
              ← Cancel editing, create new instead
            </button>
          )}
          <DiaryEntryForm
            key={editingEntry?.id ?? 'new'}
            assignments={assignments}
            onSubmit={editingEntry ? handleUpdate : handleCreate}
            isSubmitting={createMutation.isPending || updateMutation.isPending}
            initialData={editingEntry ? {
              subjectId: editingEntry.subjectId,
              classId: editingEntry.classId,
              sectionId: editingEntry.sectionId,
              date: editingEntry.date,
              title: editingEntry.title,
              content: editingEntry.content,
            } : undefined}
            submitLabel={editingEntry ? 'Update' : 'Publish'}
          />
        </TabsContent>

        {/* My Entries Tab */}
        <TabsContent value="entries" className="space-y-4 mt-4">
          <DiaryFiltersBar
            filters={filters}
            onFiltersChange={setFilters}
            subjects={subjects}
            showStatusFilter
          />

          {isLoading ? (
            <div className="flex justify-center py-12"><Spinner size="lg" /></div>
          ) : groupedEntries.length === 0 ? (
            <EmptyState title="No diary entries" description="You haven't written any diary entries yet. Switch to the Create tab." />
          ) : (
            <div className="space-y-6">
              {groupedEntries.map(([dateStr, dayEntries]) => (
                <div key={dateStr}>
                  <h3 className="sticky top-0 z-10 mb-3 rounded-md bg-muted/80 px-3 py-1.5 text-sm font-semibold backdrop-blur-sm">
                    {formatDiaryDate(dateStr)}
                  </h3>
                  <div className="space-y-3">
                    {(dayEntries as DiaryEntryRecord[]).map((entry) => (
                      <DiaryEntryCard
                        key={entry.id}
                        entry={entry}
                        showActions
                        onEdit={() => handleEdit(entry)}
                        onDelete={() => deleteMutation.mutate(entry.id)}
                        onPublish={entry.status === 'DRAFT' ? () => publishMutation.mutate(entry.id) : undefined}
                        onCopy={(copyEntry) => {
                          // Find other sections for same subject + class
                          const match = assignments.find(
                            (a) => a.subjectId === copyEntry.subjectId && a.classId === copyEntry.classId,
                          );
                          const otherSections = (match?.sections ?? [])
                            .filter((s) => s.id !== copyEntry.sectionId)
                            .map((s) => s.id);
                          if (otherSections.length > 0) {
                            copyMutation.mutate({ entryId: copyEntry.id, targetSectionIds: otherSections });
                          }
                        }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
