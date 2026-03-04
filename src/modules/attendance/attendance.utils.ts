import type { AttendanceStatus } from '@prisma/client';
import { ATTENDED_STATUSES, EXCLUDED_FROM_TOTAL } from './attendance.constants';
import type { AttendancePercentage, AttendanceStatusCounts } from './attendance.types';

/**
 * Normalize a date string or Date to YYYY-MM-DD format (strip time).
 * Uses UTC-safe parsing to avoid timezone drift.
 */
export function normalizeDate(date: string | Date): string {
  if (typeof date === 'string') {
    // If already in YYYY-MM-DD format, return as-is
    const match = date.match(/^(\d{4}-\d{2}-\d{2})/);
    if (match?.[1]) return match[1];
  }
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0]!;
}

/** Get today's date in YYYY-MM-DD format (UTC) */
export function getTodayDate(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')}`;
}

/** Check if a given date (YYYY-MM-DD) is today */
export function isToday(date: string): boolean {
  return normalizeDate(date) === getTodayDate();
}

/** Check if a given date is in the future */
export function isFutureDate(date: string): boolean {
  return normalizeDate(date) > getTodayDate();
}

/** Check if a date is editable by a teacher (same day only) */
export function isEditableByTeacher(date: string): boolean {
  return isToday(date);
}

/**
 * Calculate attendance percentage.
 * Formula: (present + late) / (total - excused) × 100
 * Excused days are excluded from total days count.
 */
export function calculateAttendancePercentage(counts: AttendanceStatusCounts): AttendancePercentage {
  const effectiveTotal = counts.total - counts.excused;
  const attended = counts.present + counts.late;
  const percentage = effectiveTotal > 0 ? Math.round((attended / effectiveTotal) * 10000) / 100 : 0;

  return {
    percentage,
    totalDays: counts.total,
    presentDays: counts.present,
    absentDays: counts.absent,
    lateDays: counts.late,
    excusedDays: counts.excused,
  };
}

/** Count attendance statuses from an array of status values */
export function countStatuses(statuses: AttendanceStatus[]): AttendanceStatusCounts {
  const counts: AttendanceStatusCounts = {
    present: 0,
    absent: 0,
    late: 0,
    excused: 0,
    total: statuses.length,
  };

  for (const status of statuses) {
    switch (status) {
      case 'PRESENT': counts.present++; break;
      case 'ABSENT': counts.absent++; break;
      case 'LATE': counts.late++; break;
      case 'EXCUSED': counts.excused++; break;
    }
  }

  return counts;
}

/** Check if a status counts as "attended" */
export function isAttended(status: AttendanceStatus): boolean {
  return ATTENDED_STATUSES.includes(status);
}

/** Check if a status is excluded from total (e.g., excused) */
export function isExcludedFromTotal(status: AttendanceStatus): boolean {
  return EXCLUDED_FROM_TOTAL.includes(status);
}

/** Get all dates in a month as YYYY-MM-DD strings. Month is 0-indexed (0 = January). */
export function getMonthDates(year: number, month: number): string[] {
  const dates: string[] = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let day = 1; day <= daysInMonth; day++) {
    // Use manual formatting to avoid timezone issues
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    dates.push(`${year}-${mm}-${dd}`);
  }
  return dates;
}

/**
 * Check if a date falls on a weekend (Saturday/Sunday).
 * Parses YYYY-MM-DD manually to avoid timezone-dependent getDay().
 */
export function isWeekend(date: string | Date): boolean {
  let d: Date;
  if (typeof date === 'string') {
    // Parse YYYY-MM-DD as local date to avoid timezone shift
    const [y, m, day] = date.split('-').map(Number) as [number, number, number];
    d = new Date(y, m - 1, day);
  } else {
    d = date;
  }
  const dayOfWeek = d.getDay();
  return dayOfWeek === 0 || dayOfWeek === 6; // Sunday = 0, Saturday = 6
}

/**
 * Format date for display: "Mon, 3 Mar 2026".
 * Parses YYYY-MM-DD strings as local dates to avoid timezone issues.
 */
export function formatAttendanceDate(date: string | Date): string {
  let d: Date;
  if (typeof date === 'string') {
    const [y, m, day] = date.split('-').map(Number) as [number, number, number];
    d = new Date(y, m - 1, day);
  } else {
    d = date;
  }
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Parse school-wide attendance overview (groupBy result) into AttendanceStatusCounts.
 * Returns null if no data.
 */
export function parseSchoolOverviewCounts(
  overview: { status: string; _count: { id: number } }[] | null | undefined,
): AttendanceStatusCounts | null {
  if (!overview || !Array.isArray(overview) || overview.length === 0) return null;
  let present = 0, absent = 0, late = 0, excused = 0;
  for (const r of overview) {
    const count = Number(r._count?.id ?? 0);
    switch (r.status) {
      case 'PRESENT': present = count; break;
      case 'ABSENT': absent = count; break;
      case 'LATE': late = count; break;
      case 'EXCUSED': excused = count; break;
    }
  }
  const total = present + absent + late + excused;
  return total > 0 ? { present, absent, late, excused, total } : null;
}
