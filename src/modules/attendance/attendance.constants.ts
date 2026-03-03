import { AttendanceStatus } from '@prisma/client';

/** Status display configuration */
export const ATTENDANCE_STATUS_CONFIG: Record<
  AttendanceStatus,
  { label: string; shortLabel: string; color: string; bgColor: string; icon: string }
> = {
  PRESENT: {
    label: 'Present',
    shortLabel: 'P',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    icon: '✓',
  },
  ABSENT: {
    label: 'Absent',
    shortLabel: 'A',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    icon: '✗',
  },
  LATE: {
    label: 'Late',
    shortLabel: 'L',
    color: 'text-amber-700',
    bgColor: 'bg-amber-100',
    icon: '⏰',
  },
  EXCUSED: {
    label: 'Excused',
    shortLabel: 'E',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    icon: '📋',
  },
};

/** Ordered statuses for UI display */
export const ATTENDANCE_STATUSES: AttendanceStatus[] = [
  AttendanceStatus.PRESENT,
  AttendanceStatus.ABSENT,
  AttendanceStatus.LATE,
  AttendanceStatus.EXCUSED,
];

/** Default status when marking attendance (pre-fill all as present) */
export const DEFAULT_ATTENDANCE_STATUS = AttendanceStatus.PRESENT;

/** Calendar color mapping for monthly view */
export const CALENDAR_COLORS: Record<AttendanceStatus, string> = {
  PRESENT: 'bg-green-500',
  ABSENT: 'bg-red-500',
  LATE: 'bg-amber-500',
  EXCUSED: 'bg-blue-500',
};

/** Statuses that count as "attended" for percentage calculations */
export const ATTENDED_STATUSES: AttendanceStatus[] = [
  AttendanceStatus.PRESENT,
  AttendanceStatus.LATE,
];

/** Statuses excluded from total (don't count against student) */
export const EXCLUDED_FROM_TOTAL: AttendanceStatus[] = [
  AttendanceStatus.EXCUSED,
];
