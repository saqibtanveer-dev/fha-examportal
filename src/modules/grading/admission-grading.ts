/**
 * Admission Grading Adapter — uses grading-core pure functions
 * with Prisma persistence for admission test sessions.
 */

import { prisma } from '@/lib/prisma';
import {
  batchGradeMcqs,
  calculateScore,
  calculateTotalWithNegative,
  type McqGradeInput,
  type NegativeMarkingConfig,
} from '@/modules/grading/grading-core';

/**
 * Auto-grade all MCQ answers for an admission test session.
 * Supports negative marking based on campaign configuration.
 */
export async function autoGradeAdmissionMcqs(sessionId: string): Promise<number> {
  const session = await prisma.applicantTestSession.findUnique({
    where: { id: sessionId },
    include: {
      applicant: {
        include: {
          campaign: { select: { negativeMarking: true, negativeMarkValue: true } },
        },
      },
      applicantAnswers: {
        include: {
          campaignQuestion: {
            include: { question: { include: { mcqOptions: true } } },
          },
          grade: true,
        },
      },
    },
  });

  if (!session) return 0;

  const campaign = session.applicant.campaign;
  const negativeConfig: NegativeMarkingConfig = {
    enabled: campaign.negativeMarking,
    valuePerWrong: campaign.negativeMarkValue ? Number(campaign.negativeMarkValue) : 0,
  };

  // Filter MCQ answers not yet graded
  const mcqAnswers = session.applicantAnswers.filter(
    (a) => a.campaignQuestion.question.type === 'MCQ' && !a.grade,
  );

  if (mcqAnswers.length === 0) {
    return session.applicantAnswers
      .filter((a) => a.campaignQuestion.question.type === 'MCQ' && a.grade)
      .reduce((sum, a) => sum + Number(a.grade!.marksAwarded) - Number(a.grade!.negativeMarks), 0);
  }

  // Map to pure inputs
  const inputs: McqGradeInput[] = mcqAnswers.map((answer) => {
    const q = answer.campaignQuestion.question;
    return {
      answerId: answer.id,
      selectedOptionId: answer.selectedOptionId,
      correctOptionIds: new Set(q.mcqOptions.filter((o) => o.isCorrect).map((o) => o.id)),
      maxMarks: Number(answer.campaignQuestion.marks),
      correctLabels: q.mcqOptions.filter((o) => o.isCorrect).map((o) => o.text).join(', '),
    };
  });

  // Grade using pure core
  const results = batchGradeMcqs(inputs, negativeConfig);

  // Persist grades in transaction
  let totalMarks = 0;
  await prisma.$transaction(async (tx) => {
    for (const result of results) {
      await tx.applicantAnswerGrade.upsert({
        where: { applicantAnswerId: result.answerId },
        create: {
          applicantAnswerId: result.answerId,
          gradedBy: 'SYSTEM',
          marksAwarded: result.marksAwarded,
          maxMarks: result.maxMarks,
          feedback: result.feedback,
          isNegativeMarked: result.isNegativeMarked,
          negativeMarks: result.negativeMarks,
        },
        update: {
          marksAwarded: result.marksAwarded,
          feedback: result.feedback,
          isNegativeMarked: result.isNegativeMarked,
          negativeMarks: result.negativeMarks,
        },
      });
      totalMarks += result.marksAwarded - result.negativeMarks;
    }
  });

  // Include existing graded MCQ marks
  totalMarks += session.applicantAnswers
    .filter((a) => a.campaignQuestion.question.type === 'MCQ' && a.grade)
    .reduce((sum, a) => sum + Number(a.grade!.marksAwarded) - Number(a.grade!.negativeMarks), 0);

  return Math.max(0, totalMarks);
}

/**
 * Check if all answers in an admission test session are graded.
 */
export async function isAdmissionSessionFullyGraded(sessionId: string): Promise<boolean> {
  const totalAnswers = await prisma.applicantAnswer.count({ where: { sessionId } });
  const gradedAnswers = await prisma.applicantAnswerGrade.count({
    where: { applicantAnswer: { sessionId } },
  });
  return totalAnswers > 0 && totalAnswers === gradedAnswers;
}

/**
 * Calculate and save admission test result.
 */
export async function calculateAdmissionResult(applicantId: string) {
  // Fetch data OUTSIDE the transaction to minimize time inside it.
  // Neon serverless Postgres has high per-query latency; keeping the
  // transaction short avoids P2028 timeout errors.
  const applicant = await prisma.applicant.findUnique({
    where: { id: applicantId },
    include: {
      campaign: true,
      testSession: {
        include: {
          applicantAnswers: {
            include: {
              grade: true,
              campaignQuestion: { select: { sectionLabel: true, marks: true } },
            },
          },
        },
      },
    },
  });

  if (!applicant?.testSession) return null;

  const session = applicant.testSession;
  const campaign = applicant.campaign;

  // Compute version-specific totalMarks (not campaign-wide which sums ALL versions)
  const versionTotalAgg = await prisma.campaignQuestion.aggregate({
    where: { campaignId: campaign.id, paperVersion: applicant.paperVersion },
    _sum: { marks: true },
  });
  const versionTotalMarks = Number(versionTotalAgg._sum.marks ?? campaign.totalMarks);

  // Calculate total obtained marks
  const obtainedMarks = session.applicantAnswers.reduce(
    (sum, a) => {
      if (!a.grade) return sum;
      return sum + Number(a.grade.marksAwarded) - Number(a.grade.negativeMarks);
    },
    0,
  );

  const clampedMarks = Math.max(0, obtainedMarks);

  const score = calculateScore({
    totalMarks: versionTotalMarks,
    obtainedMarks: clampedMarks,
    passingMarks: Number(campaign.passingMarks),
  });

  // Calculate section scores
  const sectionScores: Record<string, { marks: number; total: number; percentage: number }> = {};
  for (const answer of session.applicantAnswers) {
    const label = answer.campaignQuestion.sectionLabel ?? 'General';
    if (!sectionScores[label]) {
      sectionScores[label] = { marks: 0, total: 0, percentage: 0 };
    }
    sectionScores[label].total += Number(answer.campaignQuestion.marks);
    if (answer.grade) {
      sectionScores[label].marks += Number(answer.grade.marksAwarded) - Number(answer.grade.negativeMarks);
    }
  }
  for (const key of Object.keys(sectionScores)) {
    const s = sectionScores[key];
    if (!s) continue;
    s.marks = Math.max(0, s.marks);
    s.percentage = s.total > 0 ? Math.round((s.marks / s.total) * 10000) / 100 : 0;
  }

  // Only the two writes go inside the transaction — keeps it fast
  const result = await prisma.$transaction(async (tx) => {
    const r = await tx.applicantResult.upsert({
      where: { applicantId },
      create: {
        applicantId,
        campaignId: campaign.id,
        totalMarks: score.totalMarks,
        obtainedMarks: score.obtainedMarks,
        percentage: score.percentage,
        grade: score.grade,
        isPassed: score.isPassed,
        sectionScores,
        computedAt: new Date(),
      },
      update: {
        totalMarks: score.totalMarks,
        obtainedMarks: score.obtainedMarks,
        percentage: score.percentage,
        grade: score.grade,
        isPassed: score.isPassed,
        sectionScores,
        computedAt: new Date(),
      },
    });

    await tx.applicant.update({
      where: { id: applicantId },
      data: { status: 'GRADED' },
    });

    return r;
  }, { timeout: 15_000 });

  return result;
}

// Re-export batch operations from split file
export { batchGradeAdmissionCampaign, generateMeritRankings } from './admission-grading-batch';
