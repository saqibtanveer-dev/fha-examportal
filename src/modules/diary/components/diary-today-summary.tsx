'use client';

import { useMemo } from 'react';
import { getSubjectColor } from '../diary.constants';
import type { DiaryEntryForStudent } from '../diary.types';

type Props = {
  todayEntries: DiaryEntryForStudent[];
  allSubjects: { id: string; name: string; code: string }[];
  className?: string;
};

export function DiaryTodaySummary({ todayEntries, allSubjects, className }: Props) {
  const coveredSubjectIds = useMemo(
    () => new Set(todayEntries.map((e) => e.subject.id)),
    [todayEntries],
  );

  if (allSubjects.length === 0) return null;

  return (
    <div className={`rounded-lg border bg-card p-3 sm:p-4 ${className ?? ''}`}>
      <div className="flex items-center gap-2">
        <span className="text-lg">📚</span>
        <span className="text-sm font-semibold">
          {todayEntries.length} diary entr{todayEntries.length === 1 ? 'y' : 'ies'} today
        </span>
      </div>

      <div className="mt-2 flex flex-wrap gap-2">
        {allSubjects.map((subject, idx) => {
          const isCovered = coveredSubjectIds.has(subject.id);
          return (
            <span
              key={subject.id}
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium transition-opacity ${
                isCovered ? getSubjectColor(idx) : 'bg-muted text-muted-foreground opacity-60'
              }`}
            >
              {isCovered ? '✅' : '❌'} {subject.code}
            </span>
          );
        })}
      </div>
    </div>
  );
}
