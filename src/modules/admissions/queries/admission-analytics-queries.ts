/**
 * Admission analytics & reporting queries — merit lists, scholarships,
 * campaign stats, score distributions, question-level analytics, and
 * application-number generation.
 */

import { prisma } from '@/lib/prisma';

// ── Merit List ────────────────────────────────────────────────
export async function getMeritList(campaignId: string) {
  return prisma.applicantResult.findMany({
    where: { campaignId },
    include: {
      applicant: {
        select: {
          id: true,
          applicationNumber: true,
          firstName: true,
          lastName: true,
          email: true,
          status: true,
          testSession: { select: { timeSpent: true, isFlagged: true } },
          scholarship: { select: { tier: true, isAccepted: true } },
          decisions: {
            orderBy: { decidedAt: 'desc' },
            take: 1,
            select: { decision: true },
          },
        },
      },
    },
    orderBy: [{ rank: 'asc' }, { percentage: 'desc' }],
  });
}

// ── Scholarship Report ────────────────────────────────────────
export async function getScholarshipReport(campaignId: string) {
  const [tiers, scholarships] = await Promise.all([
    prisma.campaignScholarshipTier.findMany({
      where: { campaignId },
      orderBy: { sortOrder: 'asc' },
    }),
    prisma.applicantScholarship.findMany({
      where: { campaignId },
      include: {
        applicant: {
          select: { firstName: true, lastName: true, applicationNumber: true },
        },
      },
    }),
  ]);

  return tiers.map((tier) => {
    const assigned = scholarships.filter((s) => s.tierId === tier.id);
    return {
      ...tier,
      awarded: assigned.length,
      accepted: assigned.filter((s) => s.isAccepted === true).length,
      declined: assigned.filter((s) => s.isAccepted === false).length,
      pending: assigned.filter((s) => s.isAccepted === null).length,
      recipients: assigned,
    };
  });
}

// ── Campaign Stats ────────────────────────────────────────────
export async function getCampaignStats(campaignId: string) {
  const groups = await prisma.applicant.groupBy({
    by: ['status'],
    where: { campaignId },
    _count: true,
  });

  const statusCounts = Object.fromEntries(groups.map((g) => [g.status, g._count]));
  const totalApplicants = groups.reduce((sum, g) => sum + g._count, 0);

  return {
    totalApplicants,
    verified: statusCounts['VERIFIED'] ?? 0,
    testCompleted: statusCounts['TEST_COMPLETED'] ?? 0,
    graded: statusCounts['GRADED'] ?? 0,
    shortlisted: statusCounts['SHORTLISTED'] ?? 0,
    accepted: statusCounts['ACCEPTED'] ?? 0,
    rejected: statusCounts['REJECTED'] ?? 0,
    waitlisted: statusCounts['WAITLISTED'] ?? 0,
    enrolled: statusCounts['ENROLLED'] ?? 0,
  };
}

// ── Campaign Analytics (Extended) ─────────────────────────────
export async function getCampaignAnalytics(campaignId: string) {
  const stats = await getCampaignStats(campaignId);

  // Score distribution
  const results = await prisma.applicantResult.findMany({
    where: { applicant: { campaignId } },
    select: { percentage: true },
  });

  const scoreDistribution = buildScoreDistribution(results.map((r) => Number(r.percentage)));

  // Question-level analytics
  const campaignQuestions = await prisma.campaignQuestion.findMany({
    where: { campaignId },
    include: {
      question: {
        select: {
          id: true,
          title: true,
          type: true,
          marks: true,
          subject: { select: { name: true, code: true } },
        },
      },
    },
  });

  const questionAnalytics = await Promise.all(
    campaignQuestions.map(async (cq) => {
      const answers = await prisma.applicantAnswer.findMany({
        where: { campaignQuestionId: cq.id, session: { campaignId } },
        include: { grade: { select: { marksAwarded: true, maxMarks: true } } },
      });

      const totalAttempts = answers.length;
      const correctCount = answers.filter(
        (a) => a.grade && Number(a.grade.marksAwarded) >= Number(a.grade.maxMarks),
      ).length;
      const marksSum = answers.reduce(
        (sum, a) => sum + Number(a.grade?.marksAwarded ?? 0),
        0,
      );

      return {
        questionId: cq.questionId,
        title: cq.question.title.substring(0, 80),
        type: cq.question.type,
        subjectName: cq.question.subject.name,
        subjectCode: cq.question.subject.code,
        paperVersion: cq.paperVersion,
        sectionLabel: cq.sectionLabel,
        totalAttempts,
        correctCount,
        accuracy:
          totalAttempts > 0 ? Math.round((correctCount / totalAttempts) * 100) : 0,
        avgMarks:
          totalAttempts > 0 ? Number((marksSum / totalAttempts).toFixed(2)) : 0,
        maxMarks: Number(cq.question.marks),
      };
    }),
  );

  const subjectCoverageMap = new Map<string, {
    subjectName: string;
    subjectCode: string;
    questionCount: number;
    totalAttempts: number;
    accuracySum: number;
    totalMarks: number;
  }>();

  const versionCoverageMap = new Map<string, {
    paperVersion: string;
    questionCount: number;
    totalAttempts: number;
    accuracySum: number;
    totalMarks: number;
  }>();

  for (const qa of questionAnalytics) {
    const subjectKey = `${qa.subjectCode}:${qa.subjectName}`;
    const subjectRow = subjectCoverageMap.get(subjectKey) ?? {
      subjectName: qa.subjectName,
      subjectCode: qa.subjectCode,
      questionCount: 0,
      totalAttempts: 0,
      accuracySum: 0,
      totalMarks: 0,
    };
    subjectRow.questionCount += 1;
    subjectRow.totalAttempts += qa.totalAttempts;
    subjectRow.accuracySum += qa.accuracy;
    subjectRow.totalMarks += qa.maxMarks;
    subjectCoverageMap.set(subjectKey, subjectRow);

    const versionKey = qa.paperVersion ?? 'A';
    const versionRow = versionCoverageMap.get(versionKey) ?? {
      paperVersion: versionKey,
      questionCount: 0,
      totalAttempts: 0,
      accuracySum: 0,
      totalMarks: 0,
    };
    versionRow.questionCount += 1;
    versionRow.totalAttempts += qa.totalAttempts;
    versionRow.accuracySum += qa.accuracy;
    versionRow.totalMarks += qa.maxMarks;
    versionCoverageMap.set(versionKey, versionRow);
  }

  const subjectCoverage = [...subjectCoverageMap.values()]
    .map((row) => ({
      ...row,
      avgAccuracy: row.questionCount > 0 ? Math.round(row.accuracySum / row.questionCount) : 0,
    }))
    .sort((a, b) => b.questionCount - a.questionCount);

  const versionCoverage = [...versionCoverageMap.values()]
    .map((row) => ({
      ...row,
      avgAccuracy: row.questionCount > 0 ? Math.round(row.accuracySum / row.questionCount) : 0,
    }))
    .sort((a, b) => a.paperVersion.localeCompare(b.paperVersion));

  // Summary
  const percentages = results.map((r) => Number(r.percentage));
  const avg =
    percentages.length > 0
      ? percentages.reduce((a, b) => a + b, 0) / percentages.length
      : 0;

  return {
    funnel: stats,
    scoreDistribution,
    questionAnalytics,
    subjectCoverage,
    versionCoverage,
    summary: {
      totalGraded: results.length,
      avgPercentage: Number(avg.toFixed(1)),
      maxPercentage: percentages.length > 0 ? Number(Math.max(...percentages).toFixed(1)) : 0,
      minPercentage: percentages.length > 0 ? Number(Math.min(...percentages).toFixed(1)) : 0,
    },
  };
}

// ── Next Application Number ───────────────────────────────────
export async function getNextApplicationNumber(
  campaignId: string,
  prefix = 'ADM',
): Promise<string> {
  const year = new Date().getFullYear();
  const lastApplicant = await prisma.applicant.findFirst({
    where: { applicationNumber: { startsWith: `${prefix}-${year}` } },
    orderBy: { applicationNumber: 'desc' },
    select: { applicationNumber: true },
  });

  let nextSequence = 1;
  if (lastApplicant) {
    const parts = lastApplicant.applicationNumber.split('-');
    const lastSeq = parseInt(parts[parts.length - 1] ?? '0', 10);
    if (!isNaN(lastSeq)) nextSequence = lastSeq + 1;
  }

  return `${prefix}-${year}-${String(nextSequence).padStart(4, '0')}`;
}

// ── Helpers ───────────────────────────────────────────────────
function buildScoreDistribution(percentages: number[]) {
  const buckets: Record<string, number> = {
    '0-10': 0, '11-20': 0, '21-30': 0, '31-40': 0, '41-50': 0,
    '51-60': 0, '61-70': 0, '71-80': 0, '81-90': 0, '91-100': 0,
  };
  for (const pct of percentages) {
    if (pct <= 10) buckets['0-10']!++;
    else if (pct <= 20) buckets['11-20']!++;
    else if (pct <= 30) buckets['21-30']!++;
    else if (pct <= 40) buckets['31-40']!++;
    else if (pct <= 50) buckets['41-50']!++;
    else if (pct <= 60) buckets['51-60']!++;
    else if (pct <= 70) buckets['61-70']!++;
    else if (pct <= 80) buckets['71-80']!++;
    else if (pct <= 90) buckets['81-90']!++;
    else buckets['91-100']!++;
  }
  return Object.entries(buckets).map(([range, count]) => ({ range, count }));
}
