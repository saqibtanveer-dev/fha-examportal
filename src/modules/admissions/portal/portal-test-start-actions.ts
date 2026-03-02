/**
 * Start test session action — initialize or resume a test session for an applicant.
 */

'use server';

import { prisma } from '@/lib/prisma';
import { safeAction } from '@/lib/safe-action';
import type { ActionResult } from '@/types/action-result';
import { actionError, actionSuccess } from '@/types/action-result';
import { ADMISSION_ERRORS } from '../admission-types';
import { startTestSessionSchema, type StartTestSessionInput } from '../admission-schemas';
import { getApplicantByToken } from '../admission-queries';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { serialize } from '@/utils/serialize';
import { shuffleArray } from '@/utils/array';
import { headers } from 'next/headers';

export const startTestSessionAction = safeAction(async function startTestSessionAction(
  input: StartTestSessionInput,
): Promise<ActionResult<{ sessionId: string; questions: unknown[]; endsAt: string | null }>> {
  const parsed = startTestSessionSchema.safeParse(input);
  if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? 'Validation failed');

  const rl = checkRateLimit(`admission:start:${parsed.data.token}`, RATE_LIMITS.ADMISSION_START_TEST);
  if (!rl.allowed) return actionError('Too many attempts. Please try again later.');

  const headersList = await headers();
  const ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  const ipRl = checkRateLimit(`admission:start:ip:${ip}`, { maxAttempts: 20, windowMs: 60_000 });
  if (!ipRl.allowed) return actionError('Too many attempts. Please try again later.');

  const applicant = await getApplicantByToken(parsed.data.token);
  if (!applicant) return actionError(ADMISSION_ERRORS.INVALID_TOKEN);

  const campaign = await prisma.testCampaign.findUnique({
    where: { id: applicant.campaignId },
    include: {
      campaignQuestions: {
        include: {
          question: {
            include: {
              mcqOptions: {
                select: { id: true, label: true, text: true, sortOrder: true },
                orderBy: { sortOrder: 'asc' },
              },
            },
          },
        },
        orderBy: { sortOrder: 'asc' },
      },
    },
  });
  if (!campaign) return actionError(ADMISSION_ERRORS.CAMPAIGN_NOT_FOUND);
  if (campaign.status !== 'TEST_ACTIVE') return actionError(ADMISSION_ERRORS.TEST_NOT_ACTIVE);

  const now = new Date();
  if (campaign.testStartAt && now < campaign.testStartAt) return actionError(ADMISSION_ERRORS.TEST_NOT_ACTIVE);
  if (campaign.testEndAt && now > campaign.testEndAt) return actionError(ADMISSION_ERRORS.TEST_WINDOW_CLOSED);

  if (!['VERIFIED', 'TEST_IN_PROGRESS'].includes(applicant.status)) {
    return actionError(ADMISSION_ERRORS.CANNOT_START_TEST);
  }

  let testSession = await prisma.applicantTestSession.findUnique({
    where: { applicantId: applicant.id },
  });

  const testDurationMs = campaign.testDuration * 60_000;

  if (testSession) {
    if (testSession.status === 'SUBMITTED') return actionError(ADMISSION_ERRORS.TEST_ALREADY_SUBMITTED);
    if (testSession.status === 'TIMED_OUT') return actionError(ADMISSION_ERRORS.TEST_TIME_EXPIRED);
  } else {
    testSession = await prisma.applicantTestSession.create({
      data: {
        applicantId: applicant.id,
        campaignId: campaign.id,
        status: 'IN_PROGRESS',
        startedAt: now,
      },
    });
    await prisma.applicant.update({
      where: { id: applicant.id },
      data: { status: 'TEST_IN_PROGRESS' },
    });
  }

  const endsAt = testSession.startedAt
    ? new Date(testSession.startedAt.getTime() + testDurationMs)
    : null;

  const existingAnswers = await prisma.applicantAnswer.findMany({
    where: { sessionId: testSession.id },
    select: { campaignQuestionId: true, selectedOptionId: true, answerText: true },
  });

  let questions = campaign.campaignQuestions.map((cq) => ({
    campaignQuestionId: cq.id,
    questionId: cq.questionId,
    title: cq.question.title,
    description: cq.question.description,
    type: cq.question.type,
    marks: cq.marks,
    sectionLabel: cq.sectionLabel,
    sortOrder: cq.sortOrder,
    isRequired: cq.isRequired,
    options: cq.question.mcqOptions.map((o) => ({
      id: o.id,
      label: o.label,
      text: o.text,
      sortOrder: o.sortOrder,
    })),
    existingAnswer: existingAnswers.find((a) => a.campaignQuestionId === cq.id) ?? null,
  }));

  // Shuffle options per-question if campaign flag is set
  if (campaign.shuffleOptions) {
    for (const q of questions) {
      q.options = shuffleArray(q.options);
    }
  }

  if (campaign.shuffleQuestions) {
    questions = shuffleArray(questions);
  }

  return actionSuccess({
    sessionId: testSession.id,
    questions: serialize(questions) as unknown[],
    endsAt: endsAt?.toISOString() ?? null,
  });
});
