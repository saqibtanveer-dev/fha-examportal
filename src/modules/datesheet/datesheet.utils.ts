import { TIME_FORMAT_REGEX } from './datesheet.constants';

// Use loose types to accept both Prisma (Date) and serialized (string) forms
type AnyEntry = { examDate: Date | string; classId: string; sectionId: string; [key: string]: unknown };
type AnyDutyWithEntry = { entry: { examDate: Date | string; [key: string]: unknown }; [key: string]: unknown };

/** Build composite key for class-section */
export function classSectionKey(classId: string, sectionId: string): string {
  return `${classId}::${sectionId}`;
}

/** Parse composite key back to classId and sectionId */
export function parseClassSectionKey(key: string): { classId: string; sectionId: string } {
  const [classId, sectionId] = key.split('::');
  return { classId, sectionId };
}

/** Validate HH:mm format */
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

/** Check if two time ranges overlap */
export function doTimesOverlap(startA: string, endA: string, startB: string, endB: string): boolean {
  return compareTime(startA, endB) < 0 && compareTime(startB, endA) < 0;
}

/** Format time range: "09:00 - 12:00" */
export function formatTimeRange(startTime: string, endTime: string): string {
  return `${startTime} - ${endTime}`;
}

/** Format exam date: "Mon, 15 Mar 2026" */
export function formatExamDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

/** Format date range: "15 Mar - 25 Mar 2026" */
export function formatDateRange(start: Date | string, end: Date | string): string {
  const s = typeof start === 'string' ? new Date(start) : start;
  const e = typeof end === 'string' ? new Date(end) : end;
  const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
  return `${s.toLocaleDateString('en-US', opts)} - ${e.toLocaleDateString('en-US', { ...opts, year: 'numeric' })}`;
}

/** Get unique sorted exam dates (ISO strings) from entries */
export function extractExamDates<T extends AnyEntry>(entries: T[]): string[] {
  const dateSet = new Set<string>();
  for (const entry of entries) {
    const iso = typeof entry.examDate === 'string' ? entry.examDate.slice(0, 10) : new Date(entry.examDate).toISOString().slice(0, 10);
    dateSet.add(iso);
  }
  return [...dateSet].sort();
}

/** Build grid[dateISO][classId::sectionId] from flat entries — section-level granularity */
export function buildDatesheetGrid<T extends AnyEntry>(
  entries: T[],
  dates: string[],
  classSections: { classId: string; sectionId: string }[],
): Record<string, Record<string, T[]>> {
  const grid: Record<string, Record<string, T[]>> = {};
  for (const date of dates) {
    grid[date] = {};
    for (const cs of classSections) grid[date][classSectionKey(cs.classId, cs.sectionId)] = [];
  }
  for (const entry of entries) {
    const iso = typeof entry.examDate === 'string' ? entry.examDate.slice(0, 10) : new Date(entry.examDate).toISOString().slice(0, 10);
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

/** Group entries by date for list view — returns array of { date, entries } */
export function groupEntriesByDate<T extends AnyEntry>(
  entries: T[],
): { date: string; entries: T[] }[] {
  const map = new Map<string, T[]>();
  for (const entry of entries) {
    const iso = typeof entry.examDate === 'string' ? entry.examDate.slice(0, 10) : new Date(entry.examDate).toISOString().slice(0, 10);
    const list = map.get(iso) ?? [];
    list.push(entry);
    map.set(iso, list);
  }
  return [...map.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([date, entries]) => ({ date, entries }));
}

/** Group teacher duties by date */
export function groupDutiesByDate<T extends AnyDutyWithEntry>(
  duties: T[],
): { date: string; duties: T[] }[] {
  const map = new Map<string, T[]>();
  for (const duty of duties) {
    const iso = typeof duty.entry.examDate === 'string'
      ? (duty.entry.examDate as string).slice(0, 10)
      : new Date(duty.entry.examDate).toISOString().slice(0, 10);
    const list = map.get(iso) ?? [];
    list.push(duty);
    map.set(iso, list);
  }
  return [...map.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([date, duties]) => ({ date, duties }));
}
