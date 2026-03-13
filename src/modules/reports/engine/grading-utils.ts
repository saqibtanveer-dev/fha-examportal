// Grading utility functions
// Shared across consolidation engine, DMC generation, and all report views

import type { GradeEntry } from '../types/report-types';

// ============================================
// GRADE COMPUTATION
// ============================================

/**
 * Compute letter grade from percentage using the school's grading scale.
 * Grading scale is stored as JSON in SchoolSettings.gradingScale.
 */
export function computeGrade(
  percentage: number,
  gradingScale: GradeEntry[],
): string {
  // Sort descending by minPercentage for correct matching
  const sorted = [...gradingScale].sort(
    (a, b) => b.minPercentage - a.minPercentage,
  );

  for (const entry of sorted) {
    if (percentage >= entry.minPercentage && percentage <= entry.maxPercentage) {
      return entry.grade;
    }
  }

  return 'F'; // fallback
}

/**
 * Parse the gradingScale JSON from SchoolSettings into typed array.
 * Handles both array format and legacy formats gracefully.
 */
export function parseGradingScale(gradingScaleJson: unknown): GradeEntry[] {
  if (!gradingScaleJson || !Array.isArray(gradingScaleJson)) {
    return getDefaultGradingScale();
  }

  const scale = gradingScaleJson as Record<string, unknown>[];
  const parsed: GradeEntry[] = [];

  for (const entry of scale) {
    if (
      typeof entry.grade === 'string' &&
      typeof entry.minPercentage === 'number' &&
      typeof entry.maxPercentage === 'number'
    ) {
      parsed.push({
        grade: entry.grade,
        minPercentage: entry.minPercentage,
        maxPercentage: entry.maxPercentage,
      });
    }
  }

  return parsed.length > 0 ? parsed : getDefaultGradingScale();
}

/**
 * Default grading scale for Pakistani schools.
 * Used as fallback if SchoolSettings.gradingScale is invalid.
 */
export function getDefaultGradingScale(): GradeEntry[] {
  return [
    { grade: 'A+', minPercentage: 90, maxPercentage: 100 },
    { grade: 'A', minPercentage: 80, maxPercentage: 89.99 },
    { grade: 'A-', minPercentage: 75, maxPercentage: 79.99 },
    { grade: 'B+', minPercentage: 70, maxPercentage: 74.99 },
    { grade: 'B', minPercentage: 65, maxPercentage: 69.99 },
    { grade: 'B-', minPercentage: 60, maxPercentage: 64.99 },
    { grade: 'C+', minPercentage: 55, maxPercentage: 59.99 },
    { grade: 'C', minPercentage: 50, maxPercentage: 54.99 },
    { grade: 'D', minPercentage: 40, maxPercentage: 49.99 },
    { grade: 'F', minPercentage: 0, maxPercentage: 39.99 },
  ];
}

// ============================================
// PASS/FAIL DETERMINATION
// ============================================

/**
 * Determine if a student passed based on percentage and passing threshold.
 */
export function isPassing(
  percentage: number,
  passingPercentage: number,
): boolean {
  return percentage >= passingPercentage;
}

// ============================================
// RANKING UTILITIES
// ============================================

/**
 * Standard competition ranking (1224 method).
 * Students with the same percentage get the same rank.
 * The next rank skips accordingly (e.g., two 1st → next is 3rd).
 */
export function computeRanks<T extends { percentage: number }>(
  items: T[],
): (T & { rank: number })[] {
  const sorted = [...items].sort((a, b) => b.percentage - a.percentage);
  const ranked: (T & { rank: number })[] = [];
  let currentRank = 1;

  for (let i = 0; i < sorted.length; i++) {
    const item = sorted[i]!;
    const prev = sorted[i - 1];
    if (i > 0 && prev && item.percentage === prev.percentage) {
      // Same percentage = same rank as previous
      ranked.push({ ...item, rank: currentRank });
    } else {
      currentRank = i + 1;
      ranked.push({ ...item, rank: currentRank });
    }
  }

  return ranked;
}

// ============================================
// FORMATTING UTILITIES
// ============================================

/**
 * Format a decimal number to 2 decimal places.
 */
export function roundTo2(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Safely convert Prisma Decimal to number.
 */
export function toNum(value: unknown): number {
  if (value === null || value === undefined) return 0;
  return Number(value);
}

/**
 * Format percentage for display (e.g., "85.70%").
 */
export function formatPct(value: number): string {
  return `${value.toFixed(2)}%`;
}
