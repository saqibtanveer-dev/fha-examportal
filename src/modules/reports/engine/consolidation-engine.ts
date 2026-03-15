import { prisma } from '@/lib/prisma';
import type { GroupScore } from '../types/report-types';
import {
  computeGrade,
  parseGradingScale,
  toNum,
} from './grading-utils';
import { DEFAULT_PASSING_PERCENTAGE, CONSOLIDATION_BATCH_SIZE } from './report-constants';
import { computeSubjectGroupScores, type ExamGroupConfig, type RawExamResult } from './subject-score-computer';
import { assignRanks } from './rank-computer';
import { processConsolidationBatch } from './consolidation-batch-processor';

type StudentSectionMap = Map<string, string>; // userId → sectionId

// ============================================
// Main Entry: Compute Consolidated Results
// ============================================

export async function computeConsolidatedResults(
  resultTermId: string,
  options: {
    sectionId?: string;
    recompute?: boolean;
    startOffset?: number;
    onCheckpoint?: (payload: {
      processed: number;
      skipped: number;
      nextOffset: number;
      totalStudents: number;
      batchSize: number;
    }) => Promise<void> | void;
  },
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
    orderBy: { userId: 'asc' },
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

  // Pre-compute common subject set (same for all students, filtered per-student for electives)
  const commonSubjectIds = new Set<string>();
  for (const group of groups) {
    for (const examId of group.examIds) {
      const subjId = examSubjectMap.get(examId);
      if (subjId) commonSubjectIds.add(subjId);
    }
  }

  // Process in batches
  let processed = 0;
  let skipped = 0;
  const startOffset = Math.max(0, Math.min(options.startOffset ?? 0, studentIds.length));

  for (let i = startOffset; i < studentIds.length; i += CONSOLIDATION_BATCH_SIZE) {
    const batch = studentIds.slice(i, i + CONSOLIDATION_BATCH_SIZE);
    const result = await processConsolidationBatch(batch, {
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
      commonSubjectIds,
    });
    processed += result.processed;
    skipped += result.skipped;

    if (options.onCheckpoint) {
      const nextOffset = Math.min(i + CONSOLIDATION_BATCH_SIZE, studentIds.length);
      try {
        await options.onCheckpoint({
          processed,
          skipped,
          nextOffset,
          totalStudents: studentIds.length,
          batchSize: CONSOLIDATION_BATCH_SIZE,
        });
      } catch (checkpointError) {
        console.warn('[consolidation] Checkpoint write failed:', checkpointError);
      }
    }
  }

  // Compute ranks after all results are stored
  await assignRanks(resultTermId);

  return { processed, skipped };
}
