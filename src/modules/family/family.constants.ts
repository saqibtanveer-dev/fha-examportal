// ============================================
// Family Module — Constants
// ============================================

/** Relationship options for family-student links */
export const FAMILY_RELATIONSHIPS = [
  'Father',
  'Mother',
  'Guardian',
  'Grandfather',
  'Grandmother',
  'Uncle',
  'Aunt',
  'Elder Sibling',
  'Other',
] as const;

export type FamilyRelationship = (typeof FAMILY_RELATIONSHIPS)[number];

/** Default stale time for family queries (5 minutes) */
export const FAMILY_QUERY_STALE_TIME = 5 * 60 * 1000;

/** Dashboard refresh interval (10 minutes) */
export const FAMILY_DASHBOARD_REFRESH_INTERVAL = 10 * 60 * 1000;

/** URL search param key for selected child */
export const CHILD_SELECTOR_PARAM = 'childId';

/** Attendance alert threshold (percentage) */
export const ATTENDANCE_ALERT_THRESHOLD = 75;

/** Maximum children per family account */
export const MAX_CHILDREN_PER_FAMILY = 10;
