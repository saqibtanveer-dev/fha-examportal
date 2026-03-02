/**
 * Public portal test actions — start session, submit answers, submit test,
 * proctoring events, heartbeat.
 */

'use server';

import { prisma } from '@/lib/prisma';
import { safeAction } from '@/lib/safe-action';
import type { ActionResult } from '@/types/action-result';
import { actionError, actionSuccess } from '@/types/action-result';
import { ADMISSION_ERRORS } from '../admission-types';
import {
  startTestSessionSchema,
  submitAnswerSchema,
  submitTestSchema,
  type StartTestSessionInput,
  type SubmitAnswerInput,
  type SubmitTestInput,
} from '../admission-schemas';
import { sanitizeString } from '@/lib/admission-utils';
import { getApplicantByToken } from '../admission-queries';
import { sendEmail } from '@/lib/email';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { testSubmittedEmail, ADMISSION_EMAIL_SUBJECTS } from '@/lib/email-templates';
import {
  ADMISSION_MAX_TAB_SWITCHES,
  ADMISSION_MAX_FULLSCREEN_EXITS,
  ADMISSION_SUBMIT_GRACE_PERIOD_MS,
} from '@/lib/constants';
import { serialize } from '@/utils/serialize';
import { getSchoolBranding } from '../actions/shared';
import { shuffleArray } from '@/utils/array';
import {
  autoGradeAdmissionMcqs,
  calculateAdmissionResult,
  generateMeritRankings,
} from '@/modules/grading/admission-grading';
import { headers } from 'next/headers';

export const startTestSessionAction = safeAction(async function startTestSessionAction(
  input: StartTestSessionInput,
): Promise<ActionResult<{ sessionId: string; questions: unknown[]; endsAt: string | null }>> {
  const parsed = startTestSessionSchema.safeParse(input);
  if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? 'Validation failed');

  // Rate limit by PIN to prevent brute-force on a specific PIN
  const rl = checkRateLimit(`admission:start:${parsed.data.token}`, RATE_LIMITS.ADMISSION_START_TEST);
  if (!rl.allowed) return actionError('Too many attempts. Please try again later.');

  // Also rate limit by IP to prevent PIN enumeration
  const headersList = await headers();
  const ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  const ipRl = checkRateLimit(`admission:start:ip:${ip}`, { maxAttempts: 20, windowMs: 60_000 });
  if (!ipRl.allowed) return actionError('Too many attempts. Please try again later.');

  // PIN is stored directly — no hashing needed
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

  // Resume support
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

  if (campaign.shuffleQuestions) {
    questions = shuffleArray(questions);
  }

  return actionSuccess({
    sessionId: testSession.id,
    questions: serialize(questions) as unknown[],
    endsAt: endsAt?.toISOString() ?? null,
  });
});

export const submitAnswerAction = safeAction(async function submitAnswerAction(
  input: SubmitAnswerInput,
): Promise<ActionResult> {
  const parsed = submitAnswerSchema.safeParse(input);
  if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? 'Validation failed');

  const testSession = await prisma.applicantTestSession.findUnique({
    where: { id: parsed.data.sessionId },
    select: {
      id: true,
      status: true,
      startedAt: true,
      applicant: {
        select: { campaign: { select: { testDuration: true } } },
      },
    },
  });
  if (!testSession) return actionError('Test session not found');
  if (testSession.status !== 'IN_PROGRESS') return actionError('Test session is not active');

  const now = new Date();
  if (testSession.startedAt && testSession.applicant.campaign.testDuration) {
    const endsAtMs = testSession.startedAt.getTime() + testSession.applicant.campaign.testDuration * 60_000;
    if (now.getTime() > endsAtMs + ADMISSION_SUBMIT_GRACE_PERIOD_MS) {
      return actionError(ADMISSION_ERRORS.TIME_EXPIRED);
    }
  }

  await prisma.applicantAnswer.upsert({
    where: {
      sessionId_campaignQuestionId: {
        sessionId: parsed.data.sessionId,
        campaignQuestionId: parsed.data.campaignQuestionId,
      },
    },
    create: {
      sessionId: parsed.data.sessionId,
      campaignQuestionId: parsed.data.campaignQuestionId,
      selectedOptionId: parsed.data.selectedOptionId,
      answerText: parsed.data.answerText ? sanitizeString(parsed.data.answerText, 5000) : null,
      answeredAt: now,
      timeSpent: parsed.data.timeSpent,
      isMarkedForReview: parsed.data.isMarkedForReview ?? false,
    },
    update: {
      selectedOptionId: parsed.data.selectedOptionId,
      answerText: parsed.data.answerText ? sanitizeString(parsed.data.answerText, 5000) : null,
      answeredAt: now,
      timeSpent: parsed.data.timeSpent,
      isMarkedForReview: parsed.data.isMarkedForReview,
    },
  });

  return actionSuccess();
});

export const submitTestAction = safeAction(async function submitTestAction(
  input: SubmitTestInput & { tabSwitchCount?: number; fullscreenExitCount?: number },
): Promise<ActionResult<{ applicationNumber: string }>> {
  const parsed = submitTestSchema.safeParse(input);
  if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? 'Validation failed');

  const testSession = await prisma.applicantTestSession.findUnique({
    where: { id: parsed.data.sessionId },
    include: {
      applicant: {
        select: {
          id: true,
          email: true,
          firstName: true,
          applicationNumber: true,
          campaignId: true,
          campaign: { select: { name: true } },
        },
      },
    },
  });
  if (!testSession) return actionError('Test session not found');
  if (testSession.status === 'SUBMITTED') return actionError(ADMISSION_ERRORS.TEST_ALREADY_SUBMITTED);

  const now = new Date();
  const timeSpentMs = testSession.startedAt ? now.getTime() - testSession.startedAt.getTime() : 0;

  const tabSwitches = input.tabSwitchCount ?? testSession.tabSwitchCount;
  const fullscreenExits = input.fullscreenExitCount ?? testSession.fullscreenExits;

  await prisma.$transaction([
    prisma.applicantTestSession.update({
      where: { id: testSession.id },
      data: {
        status: 'SUBMITTED',
        submittedAt: now,
        timeSpent: Math.floor(timeSpentMs / 1000),
        tabSwitchCount: tabSwitches,
        fullscreenExits: fullscreenExits,
        isFlagged:
          tabSwitches > ADMISSION_MAX_TAB_SWITCHES ||
          fullscreenExits > ADMISSION_MAX_FULLSCREEN_EXITS,
      },
    }),
    prisma.applicant.update({
      where: { id: testSession.applicant.id },
      data: { status: 'TEST_COMPLETED' },
    }),
  ]);

  const branding = await getSchoolBranding();
  sendEmail({
    to: testSession.applicant.email,
    subject: ADMISSION_EMAIL_SUBJECTS['test-submitted'](testSession.applicant.campaign.name),
    html: testSubmittedEmail({
      firstName: testSession.applicant.firstName,
      campaignName: testSession.applicant.campaign.name,
      applicationNumber: testSession.applicant.applicationNumber,
      branding,
    }),
  }).catch(() => {});

  // ── Auto-grade MCQs immediately on submit ──────────────────
  try {
    await autoGradeAdmissionMcqs(testSession.id);
    await calculateAdmissionResult(testSession.applicant.id);
    await generateMeritRankings(testSession.applicant.campaignId);
  } catch {
    // Grading errors are non-fatal — admin can trigger manually if needed
  }

  return actionSuccess({ applicationNumber: testSession.applicant.applicationNumber });
});

export const recordProctoringEventAction = safeAction(async function recordProctoringEventAction(
  input: { sessionId: string; accessToken: string; eventType: 'TAB_SWITCH' | 'FULLSCREEN_EXIT' },
): Promise<ActionResult> {
  const testSession = await prisma.applicantTestSession.findUnique({
    where: { id: input.sessionId },
    select: {
      id: true,
      status: true,
      tabSwitchCount: true,
      fullscreenExits: true,
      applicant: { select: { accessToken: true } },
    },
  });
  if (!testSession) return actionError('Session not found');
  if (testSession.status !== 'IN_PROGRESS') return actionError('Session not active');

  // Direct PIN comparison (PINs stored as plain text)
  if (input.accessToken !== testSession.applicant.accessToken) {
    return actionError(ADMISSION_ERRORS.INVALID_TOKEN);
  }

  const update: Record<string, unknown> = {};
  if (input.eventType === 'TAB_SWITCH') {
    const newCount = testSession.tabSwitchCount + 1;
    update.tabSwitchCount = newCount;
    if (newCount > ADMISSION_MAX_TAB_SWITCHES) update.isFlagged = true;
  } else {
    const newCount = testSession.fullscreenExits + 1;
    update.fullscreenExits = newCount;
    if (newCount > ADMISSION_MAX_FULLSCREEN_EXITS) update.isFlagged = true;
  }

  await prisma.applicantTestSession.update({
    where: { id: input.sessionId },
    data: update,
  });

  return actionSuccess();
});

export const heartbeatAction = safeAction(async function heartbeatAction(
  input: { sessionId: string; accessToken: string },
): Promise<ActionResult<{ endsAt: string | null; remainingSeconds: number | null }>> {
  const testSession = await prisma.applicantTestSession.findUnique({
    where: { id: input.sessionId },
    select: {
      id: true,
      status: true,
      startedAt: true,
      applicant: {
        select: {
          accessToken: true,
          campaign: { select: { testDuration: true } },
        },
      },
    },
  });
  if (!testSession) return actionError('Session not found');

  // Direct PIN comparison (PINs stored as plain text)
  if (input.accessToken !== testSession.applicant.accessToken) {
    return actionError(ADMISSION_ERRORS.INVALID_TOKEN);
  }

  if (testSession.status !== 'IN_PROGRESS') {
    return actionSuccess({ endsAt: null, remainingSeconds: 0 });
  }

  const durationMs = testSession.applicant.campaign.testDuration * 60_000;
  const endsAt = testSession.startedAt
    ? new Date(testSession.startedAt.getTime() + durationMs)
    : null;

  const remaining = endsAt
    ? Math.max(0, Math.floor((endsAt.getTime() - Date.now()) / 1000))
    : null;

  return actionSuccess({
    endsAt: endsAt?.toISOString() ?? null,
    remainingSeconds: remaining,
  });
});
