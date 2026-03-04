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

type StudentProfile = {
  id: string;
  classId: string;
  sectionId: string;
  className: string;
  sectionName: string;
};

type Props = {
  studentProfile: StudentProfile;
};

export function StudentDiaryView({ studentProfile }: Props) {
  const today = getTodayDateString();
  const weekRange = getWeekRange();

  const [startDate, setStartDate] = useState(weekRange.startDate);
  const [endDate, setEndDate] = useState(weekRange.endDate);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | undefined>();

  const { data: todayEntries, isLoading: todayLoading } = useStudentTodayDiary();
  const { data: entries, isLoading } = useStudentDiary(startDate, endDate, selectedSubjectId);
  const markReadMutation = useMarkDiaryRead();

  // Extract unique subjects from today's entries for tabs
  const subjects = useMemo(() => {
    if (!todayEntries?.length) return [];
    const map = new Map<string, { id: string; name: string; code: string }>();
    for (const e of todayEntries as DiaryEntryForStudent[]) {
      if (e.subject && !map.has(e.subject.id)) {
        map.set(e.subject.id, e.subject);
      }
    }
    return Array.from(map.values());
  }, [todayEntries]);

  // Build subject index map for color coding
  const subjectIndexMap = useMemo(() => {
    const map = new Map<string, number>();
    subjects.forEach((s, idx) => map.set(s.id, idx));
    return map;
  }, [subjects]);

  // Filter and group entries by date for the timeline
  const filteredEntries = useMemo(() => {
    if (!entries?.length) return [];
    if (!selectedSubjectId) return entries as DiaryEntryForStudent[];
    return (entries as DiaryEntryForStudent[]).filter((e) => e.subject?.id === selectedSubjectId);
  }, [entries, selectedSubjectId]);

  const entriesByDate = useMemo(() => {
    return groupEntriesByDate(filteredEntries);
  }, [filteredEntries]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Diary"
        description={`${studentProfile.className} — ${studentProfile.sectionName}`}
        breadcrumbs={[
          { label: 'Student', href: '/student' },
          { label: 'Diary' },
        ]}
      />

      {/* Today's Summary */}
      {todayLoading ? (
        <div className="flex justify-center py-4"><Spinner /></div>
      ) : todayEntries?.length ? (
        <DiaryTodaySummary todayEntries={todayEntries as DiaryEntryForStudent[]} allSubjects={subjects} />
      ) : (
        <Card>
          <CardContent className="py-6 text-center text-sm text-muted-foreground">
            No diary entries posted for today yet.
          </CardContent>
        </Card>
      )}

      {/* Subject filter tabs */}
      <DiarySubjectTabs
        subjects={subjects}
        selectedSubjectId={selectedSubjectId}
        onSelect={setSelectedSubjectId}
      />

      {/* Date range picker */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">From</Label>
          <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} max={today} className="h-9 w-36" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">To</Label>
          <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} max={today} className="h-9 w-36" />
        </div>
      </div>

      {/* Timeline Feed */}
      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : filteredEntries.length === 0 ? (
        <EmptyState
          title="No diary entries"
          description="No diary entries found for the selected date range."
        />
      ) : (
        <DiaryTimeline
          entriesByDate={entriesByDate}
          subjectIndexMap={subjectIndexMap}
          onEntryRead={(entryId: string) => markReadMutation.mutate(entryId)}
        />
      )}
    </div>
  );
}
