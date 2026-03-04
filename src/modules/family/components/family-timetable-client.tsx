'use client';

// ============================================
// Family Timetable Page — Client Component
// ============================================

import { PageHeader } from '@/components/shared';
import { EmptyState } from '@/components/shared';
import { SkeletonDashboard } from '@/components/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';
import { useSelectedChild, useChildTimetable } from '@/modules/family/hooks';
import { ChildSelector } from './child-selector';
import type { ChildTimetableEntry } from '@/modules/family/family.types';

const DAY_ORDER = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

export function FamilyTimetableClient() {
  const { children, selectedChild, selectedChildId, isLoading: childrenLoading } = useSelectedChild();
  const { data, isLoading } = useChildTimetable(selectedChildId ?? '', !!selectedChildId);

  if (childrenLoading || isLoading) return <SkeletonDashboard />;

  if (!selectedChild) {
    return <EmptyState icon={<Clock className="h-12 w-12 text-muted-foreground" />} title="No Children" description="No students linked." />;
  }

  const entries = data?.success ? data.data ?? [] : [];

  // Group by day
  const byDay = new Map<string, ChildTimetableEntry[]>();
  for (const day of DAY_ORDER) {
    byDay.set(day, entries.filter((e) => e.dayOfWeek === day));
  }

  return (
    <div>
      <PageHeader title="Timetable" description={`${selectedChild.studentName}'s weekly schedule`} />
      <div className="mb-4">
        <ChildSelector children={children} selectedChildId={selectedChildId} />
      </div>

      {entries.length === 0 ? (
        <EmptyState icon={<Clock className="h-12 w-12 text-muted-foreground" />} title="No Timetable" description="No timetable has been set up." />
      ) : (
        <div className="space-y-4">
          {DAY_ORDER.map((day) => {
            const dayEntries = byDay.get(day) ?? [];
            if (dayEntries.length === 0) return null;

            return (
              <Card key={day}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold">
                    {day.charAt(0) + day.slice(1).toLowerCase()}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {dayEntries.map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between rounded-md border p-2 text-sm">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="min-w-[60px] justify-center">
                            {entry.periodLabel}
                          </Badge>
                          <span className="font-medium">{entry.subjectName}</span>
                        </div>
                        <div className="flex items-center gap-3 text-muted-foreground">
                          <span>{entry.teacherName}</span>
                          <span className="text-xs">
                            {entry.startTime} - {entry.endTime}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
