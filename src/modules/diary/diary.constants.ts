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
    color: 'text-amber-700',
    bgColor: 'bg-amber-100',
    icon: '📝',
  },
  PUBLISHED: {
    label: 'Published',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-100',
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
  FULL: { label: 'Complete', color: 'bg-emerald-100 text-emerald-700', icon: '✅' },
  PARTIAL: { label: 'Partial', color: 'bg-amber-100 text-amber-700', icon: '🟡' },
  MISSING: { label: 'Missing', color: 'bg-red-100 text-red-700', icon: '❌' },
  NO_DATA: { label: 'N/A', color: 'bg-muted text-muted-foreground', icon: '--' },
} as const;

/** Subject badge colors for visual distinction */
export const SUBJECT_COLORS = [
  'bg-blue-100 text-blue-700 border-blue-200',
  'bg-purple-100 text-purple-700 border-purple-200',
  'bg-green-100 text-green-700 border-green-200',
  'bg-orange-100 text-orange-700 border-orange-200',
  'bg-pink-100 text-pink-700 border-pink-200',
  'bg-cyan-100 text-cyan-700 border-cyan-200',
  'bg-rose-100 text-rose-700 border-rose-200',
  'bg-indigo-100 text-indigo-700 border-indigo-200',
  'bg-teal-100 text-teal-700 border-teal-200',
  'bg-yellow-100 text-yellow-700 border-yellow-200',
] as const;

export function getSubjectColor(index: number): string {
  return SUBJECT_COLORS[index % SUBJECT_COLORS.length]!;
}
