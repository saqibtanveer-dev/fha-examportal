'use client';

// ============================================
// Family Diary Page — Client Component
// Reuses shared DiaryViewShell (same view as student diary)
// ============================================

import { useState } from 'react';
import { EmptyState } from '@/components/shared';
import { SkeletonPage } from '@/components/shared';
import { BookOpenText } from 'lucide-react';
import { useSelectedChild, useChildDiary, useChildTodayDiary } from '@/modules/family/hooks';
import { useMarkDiaryAsRead } from '@/modules/family/hooks';
import { DiaryViewShell } from '@/app/(dashboard)/student/diary/diary-view';
import { getWeekRange } from '@/modules/diary/diary.utils';
import type { DiaryEntryForStudent } from '@/modules/diary/diary.types';
import { ChildSelector } from './child-selector';

export function FamilyDiaryClient() {
  const { children, selectedChild, selectedChildId, isLoading: childrenLoading } = useSelectedChild();
  const weekRange = getWeekRange();
  const [startDate, setStartDate] = useState(weekRange.startDate);
  const [endDate, setEndDate] = useState(weekRange.endDate);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | undefined>();

  const { data: todayEntries, isLoading: todayLoading } = useChildTodayDiary(selectedChildId ?? '', !!selectedChildId);
  const { data: entries, isLoading } = useChildDiary(selectedChildId ?? '', startDate, endDate, selectedSubjectId, !!selectedChildId);
  const { execute: markAsRead } = useMarkDiaryAsRead(selectedChildId ?? '');

  if (childrenLoading) return <SkeletonPage />;

  if (!selectedChild) {
    return <EmptyState icon={<BookOpenText className="h-12 w-12 text-muted-foreground" />} title="No Children" description="No students linked." />;
  }

  return (
    <DiaryViewShell
      title="Diary / Homework"
      description={`${selectedChild.studentName}'s diary — ${selectedChild.className} ${selectedChild.sectionName}`}
      breadcrumbs={[{ label: 'Family', href: '/family' }, { label: 'Diary' }]}
      headerSlot={
        <div className="mb-2">
          <ChildSelector children={children} selectedChildId={selectedChildId} />
        </div>
      }
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
      onEntryRead={(entryId) => markAsRead(entryId)}
    />
  );
}
