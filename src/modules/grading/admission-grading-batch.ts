/**
 * Admission Grading — Batch operations and merit ranking.
 * Separated from core grading for file size compliance.
 */

import { prisma } from '@/lib/prisma';
import { autoGradeAdmissionMcqs, calculateAdmissionResult } from './admission-grading';

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

  const { rankMeritList } = await import('@/modules/grading/grading-core');

  const entries = results
    .filter((r) => r.applicant.testSession)
    .map((r) => ({
      applicantId: r.applicantId,
      percentage: Number(r.percentage),
      negativeMarks: 0,
      timeSpent: r.applicant.testSession!.timeSpent ?? 0,
      submittedAt: r.applicant.testSession!.submittedAt ?? new Date(),
      isFlagged: r.applicant.testSession!.isFlagged,
    }));

  const ranked = rankMeritList(entries);

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
