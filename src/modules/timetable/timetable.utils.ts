import { DayOfWeek } from '@prisma/client';
import { DAY_LABELS, DAY_SHORT_LABELS, ORDERED_DAYS, TIME_FORMAT_REGEX } from './timetable.constants';
import type { PeriodSlotListItem, TimetableGridCell } from './timetable.types';

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

/**
 * Build grid[dayOfWeek][periodSlotId] from flat timetable entries.
 * Handles both regular (single) and elective (multi) entries per cell.
 * Uses discriminated union types for type-safe cell rendering.
 */
export function buildTimetableGrid<T extends { dayOfWeek: string; periodSlotId: string; isElectiveSlot: boolean; electiveSlotGroupId: string | null; electiveSlotGroup?: { id: string; name: string | null } | null }>(
  entries: T[] | undefined,
  periodSlots: PeriodSlotListItem[],
): Record<string, Record<string, TimetableGridCell>> {
  const grid: Record<string, Record<string, TimetableGridCell>> = {};

  // Initialize all cells as empty
  for (const day of ORDERED_DAYS) {
    grid[day] = {};
    for (const slot of periodSlots) {
      grid[day][slot.id] = { type: 'empty', dayOfWeek: day, periodSlotId: slot.id };
    }
  }

  if (!entries || entries.length === 0) return grid;

  // Group elective entries by their slot group ID
  const electiveGroups = new Map<string, { groupName: string | null; entries: T[] }>();

  for (const entry of entries) {
    const daySlots = grid[entry.dayOfWeek];
    if (!daySlots) continue;

    if (entry.isElectiveSlot && entry.electiveSlotGroupId) {
      const existing = electiveGroups.get(entry.electiveSlotGroupId);
      if (existing) {
        existing.entries.push(entry);
      } else {
        electiveGroups.set(entry.electiveSlotGroupId, {
          groupName: entry.electiveSlotGroup?.name ?? null,
          entries: [entry],
        });
      }
    } else {
      // Regular entry — single subject per cell
      daySlots[entry.periodSlotId] = {
        type: 'regular',
        dayOfWeek: entry.dayOfWeek as DayOfWeek,
        periodSlotId: entry.periodSlotId,
        entry: entry as never,
      };
    }
  }

  // Place elective groups into the grid
  for (const [groupId, group] of electiveGroups) {
    const firstEntry = group.entries[0];
    if (!firstEntry) continue;
    const daySlots = grid[firstEntry.dayOfWeek];
    if (!daySlots) continue;

    daySlots[firstEntry.periodSlotId] = {
      type: 'elective',
      dayOfWeek: firstEntry.dayOfWeek as DayOfWeek,
      periodSlotId: firstEntry.periodSlotId,
      groupId,
      groupName: group.groupName,
      entries: group.entries as never[],
    };
  }

  return grid;
}
