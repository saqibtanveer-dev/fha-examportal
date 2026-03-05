'use client';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';
import { formatExamDate, formatTimeRange } from '../datesheet.utils';
import type { DeepSerialize } from '@/utils/serialize';
import type { DatesheetEntryWithRelations } from '../datesheet.types';

type SerializedEntry = DeepSerialize<DatesheetEntryWithRelations>;

type Props = {
  entries: SerializedEntry[];
  dates: string[];
  classes: { id: string; name: string }[];
  onCellClick?: (date: string, classId: string, entry: SerializedEntry | null) => void;
  onDutyClick?: (entry: SerializedEntry) => void;
  showDuties?: boolean;
  readOnly?: boolean;
};

export function DatesheetGrid({ entries, dates, classes, onCellClick, onDutyClick, showDuties = true, readOnly = false }: Props) {
  const grid = buildGrid(entries, dates, classes);

  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-muted/50">
            <th className="sticky left-0 z-10 bg-muted/50 border-b border-r px-3 py-2 text-left font-medium min-w-30">
              Class
            </th>
            {dates.map((date) => (
              <th key={date} className="border-b border-r px-3 py-2 text-center font-medium min-w-40">
                {formatExamDate(date)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {classes.map((cls) => (
            <tr key={cls.id} className="hover:bg-muted/30">
              <td className="sticky left-0 z-10 bg-background border-b border-r px-3 py-2 font-medium">
                {cls.name}
              </td>
              {dates.map((date) => {
                const cellEntries = grid[date]?.[cls.id] ?? [];
                return (
                  <td
                    key={`${date}-${cls.id}`}
                    className={cn(
                      'border-b border-r px-2 py-1.5 align-top transition-colors',
                      !readOnly && 'cursor-pointer hover:bg-accent/50',
                      cellEntries.length > 0 && 'bg-primary/5',
                    )}
                    onClick={() => !readOnly && onCellClick?.(date, cls.id, cellEntries[0] ?? null)}
                  >
                    {cellEntries.length > 0 ? (
                      <div className="space-y-1">
                        {cellEntries.map((entry) => (
                          <CellContent key={entry.id} entry={entry} showDuties={showDuties} onDutyClick={onDutyClick} />
                        ))}
                      </div>
                    ) : (
                      !readOnly && (
                        <span className="text-muted-foreground text-xs">+ Add</span>
                      )
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

function CellContent({ entry, showDuties, onDutyClick }: { entry: SerializedEntry; showDuties: boolean; onDutyClick?: (entry: SerializedEntry) => void }) {
  return (
    <div className="space-y-0.5">
      <div className="font-medium text-xs">{entry.subject.name}</div>
      <div className="text-muted-foreground text-xs">{formatTimeRange(entry.startTime, entry.endTime)}</div>
      {entry.room && <div className="text-muted-foreground text-xs">Room: {entry.room}</div>}
      {entry.totalMarks && (
        <Badge variant="outline" className="text-xs px-1 py-0">{Number(entry.totalMarks)} marks</Badge>
      )}
      {showDuties && (
        <div className="mt-1 flex flex-wrap items-center gap-1">
          {entry.duties.length > 0 ? (
            entry.duties.map((d) => (
              <Badge key={d.id} variant="secondary" className="text-xs px-1 py-0">
                {d.teacherProfile.user.firstName}
              </Badge>
            ))
          ) : onDutyClick ? (
            <button
              type="button"
              className="text-muted-foreground hover:text-primary text-xs flex items-center gap-0.5 transition-colors"
              onClick={(e) => { e.stopPropagation(); onDutyClick(entry); }}
            >
              <Users className="h-3 w-3" /> assign
            </button>
          ) : null}
          {entry.duties.length > 0 && onDutyClick && (
            <button
              type="button"
              className="text-muted-foreground hover:text-primary text-xs transition-colors"
              onClick={(e) => { e.stopPropagation(); onDutyClick(entry); }}
              title="Manage duties"
            >
              <Users className="h-3 w-3" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function buildGrid(
  entries: SerializedEntry[],
  dates: string[],
  classes: { id: string }[],
): Record<string, Record<string, SerializedEntry[]>> {
  const grid: Record<string, Record<string, SerializedEntry[]>> = {};
  for (const date of dates) {
    grid[date] = {};
    for (const cls of classes) grid[date][cls.id] = [];
  }
  for (const entry of entries) {
    const iso = typeof entry.examDate === 'string' ? entry.examDate.slice(0, 10) : '';
    const dateSlots = grid[iso];
    if (dateSlots) {
      const list = dateSlots[entry.classId] ?? [];
      list.push(entry);
      dateSlots[entry.classId] = list;
    }
  }
  return grid;
}
