import type { DatesheetStatus } from '@prisma/client';

/** Human-readable status labels */
export const DATESHEET_STATUS_LABELS: Record<DatesheetStatus, string> = {
  DRAFT: 'Draft',
  PUBLISHED: 'Published',
  ARCHIVED: 'Archived',
};

/** Badge variant per status */
export const DATESHEET_STATUS_VARIANTS: Record<DatesheetStatus, 'secondary' | 'default' | 'outline'> = {
  DRAFT: 'secondary',
  PUBLISHED: 'default',
  ARCHIVED: 'outline',
};

/** Supported invigilation duty roles */
export const DUTY_ROLES = ['INVIGILATOR', 'HEAD_INVIGILATOR', 'SUPERVISOR'] as const;
export type DutyRole = (typeof DUTY_ROLES)[number];

/** Role display labels */
export const DUTY_ROLE_LABELS: Record<string, string> = {
  INVIGILATOR: 'Invigilator',
  HEAD_INVIGILATOR: 'Head Invigilator',
  SUPERVISOR: 'Supervisor',
};

/** Time format regex — same pattern as timetable */
export const TIME_FORMAT_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

/** Limits */
export const MAX_DUTIES_PER_ENTRY = 5;
export const MAX_ENTRIES_PER_DATESHEET = 500;
