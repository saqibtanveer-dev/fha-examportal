'use client';

import { useRef, useEffect } from 'react';
import { EmptyState } from '@/components/shared';
import { formatDiaryDate, getTeacherName } from '../diary.utils';
import { getSubjectColor } from '../diary.constants';
import type { DiaryEntryForStudent } from '../diary.types';
import { BookOpen } from 'lucide-react';

type Props = {
  entriesByDate: Map<string, DiaryEntryForStudent[]>;
  subjectIndexMap: Map<string, number>;
  onEntryRead?: (entryId: string) => void;
  className?: string;
};

export function DiaryTimeline({ entriesByDate, subjectIndexMap, onEntryRead, className }: Props) {
  const dates = Array.from(entriesByDate.keys()).sort((a, b) => b.localeCompare(a));

  if (dates.length === 0) {
    return (
      <EmptyState
        icon={<BookOpen className="h-12 w-12 text-muted-foreground" />}
        title="No Diary Entries"
        description="No diary entries found for the selected period."
      />
    );
  }

  return (
    <div className={`space-y-6 ${className ?? ''}`}>
      {dates.map((date) => {
        const entries = entriesByDate.get(date)!;
        return (
          <div key={date}>
            {/* Date separator */}
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm pb-2 pt-1">
              <h2 className="text-sm font-semibold text-foreground sm:text-base">
                {formatDiaryDate(date)}
              </h2>
              <div className="mt-1 h-px bg-border" />
            </div>

            {/* Entries for this date */}
            <div className="space-y-3 pl-0 sm:pl-4">
              {entries.map((entry) => {
                const subjectIdx = subjectIndexMap.get(entry.subject.id) ?? 0;
                const subjectColor = getSubjectColor(subjectIdx);

                return (
                  <DiaryTimelineCard
                    key={entry.id}
                    entry={entry}
                    subjectColor={subjectColor}
                    onVisible={() => onEntryRead?.(entry.id)}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Single timeline entry card ──

function DiaryTimelineCard({
  entry,
  subjectColor,
  onVisible,
}: {
  entry: DiaryEntryForStudent;
  subjectColor: string;
  onVisible?: () => void;
}) {
  const ref = useIntersectionCallback(onVisible);

  return (
    <div ref={ref} className="rounded-lg border bg-card p-3 sm:p-4">
      <div className="flex flex-wrap items-start gap-2">
        <span className={`shrink-0 rounded-md border px-2 py-0.5 text-xs font-medium ${subjectColor}`}>
          {entry.subject.code}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {entry.subject.name}
            </span>
            <span className="text-xs text-muted-foreground">—</span>
            <span className="text-xs text-muted-foreground">
              {getTeacherName(entry.teacherProfile)}
            </span>
          </div>
          <h3 className="mt-1 text-sm font-semibold sm:text-base">{entry.title}</h3>
        </div>
      </div>

      <div className="mt-2 whitespace-pre-wrap text-sm text-foreground/90 leading-relaxed">
        {entry.content}
      </div>

      <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
        {entry.isEdited && <span className="text-amber-600">(edited)</span>}
      </div>
    </div>
  );
}

// ── Intersection Observer hook for read tracking ──

function useIntersectionCallback(onVisible?: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  const calledRef = useRef(false);

  useEffect(() => {
    if (!onVisible || calledRef.current || !ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && !calledRef.current) {
          calledRef.current = true;
          onVisible();
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [onVisible]);

  return ref;
}
