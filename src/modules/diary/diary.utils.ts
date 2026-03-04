// ============================================
// Diary Module — Utility Functions
// ============================================

/** Normalize a Date to YYYY-MM-DD string */
export function normalizeDiaryDate(date: Date | string): string {
  if (typeof date === 'string') return date.slice(0, 10);
  return date.toISOString().slice(0, 10);
}

/** Get today's date as YYYY-MM-DD */
export function getTodayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Check if a date string (YYYY-MM-DD) is today */
export function isToday(dateStr: string): boolean {
  return dateStr === getTodayDateString();
}

/** Check if a date string (YYYY-MM-DD) is in the future */
export function isFutureDate(dateStr: string): boolean {
  return dateStr > getTodayDateString();
}

/** Check if a diary entry is editable by the teacher (same-day only) */
export function isEditableByTeacher(entryDate: string): boolean {
  return isToday(entryDate);
}

/** Format a date string for display: "Tuesday, March 4, 2026" */
export function formatDiaryDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/** Format a date string for short display: "Mar 4, 2026" */
export function formatDiaryDateShort(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/** Format a timestamp for display: "10:30 AM" */
export function formatTimestamp(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/** Group diary entries by date (YYYY-MM-DD) */
export function groupEntriesByDate<T extends { date: string }>(
  entries: T[],
): Map<string, T[]> {
  const grouped = new Map<string, T[]>();
  for (const entry of entries) {
    const date = normalizeDiaryDate(entry.date);
    const existing = grouped.get(date) ?? [];
    existing.push(entry);
    grouped.set(date, existing);
  }
  return grouped;
}

/** Get the start and end dates for a given week offset from today */
export function getWeekRange(weekOffset = 0): { startDate: string; endDate: string } {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  const start = new Date(now);
  start.setDate(now.getDate() + mondayOffset + weekOffset * 7);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  return {
    startDate: normalizeDiaryDate(start),
    endDate: normalizeDiaryDate(end),
  };
}

/** Get the start and end dates for a given month */
export function getMonthRange(year: number, month: number): { startDate: string; endDate: string } {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0);
  return {
    startDate: normalizeDiaryDate(start),
    endDate: normalizeDiaryDate(end),
  };
}

/** Check if a date is a weekend (Saturday or Sunday) */
export function isWeekend(dateStr: string): boolean {
  const day = new Date(dateStr + 'T00:00:00').getDay();
  return day === 0 || day === 6;
}

/** Generate all working days (Mon-Fri) in a date range */
export function getWorkingDays(startDate: string, endDate: string): string[] {
  const days: string[] = [];
  const current = new Date(startDate + 'T00:00:00');
  const end = new Date(endDate + 'T00:00:00');
  while (current <= end) {
    if (!isWeekend(normalizeDiaryDate(current))) {
      days.push(normalizeDiaryDate(current));
    }
    current.setDate(current.getDate() + 1);
  }
  return days;
}

/** Truncate text with ellipsis */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '…';
}

/** Get teacher full name from profile */
export function getTeacherName(profile: { user: { firstName: string; lastName: string } }): string {
  return `${profile.user.firstName} ${profile.user.lastName}`;
}
