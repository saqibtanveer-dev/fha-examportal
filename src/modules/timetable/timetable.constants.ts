import { DayOfWeek } from '@prisma/client';

/** Ordered days for timetable display (Monday-first, skip Sunday by default) */
export const ORDERED_DAYS: DayOfWeek[] = [
  DayOfWeek.MONDAY,
  DayOfWeek.TUESDAY,
  DayOfWeek.WEDNESDAY,
  DayOfWeek.THURSDAY,
  DayOfWeek.FRIDAY,
  DayOfWeek.SATURDAY,
];

/** Human-readable day labels */
export const DAY_LABELS: Record<DayOfWeek, string> = {
  MONDAY: 'Monday',
  TUESDAY: 'Tuesday',
  WEDNESDAY: 'Wednesday',
  THURSDAY: 'Thursday',
  FRIDAY: 'Friday',
  SATURDAY: 'Saturday',
  SUNDAY: 'Sunday',
};

/** Short day labels */
export const DAY_SHORT_LABELS: Record<DayOfWeek, string> = {
  MONDAY: 'Mon',
  TUESDAY: 'Tue',
  WEDNESDAY: 'Wed',
  THURSDAY: 'Thu',
  FRIDAY: 'Fri',
  SATURDAY: 'Sat',
  SUNDAY: 'Sun',
};

/** Maximum periods allowed per day */
export const MAX_PERIODS_PER_DAY = 12;

/** Time format regex (HH:mm) */
export const TIME_FORMAT_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;
