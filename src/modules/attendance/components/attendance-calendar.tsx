'use client';

import { useMemo } from 'react';
import { AttendanceStatus } from '@prisma/client';
import { cn } from '@/lib/utils';
import { ATTENDANCE_STATUS_CONFIG, CALENDAR_COLORS } from '../attendance.constants';
import type { MonthlyCalendarDay } from '../attendance.types';

type Props = {
  year: number;
  month: number; // 0-indexed (0 = January)
  days: MonthlyCalendarDay[];
  onDateClick?: (date: string) => void;
};

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function AttendanceCalendar({ year, month, days, onDateClick }: Props) {
  const calendarGrid = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const dayMap = new Map<string, MonthlyCalendarDay>();
    for (const d of days) dayMap.set(d.date, d);

    const grid: (MonthlyCalendarDay & { dayNumber: number } | null)[] = [];

    // Leading empty cells
    for (let i = 0; i < firstDay; i++) grid.push(null);

    // Day cells
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayData = dayMap.get(dateStr);
      grid.push({
        date: dateStr,
        dayNumber: d,
        status: dayData?.status ?? null,
        isWeekend: dayData?.isWeekend ?? [0, 6].includes(new Date(year, month, d).getDay()),
      });
    }

    return grid;
  }, [year, month, days]);

  function getStatusColor(status: AttendanceStatus | null, isWeekend: boolean): string {
    if (isWeekend) return 'bg-muted text-muted-foreground';
    if (!status) return 'bg-background text-muted-foreground';
    return cn(CALENDAR_COLORS[status], 'text-white');
  }

  return (
    <div className="space-y-3">
      {/* Weekday header */}
      <div className="grid grid-cols-7 gap-1">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="text-center text-xs font-medium text-muted-foreground py-1"
          >
            {label}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarGrid.map((cell, idx) => {
          if (!cell) {
            return <div key={`empty-${idx}`} className="aspect-square" />;
          }

          return (
            <button
              key={cell.date}
              type="button"
              onClick={() => onDateClick?.(cell.date)}
              disabled={!cell.status}
              className={cn(
                'aspect-square flex items-center justify-center rounded-md text-sm font-medium transition-colors',
                getStatusColor(cell.status, cell.isWeekend),
                cell.status && !cell.isWeekend && 'cursor-pointer hover:opacity-80',
                !cell.status && !cell.isWeekend && 'opacity-50',
              )}
              title={
                cell.status
                  ? `${cell.date}: ${ATTENDANCE_STATUS_CONFIG[cell.status].label}`
                  : cell.isWeekend
                    ? `${cell.date}: Weekend`
                    : `${cell.date}: No record`
              }
            >
              {cell.dayNumber}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 pt-2">
        {(Object.entries(CALENDAR_COLORS) as [AttendanceStatus, string][]).map(([status, color]) => (
          <div key={status} className="flex items-center gap-1.5">
            <div className={cn('h-3 w-3 rounded-sm', color)} />
            <span className="text-xs text-muted-foreground">
              {ATTENDANCE_STATUS_CONFIG[status].label}
            </span>
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-sm bg-muted" />
          <span className="text-xs text-muted-foreground">Weekend</span>
        </div>
      </div>
    </div>
  );
}
