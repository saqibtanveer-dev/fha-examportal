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
  return prisma.$transaction(async (tx) => {
    const applicant = await tx.applicant.findUnique({
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
      totalMarks: Number(campaign.totalMarks),
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
    // Calculate section percentages
    for (const key of Object.keys(sectionScores)) {
      const s = sectionScores[key];
      if (!s) continue;
      s.marks = Math.max(0, s.marks);
      s.percentage = s.total > 0 ? Math.round((s.marks / s.total) * 10000) / 100 : 0;
    }

    const result = await tx.applicantResult.upsert({
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

    // Update applicant status to GRADED
    await tx.applicant.update({
      where: { id: applicantId },
      data: { status: 'GRADED' },
    });

    return result;
  }, { isolationLevel: 'Serializable' });
}

/**
 * Batch grade all completed sessions for a campaign.
 */
export async function batchGradeAdmissionCampaign(campaignId: string): Promise<{
  graded: number;
  failed: number;
}> {
  const sessions = await prisma.applicantTestSession.findMany({
    where: {
      campaignId,
      status: 'SUBMITTED',
      applicant: { status: 'TEST_COMPLETED' },
    },
    select: { id: true, applicantId: true },
  });

  let graded = 0;
  let failed = 0;

  // Process in batches of 10
  for (let i = 0; i < sessions.length; i += 10) {
    const batch = sessions.slice(i, i + 10);
    const results = await Promise.allSettled(
      batch.map(async (s) => {
        await autoGradeAdmissionMcqs(s.id);
        await calculateAdmissionResult(s.applicantId);
      }),
    );
    for (const r of results) {
      if (r.status === 'fulfilled') graded++;
      else failed++;
    }
  }

  return { graded, failed };
}

/**
 * Generate merit rankings for a campaign.
 * Assigns rank to all graded applicants.
 */
export async function generateMeritRankings(campaignId: string): Promise<number> {
  const results = await prisma.applicantResult.findMany({
    where: { campaignId },
    include: {
      applicant: {
        include: {
          testSession: { select: { timeSpent: true, submittedAt: true, isFlagged: true } },
        },
      },
    },
    orderBy: { percentage: 'desc' },
  });

  // Use the pure ranking function from grading-core
  const { rankMeritList } = await import('@/modules/grading/grading-core');

  const entries = results
    .filter((r) => r.applicant.testSession)
    .map((r) => ({
      applicantId: r.applicantId,
      percentage: Number(r.percentage),
      negativeMarks: 0, // Already accounted for in obtainedMarks
      timeSpent: r.applicant.testSession!.timeSpent ?? 0,
      submittedAt: r.applicant.testSession!.submittedAt ?? new Date(),
      isFlagged: r.applicant.testSession!.isFlagged,
    }));

  const ranked = rankMeritList(entries);

  // Update ranks in DB
  await prisma.$transaction(
    ranked.map((entry) =>
      prisma.applicantResult.update({
        where: { applicantId: entry.applicantId },
        data: { rank: entry.rank },
      }),
    ),
  );

  return ranked.length;
}
