import { prisma } from '@/lib/prisma';
import type { GroupScore } from '../types/report-types';
import {
  computeGrade,
  parseGradingScale,
  isPassing,
  roundTo2,
  toNum,
} from './grading-utils';
import { DEFAULT_PASSING_PERCENTAGE, CONSOLIDATION_BATCH_SIZE } from './report-constants';
import { computeSubjectGroupScores, type ExamGroupConfig, type RawExamResult } from './subject-score-computer';
import { assignRanks } from './rank-computer';

type StudentSectionMap = Map<string, string>; // userId → sectionId

// ============================================
// Main Entry: Compute Consolidated Results
// ============================================

export async function computeConsolidatedResults(
  resultTermId: string,
  options: { sectionId?: string; recompute?: boolean },
): Promise<{ processed: number; skipped: number }> {
  const term = await prisma.resultTerm.findUnique({
    where: { id: resultTermId },
    include: {
      examGroups: {
        include: { examLinks: { select: { examId: true } } },
      },
    },
  });
  if (!term) throw new Error('Result term not found');

  const settings = await prisma.schoolSettings.findFirst({
    select: { gradingScale: true, passingPercentage: true },
  });
  const gradingScale = parseGradingScale(settings?.gradingScale);
  const passingPct = settings?.passingPercentage
    ? toNum(settings.passingPercentage)
    : DEFAULT_PASSING_PERCENTAGE;

  const groups: ExamGroupConfig[] = term.examGroups.map((g) => ({
    id: g.id,
    name: g.name,
    weight: toNum(g.weight),
    aggregateMode: g.aggregateMode,
    bestOfCount: g.bestOfCount,
    examIds: new Set(g.examLinks.map((l) => l.examId)),
  }));

  const allExamIds = groups.flatMap((g) => Array.from(g.examIds));
  if (allExamIds.length === 0) throw new Error('No exams linked to this result term');

  // Get all students in the class (optionally filtered by section)
  const studentProfiles = await prisma.studentProfile.findMany({
    where: {
      classId: term.classId,
      status: 'ACTIVE',
      ...(options.sectionId && { sectionId: options.sectionId }),
      user: { isActive: true },
    },
    select: { userId: true, sectionId: true },
  });

  const studentIds = studentProfiles.map((s) => s.userId);
  const sectionMap: StudentSectionMap = new Map(
    studentProfiles.map((s) => [s.userId, s.sectionId]),
  );

  // Load all ExamResults for all linked exams + students in one query
  const rawResults = await prisma.examResult.findMany({
    where: {
      examId: { in: allExamIds },
      studentId: { in: studentIds },
    },
    select: {
      examId: true,
      studentId: true,
      obtainedMarks: true,
      totalMarks: true,
    },
  });

  // Load absent sessions
  const absentSessions = await prisma.examSession.findMany({
    where: {
      examId: { in: allExamIds },
      studentId: { in: studentIds },
      status: 'ABSENT',
    },
    select: { examId: true, studentId: true },
  });

  // Index raw results: studentId → examId → result
  const resultIndex = new Map<string, Map<string, RawExamResult>>();
  for (const r of rawResults) {
    let byExam = resultIndex.get(r.studentId);
    if (!byExam) { byExam = new Map(); resultIndex.set(r.studentId, byExam); }
    byExam.set(r.examId, {
      examId: r.examId,
      studentId: r.studentId,
      obtainedMarks: toNum(r.obtainedMarks),
      totalMarks: toNum(r.totalMarks),
    });
  }

  const absentIndex = new Set<string>(
    absentSessions.map((a) => `${a.studentId}:${a.examId}`),
  );

  // Get subject → examId mapping for all linked exams
  const exams = await prisma.exam.findMany({
    where: { id: { in: allExamIds } },
    select: { id: true, subjectId: true },
  });
  const examSubjectMap = new Map<string, string>(exams.map((e) => [e.id, e.subjectId]));

  // Load elective subject info for this class
  const allSubjectIds = [...new Set(exams.map((e) => e.subjectId))];
  const subjectClassLinks = await prisma.subjectClassLink.findMany({
    where: { classId: term.classId, subjectId: { in: allSubjectIds }, isActive: true },
    select: { subjectId: true, isElective: true },
  });
  const electiveSubjectIds = new Set(
    subjectClassLinks.filter((l) => l.isElective).map((l) => l.subjectId),
  );

  // Load elective enrollments for all students (only if there are electives)
  // Key: "studentProfileUserId:subjectId"
  const enrolledElectives = new Set<string>();
  if (electiveSubjectIds.size > 0) {
    const enrollments = await prisma.studentSubjectEnrollment.findMany({
      where: {
        studentProfile: { userId: { in: studentIds } },
        subjectId: { in: [...electiveSubjectIds] },
        academicSessionId: term.academicSessionId,
        isActive: true,
      },
      select: { studentProfile: { select: { userId: true } }, subjectId: true },
    });
    for (const e of enrollments) {
      enrolledElectives.add(`${e.studentProfile.userId}:${e.subjectId}`);
    }
  }

  // Process in batches
  let processed = 0;
  let skipped = 0;

  for (let i = 0; i < studentIds.length; i += CONSOLIDATION_BATCH_SIZE) {
    const batch = studentIds.slice(i, i + CONSOLIDATION_BATCH_SIZE);
    await processBatch(batch, {
      resultTermId,
      groups,
      sectionMap,
      resultIndex,
      absentIndex,
      examSubjectMap,
      gradingScale,
      passingPct,
      recompute: options.recompute ?? false,
      electiveSubjectIds,
      enrolledElectives,
    });
    processed += batch.length;
  }

  // Compute ranks after all results are stored
  await assignRanks(resultTermId);

  return { processed, skipped };
}

// ============================================
// Process one batch of students
// ============================================

async function processBatch(
  studentIds: string[],
  ctx: {
    resultTermId: string;
    groups: ExamGroupConfig[];
    sectionMap: StudentSectionMap;
    resultIndex: Map<string, Map<string, RawExamResult>>;
    absentIndex: Set<string>;
    examSubjectMap: Map<string, string>;
    gradingScale: ReturnType<typeof parseGradingScale>;
    passingPct: number;
    recompute: boolean;
    electiveSubjectIds: Set<string>;
    enrolledElectives: Set<string>;
  },
) {
  // Build per-student per-subject per-group result
  for (const studentId of studentIds) {
    const byExam = ctx.resultIndex.get(studentId) ?? new Map<string, RawExamResult>();
    const sectionId = ctx.sectionMap.get(studentId);
    if (!sectionId) continue;

    // Collect unique subjects across all groups
    const subjectIds = new Set<string>();
    for (const group of ctx.groups) {
      for (const examId of group.examIds) {
        const subjId = ctx.examSubjectMap.get(examId);
        if (subjId) subjectIds.add(subjId);
      }
    }

    // Filter out elective subjects the student is NOT enrolled in
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

    // All writes for one student in a single transaction (atomicity guarantee)
    const grandTotal = subjectResults.reduce((s, r) => s + r.totalMarks, 0);
    const grandObtained = subjectResults.reduce((s, r) => s + r.obtainedMarks, 0);
    const overallPct = grandTotal > 0 ? roundTo2((grandObtained / grandTotal) * 100) : 0;
    const overallGrade = computeGrade(overallPct, ctx.gradingScale);
    // Hybrid pass/fail: overall percentage must pass AND individual fails are flagged on DMC
    const overallPassed = isPassing(overallPct, ctx.passingPct);
    const passedCount = subjectResults.filter((r) => r.isPassed).length;
    const failedCount = subjectResults.filter((r) => !r.isPassed).length;

    await prisma.$transaction(async (tx) => {
      for (const sr of subjectResults) {
        const data = {
          groupScores: sr.groupScores as object[],
          totalMarks: sr.totalMarks, obtainedMarks: sr.obtainedMarks,
          percentage: sr.percentage, grade: sr.grade, isPassed: sr.isPassed, isStale: false,
        };
        await tx.consolidatedResult.upsert({
          where: { resultTermId_studentId_subjectId: { resultTermId: ctx.resultTermId, studentId, subjectId: sr.subjectId } },
          create: { resultTermId: ctx.resultTermId, studentId, subjectId: sr.subjectId, ...data },
          update: { ...data, computedAt: new Date() },
        });
      }

      const summaryData = {
        sectionId, totalSubjects: subjectResults.length,
        passedSubjects: passedCount, failedSubjects: failedCount,
        grandTotalMarks: grandTotal, grandObtainedMarks: grandObtained,
        overallPercentage: overallPct, overallGrade, isOverallPassed: overallPassed, isStale: false,
      };
      await tx.consolidatedStudentSummary.upsert({
        where: { resultTermId_studentId: { resultTermId: ctx.resultTermId, studentId } },
        create: { resultTermId: ctx.resultTermId, studentId, ...summaryData },
        update: { ...summaryData, computedAt: new Date() },
      });
    });
  }
}
