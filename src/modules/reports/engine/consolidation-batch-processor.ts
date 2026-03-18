import { prisma } from '@/lib/prisma';
import type { GroupScore } from '../types/report-types';
import {
  computeGrade,
  parseGradingScale,
  isPassing,
  roundTo2,
} from './grading-utils';
import { computeSubjectGroupScores, type ExamGroupConfig, type RawExamResult } from './subject-score-computer';

type StudentSectionMap = Map<string, string>;

export type ConsolidationBatchContext = {
  resultTermId: string;
  groups: ExamGroupConfig[];
  sectionMap: StudentSectionMap;
  resultIndex: Map<string, Map<string, RawExamResult>>;
  absentIndex: Set<string>;
  examSubjectMap: Map<string, string>;
  examTotalMarksMap: Map<string, number>;
  gradingScale: ReturnType<typeof parseGradingScale>;
  passingPct: number;
  recompute: boolean;
  electiveSubjectIds: Set<string>;
  enrolledElectives: Set<string>;
  commonSubjectIds: Set<string>;
};

export async function processConsolidationBatch(
  studentIds: string[],
  ctx: ConsolidationBatchContext,
): Promise<{ processed: number; skipped: number }> {
  let processed = 0;
  let skipped = 0;

  const existingSummaryStudentIds = new Set<string>();
  if (!ctx.recompute) {
    const existingSummaries = await prisma.consolidatedStudentSummary.findMany({
      where: {
        resultTermId: ctx.resultTermId,
        studentId: { in: studentIds },
      },
      select: { studentId: true },
    });

    for (const summary of existingSummaries) {
      existingSummaryStudentIds.add(summary.studentId);
    }
  }

  for (const studentId of studentIds) {
    try {
      if (!ctx.recompute && existingSummaryStudentIds.has(studentId)) {
        skipped++;
        continue;
      }

      const byExam = ctx.resultIndex.get(studentId) ?? new Map<string, RawExamResult>();
      const sectionId = ctx.sectionMap.get(studentId);
      if (!sectionId) {
        skipped++;
        continue;
      }

      const subjectIds = new Set(ctx.commonSubjectIds);
      for (const subjId of subjectIds) {
        if (
          ctx.electiveSubjectIds.has(subjId) &&
          !ctx.enrolledElectives.has(`${studentId}:${subjId}`)
        ) {
          subjectIds.delete(subjId);
        }
      }

      const subjectResults: {
        subjectId: string;
        groupScores: GroupScore[];
        totalMarks: number;
        obtainedMarks: number;
        percentage: number;
        isPassed: boolean;
        grade: string | null;
      }[] = [];

      for (const subjectId of subjectIds) {
        const { groupScores, obtainedWeighted, totalScaled } = computeSubjectGroupScores(
          subjectId,
          studentId,
          ctx.groups,
          byExam,
          ctx.absentIndex,
          ctx.examSubjectMap,
          ctx.examTotalMarksMap,
        );

        const percentage = totalScaled > 0 ? roundTo2((obtainedWeighted / totalScaled) * 100) : 0;
        const grade = computeGrade(percentage, ctx.gradingScale);
        const passed = isPassing(percentage, ctx.passingPct);

        subjectResults.push({
          subjectId,
          groupScores,
          totalMarks: roundTo2(totalScaled),
          obtainedMarks: roundTo2(obtainedWeighted),
          percentage,
          isPassed: passed,
          grade,
        });
      }

      const grandTotal = subjectResults.reduce((s, r) => s + r.totalMarks, 0);
      const grandObtained = subjectResults.reduce((s, r) => s + r.obtainedMarks, 0);
      const overallPct = grandTotal > 0 ? roundTo2((grandObtained / grandTotal) * 100) : 0;
      const overallGrade = computeGrade(overallPct, ctx.gradingScale);
      const overallPassed = isPassing(overallPct, ctx.passingPct);
      const passedCount = subjectResults.filter((r) => r.isPassed).length;
      const failedCount = subjectResults.filter((r) => !r.isPassed).length;

      await prisma.$transaction(async (tx) => {
        for (const sr of subjectResults) {
          const data = {
            groupScores: sr.groupScores as object[],
            totalMarks: sr.totalMarks,
            obtainedMarks: sr.obtainedMarks,
            percentage: sr.percentage,
            grade: sr.grade,
            isPassed: sr.isPassed,
            isStale: false,
          };

          await tx.consolidatedResult.upsert({
            where: {
              resultTermId_studentId_subjectId: {
                resultTermId: ctx.resultTermId,
                studentId,
                subjectId: sr.subjectId,
              },
            },
            create: { resultTermId: ctx.resultTermId, studentId, subjectId: sr.subjectId, ...data },
            update: { ...data, computedAt: new Date() },
          });
        }

        const summaryData = {
          sectionId,
          totalSubjects: subjectResults.length,
          passedSubjects: passedCount,
          failedSubjects: failedCount,
          grandTotalMarks: grandTotal,
          grandObtainedMarks: grandObtained,
          overallPercentage: overallPct,
          overallGrade,
          isOverallPassed: overallPassed,
          isStale: false,
        };

        await tx.consolidatedStudentSummary.upsert({
          where: { resultTermId_studentId: { resultTermId: ctx.resultTermId, studentId } },
          create: { resultTermId: ctx.resultTermId, studentId, ...summaryData },
          update: { ...summaryData, computedAt: new Date() },
        });
      });

      processed++;
    } catch (err) {
      console.error(`[consolidation] Failed for student ${studentId}:`, err);
      skipped++;
    }
  }

  return { processed, skipped };
}
