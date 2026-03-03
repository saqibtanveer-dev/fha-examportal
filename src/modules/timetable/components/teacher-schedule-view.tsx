'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ORDERED_DAYS, DAY_SHORT_LABELS } from '../timetable.constants';
import { formatTimeRange } from '../timetable.utils';
import type { TimetableEntryWithRelations } from '../timetable.types';

type Props = {
  entries: TimetableEntryWithRelations[];
  teacherName?: string;
};

export function TeacherScheduleView({ entries, teacherName }: Props) {
  // Group by day
  const byDay = new Map<string, TimetableEntryWithRelations[]>();
  for (const day of ORDERED_DAYS) byDay.set(day, []);
  for (const entry of entries) {
    const list = byDay.get(entry.dayOfWeek) ?? [];
    list.push(entry);
    byDay.set(entry.dayOfWeek, list);
  }

  return (
    <div className="space-y-4">
      {teacherName && (
        <h3 className="text-lg font-semibold">{teacherName}&apos;s Schedule</h3>
      )}

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {ORDERED_DAYS.map((day) => {
          const dayEntries = (byDay.get(day) ?? []).sort(
            (a, b) => a.periodSlot.sortOrder - b.periodSlot.sortOrder,
          );

          return (
            <Card key={day}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{DAY_SHORT_LABELS[day]}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {dayEntries.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">No classes</p>
                ) : (
                  dayEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between rounded-md border p-2"
                    >
                      <div>
                        <div className="font-medium text-sm">{entry.subject.code}</div>
                        <div className="text-xs text-muted-foreground">
                          {entry.class.name} - {entry.section.name}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="text-[10px]">
                          {entry.periodSlot.shortName}
                        </Badge>
                        <div className="text-[10px] text-muted-foreground mt-0.5">
                          {formatTimeRange(entry.periodSlot.startTime, entry.periodSlot.endTime)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
