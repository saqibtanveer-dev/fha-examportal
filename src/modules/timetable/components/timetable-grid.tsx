'use client';

import { DayOfWeek } from '@prisma/client';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ORDERED_DAYS, DAY_SHORT_LABELS } from '../timetable.constants';
import { formatTimeRange } from '../timetable.utils';
import type { PeriodSlotListItem, TimetableEntryWithRelations } from '../timetable.types';

type Props = {
  periodSlots: PeriodSlotListItem[];
  /** grid[dayOfWeek][periodSlotId] → entry | null */
  grid: Record<string, Record<string, TimetableEntryWithRelations | null>>;
  onCellClick?: (dayOfWeek: DayOfWeek, periodSlotId: string, entry: TimetableEntryWithRelations | null) => void;
  compact?: boolean;
};

export function TimetableGrid({ periodSlots, grid, onCellClick, compact = false }: Props) {
  const activePeriods = periodSlots.filter((p) => p.isActive).sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            <th className="border bg-muted/50 p-2 text-left font-medium text-muted-foreground w-24">
              Period
            </th>
            {ORDERED_DAYS.map((day) => (
              <th
                key={day}
                className="border bg-muted/50 p-2 text-center font-medium text-muted-foreground"
              >
                {DAY_SHORT_LABELS[day]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {activePeriods.map((slot) => (
            <tr key={slot.id}>
              {/* Period info */}
              <td className="border p-2 bg-muted/30">
                <div className="font-medium text-xs">{slot.shortName}</div>
                {!compact && (
                  <div className="text-[10px] text-muted-foreground">
                    {formatTimeRange(slot.startTime, slot.endTime)}
                  </div>
                )}
                {slot.isBreak && (
                  <Badge variant="outline" className="mt-0.5 text-[10px]">
                    Break
                  </Badge>
                )}
              </td>

              {/* Day cells */}
              {ORDERED_DAYS.map((day) => {
                const entry = grid[day]?.[slot.id] ?? null;

                if (slot.isBreak) {
                  return (
                    <td key={day} className="border p-2 bg-muted/10 text-center">
                      <span className="text-xs text-muted-foreground italic">Break</span>
                    </td>
                  );
                }

                return (
                  <td
                    key={day}
                    className={cn(
                      'border p-1.5 text-center transition-colors',
                      entry ? 'bg-primary/5' : 'bg-background',
                      onCellClick && 'cursor-pointer hover:bg-accent',
                    )}
                    onClick={() => onCellClick?.(day, slot.id, entry)}
                  >
                    {entry ? (
                      <div className="space-y-0.5">
                        <div className="font-medium text-xs truncate" title={entry.subject.name}>
                          {entry.subject.code}
                        </div>
                        {!compact && (
                          <div className="text-[10px] text-muted-foreground truncate">
                            {entry.teacherProfile.user.firstName} {entry.teacherProfile.user.lastName[0]}.
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground/50">—</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
