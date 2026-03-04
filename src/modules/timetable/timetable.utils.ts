import { DayOfWeek } from '@prisma/client';
import { DAY_LABELS, DAY_SHORT_LABELS, ORDERED_DAYS, TIME_FORMAT_REGEX } from './timetable.constants';
import type { PeriodSlotListItem, TimetableEntryWithRelations } from './timetable.types';

/** Validate HH:mm time format */
export function isValidTime(time: string): boolean {
  return TIME_FORMAT_REGEX.test(time);
}

/** Compare two HH:mm times. Returns -1 if a < b, 0 if equal, 1 if a > b */
export function compareTime(a: string, b: string): number {
  const [aH = 0, aM = 0] = a.split(':').map(Number);
  const [bH = 0, bM = 0] = b.split(':').map(Number);
  if (aH !== bH) return aH < bH ? -1 : 1;
  if (aM !== bM) return aM < bM ? -1 : 1;
  return 0;
}

/** Check if endTime is after startTime */
export function isEndAfterStart(startTime: string, endTime: string): boolean {
  return compareTime(startTime, endTime) < 0;
}

/** Get current DayOfWeek based on JS Date */
export function getCurrentDayOfWeek(): DayOfWeek {
  const jsDay = new Date().getDay(); // 0=Sunday
  const dayMap: Record<number, DayOfWeek> = {
    0: DayOfWeek.SUNDAY,
    1: DayOfWeek.MONDAY,
    2: DayOfWeek.TUESDAY,
    3: DayOfWeek.WEDNESDAY,
    4: DayOfWeek.THURSDAY,
    5: DayOfWeek.FRIDAY,
    6: DayOfWeek.SATURDAY,
  };
  return dayMap[jsDay] ?? DayOfWeek.MONDAY;
}

/** Get full day label */
export function getDayLabel(day: DayOfWeek): string {
  return DAY_LABELS[day];
}

/** Get short day label */
export function getDayShortLabel(day: DayOfWeek): string {
  return DAY_SHORT_LABELS[day];
}

/** Format time range for display: "08:00 - 08:45" */
export function formatTimeRange(startTime: string, endTime: string): string {
  return `${startTime} - ${endTime}`;
}

/** Build grid[dayOfWeek][periodSlotId] from flat timetable entries */
export function buildTimetableGrid(
  entries: TimetableEntryWithRelations[] | undefined,
  periodSlots: PeriodSlotListItem[],
): Record<string, Record<string, TimetableEntryWithRelations | null>> {
  const grid: Record<string, Record<string, TimetableEntryWithRelations | null>> = {};
  for (const day of ORDERED_DAYS) {
    grid[day] = {};
    for (const slot of periodSlots) grid[day][slot.id] = null;
  }
  if (entries) {
    for (const entry of entries) {
      const e = entry as unknown as TimetableEntryWithRelations;
      const daySlots = grid[e.dayOfWeek];
      if (daySlots) daySlots[e.periodSlotId] = e;
    }
  }
  return grid;
}
