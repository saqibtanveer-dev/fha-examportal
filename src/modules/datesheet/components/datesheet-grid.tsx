'use client';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';
import { formatExamDate, formatTimeRange, classSectionKey } from '../datesheet.utils';
import type { DeepSerialize } from '@/utils/serialize';
import type { DatesheetEntryWithRelations } from '../datesheet.types';

type SerializedEntry = DeepSerialize<DatesheetEntryWithRelations>;

type ClassSection = {
  classId: string;
  className: string;
  sectionId: string;
  sectionName: string;
};

type Props = {
  entries: SerializedEntry[];
  dates: string[];
  classSections: ClassSection[];
  onCellClick?: (date: string, classId: string, sectionId: string, entry: SerializedEntry | null) => void;
  onEntryClick?: (entry: SerializedEntry) => void;
  onDutyClick?: (entry: SerializedEntry) => void;
  showDuties?: boolean;
  readOnly?: boolean;
};

export function DatesheetGrid({
  entries, dates, classSections, onCellClick, onEntryClick, onDutyClick, showDuties = true, readOnly = false,
}: Props) {
  const grid = buildGrid(entries, dates, classSections);

  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-muted/50">
            <th className="sticky left-0 z-10 bg-muted/50 border-b border-r px-3 py-2 text-left font-medium min-w-36">
              Class / Section
            </th>
            {dates.map((date) => (
              <th key={date} className="border-b border-r px-3 py-2 text-center font-medium min-w-40">
                {formatExamDate(date)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {classSections.map((cs) => {
            const key = classSectionKey(cs.classId, cs.sectionId);
            return (
              <tr key={key} className="hover:bg-muted/30">
                <td className="sticky left-0 z-10 bg-background border-b border-r px-3 py-2 font-medium">
                  <span>{cs.className}</span>
                  <span className="text-muted-foreground ml-1">({cs.sectionName})</span>
                </td>
                {dates.map((date) => {
                  const cellEntries = grid[date]?.[key] ?? [];
                  return (
                    <td
                      key={`${date}-${key}`}
                      className={cn(
                        'border-b border-r px-2 py-1.5 align-top transition-colors',
                        !readOnly && 'cursor-pointer hover:bg-accent/50',
                        cellEntries.length > 0 && 'bg-primary/5',
                      )}
                      onClick={() => {
                        if (readOnly) return;
                        if (cellEntries.length === 1 && onEntryClick) {
                          onEntryClick(cellEntries[0]!);
                        } else if (cellEntries.length === 1) {
                          onCellClick?.(date, cs.classId, cs.sectionId, cellEntries[0]!);
                        } else {
                          onCellClick?.(date, cs.classId, cs.sectionId, null);
                        }
                      }}
                    >
                      {cellEntries.length > 0 ? (
                        <div className="space-y-1">
                          {cellEntries.map((entry) => (
                            <GridCellContent
                              key={entry.id}
                              entry={entry}
                              showDuties={showDuties}
                              onDutyClick={onDutyClick}
                              onEntryClick={!readOnly && cellEntries.length > 1 ? onEntryClick : undefined}
                            />
                          ))}
                        </div>
                      ) : (
                        !readOnly && <span className="text-muted-foreground text-xs">+ Add</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function GridCellContent({ entry, showDuties, onDutyClick, onEntryClick }: {
  entry: SerializedEntry;
  showDuties: boolean;
  onDutyClick?: (entry: SerializedEntry) => void;
  onEntryClick?: (entry: SerializedEntry) => void;
}) {
  return (
    <div
      className={cn(
        'space-y-0.5',
        onEntryClick && 'rounded px-1 py-0.5 hover:bg-accent cursor-pointer hover:ring-1 hover:ring-primary/30',
      )}
      onClick={onEntryClick ? (e) => { e.stopPropagation(); onEntryClick(entry); } : undefined}
    >      <div className="font-medium text-xs">{entry.subject.name}</div>
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
  classSections: ClassSection[],
): Record<string, Record<string, SerializedEntry[]>> {
  const grid: Record<string, Record<string, SerializedEntry[]>> = {};
  for (const date of dates) {
    grid[date] = {};
    for (const cs of classSections) {
      grid[date][classSectionKey(cs.classId, cs.sectionId)] = [];
    }
  }
  for (const entry of entries) {
    const iso = typeof entry.examDate === 'string' ? entry.examDate.slice(0, 10) : '';
    const dateSlots = grid[iso];
    if (dateSlots) {
      const key = classSectionKey(entry.classId, entry.sectionId);
      const list = dateSlots[key] ?? [];
      list.push(entry);
      dateSlots[key] = list;
    }
  }
  return grid;
}
