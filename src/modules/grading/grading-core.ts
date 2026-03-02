/**
 * Shared grading core — pure functions for MCQ grading, scoring calculations,
 * and grade derivation. Used by both internal exam grading and admission test grading.
 * 
 * NO database access — pure logic only.
 */

import { DEFAULT_GRADING_SCALE } from '@/lib/constants';

// ============================================
// Types
// ============================================

export type McqGradeInput = {
  answerId: string;
  selectedOptionId: string | null;
  correctOptionIds: Set<string>;
  maxMarks: number;
  /** Human-readable list of correct options for feedback */
  correctLabels: string;
};

export type McqGradeResult = {
  answerId: string;
  isCorrect: boolean;
  marksAwarded: number;
  maxMarks: number;
  feedback: string;
};

export type NegativeMarkingConfig = {
  enabled: boolean;
  valuePerWrong: number; // e.g., 0.25 per wrong MCQ
};

export type McqGradeWithNegativeResult = McqGradeResult & {
  isNegativeMarked: boolean;
  negativeMarks: number;
};

export type ScoreInput = {
  totalMarks: number;
  obtainedMarks: number;
  passingMarks: number;
};

export type ScoreResult = {
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  isPassed: boolean;
  grade: string;
};

// ============================================
// MCQ Grading — Pure
// ============================================

/**
 * Grade a single MCQ answer (no DB). Pure function.
 */
export function gradeMcq(input: McqGradeInput): McqGradeResult {
  const isCorrect =
    input.selectedOptionId != null && input.correctOptionIds.has(input.selectedOptionId);
  const marks = isCorrect ? input.maxMarks : 0;

  return {
    answerId: input.answerId,
    isCorrect,
    marksAwarded: marks,
    maxMarks: input.maxMarks,
    feedback: isCorrect
      ? 'Correct'
      : `Incorrect. Correct: ${input.correctLabels || 'N/A'}`,
  };
}

/**
 * Grade a single MCQ with negative marking support.
 */
export function gradeMcqWithNegativeMarking(
  input: McqGradeInput,
  config: NegativeMarkingConfig,
): McqGradeWithNegativeResult {
  const base = gradeMcq(input);

  // No negative marks for correct or unanswered
  if (base.isCorrect || input.selectedOptionId == null || !config.enabled) {
    return { ...base, isNegativeMarked: false, negativeMarks: 0 };
  }

  // Wrong answer with negative marking
  return {
    ...base,
    marksAwarded: 0,
    isNegativeMarked: true,
    negativeMarks: config.valuePerWrong,
  };
}

/**
 * Batch-grade multiple MCQ answers.
 */
export function batchGradeMcqs(
  inputs: McqGradeInput[],
  negativeMarking?: NegativeMarkingConfig,
): McqGradeWithNegativeResult[] {
  return inputs.map((input) =>
    negativeMarking
      ? gradeMcqWithNegativeMarking(input, negativeMarking)
      : { ...gradeMcq(input), isNegativeMarked: false, negativeMarks: 0 },
  );
}

// ============================================
// Score Calculation — Pure
// ============================================

/**
 * Calculate score from obtained marks. Pure function.
 */
export function calculateScore(input: ScoreInput): ScoreResult {
  const percentage = input.totalMarks > 0 ? (input.obtainedMarks / input.totalMarks) * 100 : 0;
  const isPassed = input.obtainedMarks >= input.passingMarks;
  const grade = deriveGrade(percentage);

  return {
    totalMarks: input.totalMarks,
    obtainedMarks: input.obtainedMarks,
    percentage: Math.round(percentage * 100) / 100, // 2 decimal places
    isPassed,
    grade,
  };
}

/**
 * Calculate total marks from graded answers, accounting for negative marks.
 * Total is clamped at 0 (cannot go below zero).
 */
export function calculateTotalWithNegative(
  grades: McqGradeWithNegativeResult[],
  subjectiveMarks = 0,
): number {
  const mcqMarks = grades.reduce((sum, g) => sum + g.marksAwarded, 0);
  const negativeTotal = grades.reduce((sum, g) => sum + g.negativeMarks, 0);
  return Math.max(0, mcqMarks - negativeTotal + subjectiveMarks);
}

// ============================================
// Grade Derivation — Pure
// ============================================

/**
 * Derive letter grade from percentage using grading scale.
 */
export function deriveGrade(percentage: number): string {
  const entry = DEFAULT_GRADING_SCALE.find(
    (g) => percentage >= g.minPercentage && percentage <= g.maxPercentage,
  );
  return entry?.grade ?? 'F';
}

// ============================================
// Merit Ranking — Pure
// ============================================

export type MeritEntry = {
  applicantId: string;
  percentage: number;
  negativeMarks: number;
  timeSpent: number; // seconds
  submittedAt: Date;
  isFlagged: boolean;
};

export type RankedMeritEntry = MeritEntry & {
  rank: number;
};

/**
 * Sort and rank applicants for merit list.
 * Primary: percentage DESC
 * Tiebreaker 1: fewer negative marks ASC
 * Tiebreaker 2: less time ASC
 * Tiebreaker 3: earlier submission ASC
 * Tied scores get same rank.
 */
export function rankMeritList(entries: MeritEntry[]): RankedMeritEntry[] {
  // Filter out flagged sessions
  const eligible = entries.filter((e) => !e.isFlagged);

  const sorted = [...eligible].sort((a, b) => {
    if (b.percentage !== a.percentage) return b.percentage - a.percentage;
    if (a.negativeMarks !== b.negativeMarks) return a.negativeMarks - b.negativeMarks;
    if (a.timeSpent !== b.timeSpent) return a.timeSpent - b.timeSpent;
    return a.submittedAt.getTime() - b.submittedAt.getTime();
  });

  const ranked: RankedMeritEntry[] = [];
  let currentRank = 1;

  for (let i = 0; i < sorted.length; i++) {
    const curr = sorted[i]!;
    if (i > 0) {
      const prev = sorted[i - 1]!;
      // Same percentage = same rank (tied)
      if (curr.percentage !== prev.percentage) {
        currentRank = i + 1;
      }
    }
    ranked.push({ ...curr, rank: currentRank });
  }

  return ranked;
}

// ============================================
// Scholarship Tier Assignment — Pure
// ============================================

export type TierConfig = {
  id: string;
  tier: string;
  minPercentage: number;
  maxRecipients: number;
  sortOrder: number;
};

export type ScholarshipAssignment = {
  applicantId: string;
  tierId: string;
  tier: string;
  percentageAwarded: number;
};

/**
 * Auto-assign scholarships using cascading waterfall.
 * Sort applicants by percentage DESC, try highest tier first, cascade down.
 */
export function assignScholarshipTiers(
  applicants: { id: string; percentage: number; isPassed: boolean; isFlagged: boolean }[],
  tiers: TierConfig[],
): ScholarshipAssignment[] {
  // Sort tiers by sortOrder (highest tier first)
  const sortedTiers = [...tiers].sort((a, b) => a.sortOrder - b.sortOrder);
  // Sort applicants by percentage DESC
  const sortedApplicants = [...applicants]
    .filter((a) => a.isPassed && !a.isFlagged)
    .sort((a, b) => b.percentage - a.percentage);

  const tierCounts = new Map<string, number>();
  sortedTiers.forEach((t) => tierCounts.set(t.id, 0));

  const assignments: ScholarshipAssignment[] = [];

  for (const applicant of sortedApplicants) {
    for (const tier of sortedTiers) {
      const count = tierCounts.get(tier.id) ?? 0;
      if (applicant.percentage >= tier.minPercentage && count < tier.maxRecipients) {
        assignments.push({
          applicantId: applicant.id,
          tierId: tier.id,
          tier: tier.tier,
          percentageAwarded: tier.minPercentage, // denormalized
        });
        tierCounts.set(tier.id, count + 1);
        break;
      }
    }
  }

  return assignments;
}
