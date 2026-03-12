'use client';

import { DayOfWeek } from '@prisma/client';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ORDERED_DAYS, DAY_SHORT_LABELS } from '../timetable.constants';
import { formatTimeRange } from '../timetable.utils';
import type { PeriodSlotListItem, TimetableGridCell, TimetableEntryWithRelations } from '../timetable.types';

type Props = {
  periodSlots: PeriodSlotListItem[];
  grid: Record<string, Record<string, TimetableGridCell>>;
  onCellClick?: (dayOfWeek: DayOfWeek, periodSlotId: string, cell: TimetableGridCell) => void;
  onEntryClick?: (entry: TimetableEntryWithRelations) => void;
  compact?: boolean;
};

export function TimetableGrid({ periodSlots, grid, onCellClick, onEntryClick, compact = false }: Props) {
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
              <th key={day} className="border bg-muted/50 p-2 text-center font-medium text-muted-foreground">
                {DAY_SHORT_LABELS[day]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {activePeriods.map((slot) => (
            <tr key={slot.id}>
              <td className="border p-2 bg-muted/30">
                <div className="font-medium text-xs">{slot.shortName}</div>
                {!compact && (
                  <div className="text-[10px] text-muted-foreground">
                    {formatTimeRange(slot.startTime, slot.endTime)}
                  </div>
                )}
                {slot.isBreak && <Badge variant="outline" className="mt-0.5 text-[10px]">Break</Badge>}
              </td>

              {ORDERED_DAYS.map((day) => {
                const cell = grid[day]?.[slot.id] ?? { type: 'empty' as const, dayOfWeek: day, periodSlotId: slot.id };

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
                      cell.type !== 'empty' ? 'bg-primary/5' : 'bg-background',
                      onCellClick && 'cursor-pointer hover:bg-accent',
                    )}
                    onClick={() => onCellClick?.(day, slot.id, cell)}
                  >
                    <CellContent cell={cell} compact={compact} onEntryClick={onEntryClick} />
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

function CellContent({ cell, compact, onEntryClick }: { cell: TimetableGridCell; compact: boolean; onEntryClick?: (entry: TimetableEntryWithRelations) => void }) {
  if (cell.type === 'empty') {
    return <span className="text-xs text-muted-foreground/50">—</span>;
  }

  if (cell.type === 'regular') {
    const { entry } = cell;
    return (
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
    );
  }

  // Elective cell — stacked subjects
  return (
    <div className="space-y-0.5">
      {cell.groupName && (
        <Badge variant="secondary" className="text-[8px] mb-0.5">Elective</Badge>
      )}
      {cell.entries.map((entry) => (
        <div
          key={entry.id}
          className={cn(
            'rounded bg-accent/50 px-1 py-0.5',
            onEntryClick && 'hover:bg-accent cursor-pointer hover:ring-1 hover:ring-primary/30',
          )}
          onClick={(e) => {
            if (onEntryClick) {
              e.stopPropagation();
              onEntryClick(entry);
            }
          }}
        >
          <div className="font-medium text-[10px] truncate" title={entry.subject.name}>
            {entry.subject.code}
          </div>
          {!compact && (
            <div className="text-[9px] text-muted-foreground truncate">
              {entry.teacherProfile.user.firstName} {entry.teacherProfile.user.lastName[0]}.
              {entry.room ? ` · ${entry.room}` : ''}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
