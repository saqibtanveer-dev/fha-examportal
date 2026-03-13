// Report system constants

// ============================================
// PRINT / PDF
// ============================================

/** Maximum students per printed page in gazette (landscape A4) */
export const GAZETTE_STUDENTS_PER_PAGE = 25;

/** DMC page size */
export const DMC_PAGE_SIZE = 'A4' as const;

/** Gazette page orientation */
export const GAZETTE_ORIENTATION = 'landscape' as const;

// ============================================
// CONSOLIDATION
// ============================================

/** Batch size for consolidation processing (students per batch) */
export const CONSOLIDATION_BATCH_SIZE = 50;

/** Maximum number of exam groups per result term */
export const MAX_EXAM_GROUPS = 10;

/** Weight precision (decimal places) */
export const WEIGHT_PRECISION = 2;

/** Total weight must equal this value */
export const REQUIRED_TOTAL_WEIGHT = 100;

// ============================================
// RESULT DISPLAY
// ============================================

/** Number of toppers to show in section summary */
export const TOPPERS_COUNT = 5;

/** Default passing percentage if not set in SchoolSettings */
export const DEFAULT_PASSING_PERCENTAGE = 33;

// ============================================
// GROUP SCORE STATUS LABELS
// ============================================

export const GROUP_SCORE_STATUS_LABELS: Record<string, string> = {
  COMPUTED: '',
  ABSENT: 'ABS',
  NO_EXAM: '-',
  PENDING: 'Awaiting',
  EXEMPT: 'EX',
};
