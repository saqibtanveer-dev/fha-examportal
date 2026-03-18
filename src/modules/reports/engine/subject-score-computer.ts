import type { AggregateMode } from '@prisma/client';
import type { GroupScore } from '../types/report-types';
import { roundTo2 } from './grading-utils';

// ============================================
// Internal Types (shared with consolidation-engine)
// ============================================

export type ExamGroupConfig = {
  id: string;
  name: string;
  weight: number;
  aggregateMode: AggregateMode;
  bestOfCount: number | null;
  examIds: Set<string>;
};

export type RawExamResult = {
  examId: string;
  studentId: string;
  obtainedMarks: number;
  totalMarks: number;
};

// ============================================
// Compute group scores for one subject per student
// ============================================

export function computeSubjectGroupScores(
  subjectId: string,
  studentId: string,
  groups: ExamGroupConfig[],
  byExam: Map<string, RawExamResult>,
  absentIndex: Set<string>,
  examSubjectMap: Map<string, string>,
  examTotalMarksMap?: Map<string, number>,
): { groupScores: GroupScore[]; obtainedWeighted: number; totalScaled: number } {
  const groupScores: GroupScore[] = [];
  let obtainedWeighted = 0;
  let totalScaled = 0;

  for (const group of groups) {
    const subjectExamIds = Array.from(group.examIds).filter(
      (eid) => examSubjectMap.get(eid) === subjectId,
    );

    if (subjectExamIds.length === 0) {
      groupScores.push({
        groupId: group.id,
        groupName: group.name,
        obtained: null,
        total: null,
        percentage: null,
        status: 'NO_EXAM',
      });
      continue;
    }

    const results = subjectExamIds
      .map((eid) => byExam.get(eid))
      .filter(Boolean) as RawExamResult[];

    const allAbsent = subjectExamIds.every(
      (eid) => absentIndex.has(`${studentId}:${eid}`),
    );
    const allPending = results.length === 0 && !allAbsent;

    if (allPending) {
      groupScores.push({
        groupId: group.id, groupName: group.name,
        obtained: null, total: null, percentage: null, status: 'PENDING',
      });
      continue;
    }

    if (allAbsent) {
      const maxTotals = subjectExamIds
        .map((eid) => examTotalMarksMap?.get(eid) ?? byExam.get(eid)?.totalMarks ?? 0)
        .reduce((s, v) => s + v, 0);
      groupScores.push({
        groupId: group.id, groupName: group.name,
        obtained: 0, total: maxTotals, percentage: 0, status: 'ABSENT',
      });
      // Count absent as 0 marks for overall percentage
      totalScaled += group.weight;
      continue;
    }

    const { obtained, total } = aggregateResults(results, group.aggregateMode, group.bestOfCount);
    const pct = total > 0 ? roundTo2((obtained / total) * 100) : 0;

    groupScores.push({
      groupId: group.id, groupName: group.name,
      obtained, total, percentage: pct, status: 'COMPUTED',
    });

    // Weighted contribution: scale to group weight
    if (total > 0) {
      obtainedWeighted += (obtained / total) * group.weight;
      totalScaled += group.weight;
    }
  }

  return { groupScores, obtainedWeighted, totalScaled };
}

// ============================================
// Aggregate multiple exam results within a group
// ============================================

function aggregateResults(
  results: RawExamResult[],
  mode: AggregateMode,
  bestOfCount: number | null,
): { obtained: number; total: number } {
  if (results.length === 0) return { obtained: 0, total: 0 };

  // results.length > 0 is guaranteed above; non-null assertions safe here
  switch (mode) {
    case 'SINGLE':
      return { obtained: results[0]!.obtainedMarks, total: results[0]!.totalMarks };

    case 'SUM':
      return {
        obtained: results.reduce((s, r) => s + r.obtainedMarks, 0),
        total: results.reduce((s, r) => s + r.totalMarks, 0),
      };

    case 'AVERAGE': {
      // Normalize each result to percentage, then average — handles different total marks
      const avgPct = results.reduce(
        (sum, r) => sum + (r.totalMarks > 0 ? (r.obtainedMarks / r.totalMarks) * 100 : 0),
        0,
      ) / results.length;
      return { obtained: roundTo2(avgPct), total: 100 };
    }

    case 'BEST_OF': {
      const n = bestOfCount ?? 1;
      // Sort by percentage descending, take best N, average their percentages
      const sorted = [...results]
        .map((r) => ({ ...r, pct: r.totalMarks > 0 ? (r.obtainedMarks / r.totalMarks) * 100 : 0 }))
        .sort((a, b) => b.pct - a.pct);
      const best = sorted.slice(0, n);
      const bestAvgPct = best.reduce((s, r) => s + r.pct, 0) / best.length;
      return { obtained: roundTo2(bestAvgPct), total: 100 };
    }
  }
}
