// ============================================
// Diary Module — Constants
// ============================================

import type { DiaryStatus } from '@prisma/client';

export const DIARY_STATUS_CONFIG: Record<
  DiaryStatus,
  { label: string; color: string; bgColor: string; icon: string }
> = {
  DRAFT: {
    label: 'Draft',
    color: 'text-amber-700 dark:text-amber-300',
    bgColor: 'bg-amber-100 dark:bg-amber-900/40',
    icon: '📝',
  },
  PUBLISHED: {
    label: 'Published',
    color: 'text-emerald-700 dark:text-emerald-300',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/40',
    icon: '✅',
  },
};

export const DIARY_STATUSES: DiaryStatus[] = ['DRAFT', 'PUBLISHED'];

export const DEFAULT_DIARY_STATUS: DiaryStatus = 'PUBLISHED';

/** Max characters for diary content */
export const DIARY_CONTENT_MAX_LENGTH = 10_000;

/** Max characters for diary title */
export const DIARY_TITLE_MAX_LENGTH = 255;

/** Max characters for principal note */
export const PRINCIPAL_NOTE_MAX_LENGTH = 2_000;

/** Coverage cell states */
export const COVERAGE_CELL = {
  FULL: { label: 'Complete', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300', icon: '✅' },
  PARTIAL: { label: 'Partial', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300', icon: '🟡' },
  MISSING: { label: 'Missing', color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300', icon: '❌' },
  NO_DATA: { label: 'N/A', color: 'bg-muted text-muted-foreground', icon: '--' },
} as const;

/** Subject badge colors for visual distinction */
export const SUBJECT_COLORS = [
  'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800',
  'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/40 dark:text-purple-300 dark:border-purple-800',
  'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/40 dark:text-green-300 dark:border-green-800',
  'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/40 dark:text-orange-300 dark:border-orange-800',
  'bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-900/40 dark:text-pink-300 dark:border-pink-800',
  'bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-900/40 dark:text-cyan-300 dark:border-cyan-800',
  'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/40 dark:text-rose-300 dark:border-rose-800',
  'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-300 dark:border-indigo-800',
  'bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-900/40 dark:text-teal-300 dark:border-teal-800',
  'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/40 dark:text-yellow-300 dark:border-yellow-800',
] as const;

export function getSubjectColor(index: number): string {
  return SUBJECT_COLORS[index % SUBJECT_COLORS.length]!;
}
