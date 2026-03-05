'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageHeader, EmptyState, Spinner } from '@/components/shared';
import { DiaryTimeline, DiaryTodaySummary, DiarySubjectTabs } from '@/modules/diary/components';
import { useStudentDiary, useStudentTodayDiary, useMarkDiaryRead } from '@/modules/diary/hooks';
import { getTodayDateString, getWeekRange, groupEntriesByDate } from '@/modules/diary/diary.utils';
import type { DiaryEntryForStudent } from '@/modules/diary/diary.types';

// ── Shared presentational shell (used by both student and family) ──

export type DiaryViewShellProps = {
  title: string;
  description: string;
  breadcrumbs: { label: string; href?: string }[];
  /** Optional slot rendered between header and content (e.g. ChildSelector) */
  headerSlot?: React.ReactNode;
  todayEntries: DiaryEntryForStudent[] | undefined;
  todayLoading: boolean;
  entries: DiaryEntryForStudent[] | undefined;
  entriesLoading: boolean;
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  selectedSubjectId: string | undefined;
  onSubjectSelect: (id: string | undefined) => void;
  onEntryRead: (entryId: string) => void;
};

export function DiaryViewShell({
  title,
  description,
  breadcrumbs,
  headerSlot,
  todayEntries,
  todayLoading,
  entries,
  entriesLoading,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  selectedSubjectId,
  onSubjectSelect,
  onEntryRead,
}: DiaryViewShellProps) {
  const today = getTodayDateString();

  const subjects = useMemo(() => {
    if (!todayEntries?.length) return [];
    const map = new Map<string, { id: string; name: string; code: string }>();
    for (const e of todayEntries) {
      if (e.subject && !map.has(e.subject.id)) {
        map.set(e.subject.id, e.subject);
      }
    }
    return Array.from(map.values());
  }, [todayEntries]);

  const subjectIndexMap = useMemo(() => {
    const map = new Map<string, number>();
    subjects.forEach((s, idx) => map.set(s.id, idx));
    return map;
  }, [subjects]);

  const filteredEntries = useMemo(() => {
    if (!entries?.length) return [];
    if (!selectedSubjectId) return entries;
    return entries.filter((e) => e.subject?.id === selectedSubjectId);
  }, [entries, selectedSubjectId]);

  const entriesByDate = useMemo(() => groupEntriesByDate(filteredEntries), [filteredEntries]);

  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description} breadcrumbs={breadcrumbs} />

      {headerSlot}

      {/* Today's Summary */}
      {todayLoading ? (
        <div className="flex justify-center py-4"><Spinner /></div>
      ) : todayEntries?.length ? (
        <DiaryTodaySummary todayEntries={todayEntries} allSubjects={subjects} />
      ) : (
        <Card>
          <CardContent className="py-6 text-center text-sm text-muted-foreground">
            No diary entries posted for today yet.
          </CardContent>
        </Card>
      )}

      <DiarySubjectTabs subjects={subjects} selectedSubjectId={selectedSubjectId} onSelect={onSubjectSelect} />

      {/* Date range picker */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">From</Label>
          <Input type="date" value={startDate} onChange={(e) => onStartDateChange(e.target.value)} max={today} className="h-9 w-36" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">To</Label>
          <Input type="date" value={endDate} onChange={(e) => onEndDateChange(e.target.value)} max={today} className="h-9 w-36" />
        </div>
      </div>

      {/* Timeline Feed */}
      {entriesLoading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : filteredEntries.length === 0 ? (
        <EmptyState title="No diary entries" description="No diary entries found for the selected date range." />
      ) : (
        <DiaryTimeline entriesByDate={entriesByDate} subjectIndexMap={subjectIndexMap} onEntryRead={onEntryRead} />
      )}
    </div>
  );
}

// ── Student-specific wrapper (preserves original API) ──

type StudentProfile = {
  id: string;
  classId: string;
  sectionId: string;
  className: string;
  sectionName: string;
};

export function StudentDiaryView({ studentProfile }: { studentProfile: StudentProfile }) {
  const weekRange = getWeekRange();
  const [startDate, setStartDate] = useState(weekRange.startDate);
  const [endDate, setEndDate] = useState(weekRange.endDate);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | undefined>();

  const { data: todayEntries, isLoading: todayLoading } = useStudentTodayDiary();
  const { data: entries, isLoading } = useStudentDiary(startDate, endDate, selectedSubjectId);
  const markReadMutation = useMarkDiaryRead();

  return (
    <DiaryViewShell
      title="Diary"
      description={`${studentProfile.className} — ${studentProfile.sectionName}`}
      breadcrumbs={[{ label: 'Student', href: '/student' }, { label: 'Diary' }]}
      todayEntries={todayEntries as DiaryEntryForStudent[] | undefined}
      todayLoading={todayLoading}
      entries={entries as DiaryEntryForStudent[] | undefined}
      entriesLoading={isLoading}
      startDate={startDate}
      endDate={endDate}
      onStartDateChange={setStartDate}
      onEndDateChange={setEndDate}
      selectedSubjectId={selectedSubjectId}
      onSubjectSelect={setSelectedSubjectId}
      onEntryRead={(entryId) => markReadMutation.mutate(entryId)}
    />
  );
}
