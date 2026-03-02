/**
 * Portal test actions — submit answers, submit test, proctoring events, heartbeat.
 */

'use server';

import { prisma } from '@/lib/prisma';
import { safeAction } from '@/lib/safe-action';
import type { ActionResult } from '@/types/action-result';
import { actionError, actionSuccess } from '@/types/action-result';
import { ADMISSION_ERRORS } from '../admission-types';
import {
  submitAnswerSchema,
  submitTestSchema,
  type SubmitAnswerInput,
  type SubmitTestInput,
} from '../admission-schemas';
import { logger } from '@/lib/logger';
import { sanitizeString } from '@/lib/admission-utils';
import {
  ADMISSION_MAX_TAB_SWITCHES,
  ADMISSION_MAX_FULLSCREEN_EXITS,
  ADMISSION_SUBMIT_GRACE_PERIOD_MS,
} from '@/lib/constants';
import {
  autoGradeAdmissionMcqs,
  calculateAdmissionResult,
  generateMeritRankings,
} from '@/modules/grading/admission-grading';

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
          firstName: true,
          applicationNumber: true,
          campaignId: true,
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

  // Auto-grade MCQs immediately on submit
  try {
    await autoGradeAdmissionMcqs(testSession.id);
    await calculateAdmissionResult(testSession.applicant.id);
    await generateMeritRankings(testSession.applicant.campaignId);
  } catch (err) {
    logger.error(
      { err, sessionId: testSession.id, applicantId: testSession.applicant.id },
      '[Admission Grading] Auto-grade failed — admin must trigger manually',
    );
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
