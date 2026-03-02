/**
 * Campaign lifecycle transitions — DRAFT → REGISTRATION_OPEN → ... → ARCHIVED.
 * Includes grading trigger and result publishing.
 */

'use server';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-utils';
import { createAuditLog } from '@/modules/audit/audit-queries';
import { revalidatePath } from 'next/cache';
import { safeAction } from '@/lib/safe-action';
import type { ActionResult } from '@/types/action-result';
import { actionError, actionSuccess } from '@/types/action-result';
import { ADMISSION_ERRORS } from '../admission-types';


export const openRegistrationAction = safeAction(async function openRegistrationAction(
  campaignId: string,
): Promise<ActionResult> {
  const session = await requireRole('ADMIN');
  const campaign = await prisma.testCampaign.findUnique({ where: { id: campaignId } });
  if (!campaign) return actionError(ADMISSION_ERRORS.CAMPAIGN_NOT_FOUND);
  if (campaign.status !== 'DRAFT') return actionError('Campaign must be in DRAFT status');

  await prisma.testCampaign.update({
    where: { id: campaignId },
    data: { status: 'REGISTRATION_OPEN' },
  });

  createAuditLog(session.user.id, 'OPEN_REGISTRATION', 'TEST_CAMPAIGN', campaignId).catch(() => {});
  revalidatePath('/admin/admissions');
  return actionSuccess();
});

export const closeRegistrationAction = safeAction(async function closeRegistrationAction(
  campaignId: string,
): Promise<ActionResult> {
  const session = await requireRole('ADMIN');
  const campaign = await prisma.testCampaign.findUnique({ where: { id: campaignId } });
  if (!campaign) return actionError(ADMISSION_ERRORS.CAMPAIGN_NOT_FOUND);
  if (campaign.status !== 'REGISTRATION_OPEN') return actionError('Campaign must be in REGISTRATION_OPEN status');

  await prisma.testCampaign.update({
    where: { id: campaignId },
    data: { status: 'REGISTRATION_CLOSED' },
  });

  createAuditLog(session.user.id, 'CLOSE_REGISTRATION', 'TEST_CAMPAIGN', campaignId).catch(() => {});
  revalidatePath('/admin/admissions');
  return actionSuccess();
});

export const activateTestAction = safeAction(async function activateTestAction(
  campaignId: string,
): Promise<ActionResult> {
  const session = await requireRole('ADMIN');
  const campaign = await prisma.testCampaign.findUnique({
    where: { id: campaignId },
    include: { _count: { select: { campaignQuestions: true, applicants: true } } },
  });
  if (!campaign) return actionError(ADMISSION_ERRORS.CAMPAIGN_NOT_FOUND);

  // Allow activation from DRAFT (admin adds candidates, skips registration),
  // REGISTRATION_OPEN, or REGISTRATION_CLOSED for flexibility
  const allowed = ['DRAFT', 'REGISTRATION_OPEN', 'REGISTRATION_CLOSED'];
  if (!allowed.includes(campaign.status)) {
    return actionError('Campaign must be in DRAFT, REGISTRATION_OPEN or REGISTRATION_CLOSED status');
  }
  if (campaign._count.campaignQuestions === 0) return actionError(ADMISSION_ERRORS.CAMPAIGN_NO_QUESTIONS);
  if (campaign._count.applicants === 0) return actionError('Campaign must have at least one candidate');

  await prisma.testCampaign.update({
    where: { id: campaignId },
    data: { status: 'TEST_ACTIVE' },
  });

  createAuditLog(session.user.id, 'ACTIVATE_TEST', 'TEST_CAMPAIGN', campaignId).catch(() => {});
  revalidatePath('/admin/admissions');
  return actionSuccess();
});

export const closeTestAction = safeAction(async function closeTestAction(
  campaignId: string,
): Promise<ActionResult> {
  const session = await requireRole('ADMIN');
  const campaign = await prisma.testCampaign.findUnique({ where: { id: campaignId } });
  if (!campaign) return actionError(ADMISSION_ERRORS.CAMPAIGN_NOT_FOUND);
  if (campaign.status !== 'TEST_ACTIVE') return actionError('Campaign must be in TEST_ACTIVE status');

  // Auto-submit any in-progress sessions
  await prisma.applicantTestSession.updateMany({
    where: { campaignId, status: 'IN_PROGRESS' },
    data: { status: 'SUBMITTED', submittedAt: new Date() },
  });
  await prisma.applicant.updateMany({
    where: { campaignId, status: 'TEST_IN_PROGRESS' },
    data: { status: 'TEST_COMPLETED' },
  });

  await prisma.testCampaign.update({
    where: { id: campaignId },
    data: { status: 'TEST_CLOSED' },
  });

  createAuditLog(session.user.id, 'CLOSE_TEST', 'TEST_CAMPAIGN', campaignId).catch(() => {});
  revalidatePath('/admin/admissions');
  return actionSuccess();
});

export const triggerGradingAction = safeAction(async function triggerGradingAction(
  campaignId: string,
): Promise<ActionResult<{ graded: number; failed: number }>> {
  const session = await requireRole('ADMIN');
  const campaign = await prisma.testCampaign.findUnique({ where: { id: campaignId } });
  if (!campaign) return actionError(ADMISSION_ERRORS.CAMPAIGN_NOT_FOUND);
  if (!['TEST_CLOSED', 'GRADING'].includes(campaign.status)) {
    return actionError('Campaign must be in TEST_CLOSED or GRADING status');
  }

  await prisma.testCampaign.update({
    where: { id: campaignId },
    data: { status: 'GRADING' },
  });

  const { batchGradeAdmissionCampaign, generateMeritRankings } = await import('@/modules/grading/admission-grading');
  const result = await batchGradeAdmissionCampaign(campaignId);
  await generateMeritRankings(campaignId);

  await prisma.testCampaign.update({
    where: { id: campaignId },
    data: { status: 'RESULTS_READY' },
  });

  createAuditLog(session.user.id, 'TRIGGER_GRADING', 'TEST_CAMPAIGN', campaignId, result).catch(() => {});
  revalidatePath('/admin/admissions');
  return actionSuccess(result);
});

export const publishResultsAction = safeAction(async function publishResultsAction(
  campaignId: string,
): Promise<ActionResult> {
  const session = await requireRole('ADMIN');
  const campaign = await prisma.testCampaign.findUnique({ where: { id: campaignId } });
  if (!campaign) return actionError(ADMISSION_ERRORS.CAMPAIGN_NOT_FOUND);
  if (campaign.status !== 'RESULTS_READY') return actionError('Results must be ready before publishing');

  const now = new Date();
  await prisma.$transaction([
    prisma.testCampaign.update({
      where: { id: campaignId },
      data: { status: 'RESULTS_PUBLISHED' },
    }),
    prisma.applicantResult.updateMany({
      where: { campaignId, publishedAt: null },
      data: { publishedAt: now },
    }),
  ]);

  createAuditLog(session.user.id, 'PUBLISH_RESULTS', 'TEST_CAMPAIGN', campaignId).catch(() => {});
  revalidatePath('/admin/admissions');
  return actionSuccess();
});

export const completeCampaignAction = safeAction(async function completeCampaignAction(
  campaignId: string,
): Promise<ActionResult> {
  const session = await requireRole('ADMIN');
  const campaign = await prisma.testCampaign.findUnique({ where: { id: campaignId } });
  if (!campaign) return actionError(ADMISSION_ERRORS.CAMPAIGN_NOT_FOUND);
  if (campaign.status !== 'RESULTS_PUBLISHED') return actionError('Campaign must have results published');

  await prisma.testCampaign.update({
    where: { id: campaignId },
    data: { status: 'COMPLETED' },
  });

  createAuditLog(session.user.id, 'COMPLETE_CAMPAIGN', 'TEST_CAMPAIGN', campaignId).catch(() => {});
  revalidatePath('/admin/admissions');
  return actionSuccess();
});

export const archiveCampaignAction = safeAction(async function archiveCampaignAction(
  campaignId: string,
): Promise<ActionResult> {
  const session = await requireRole('ADMIN');
  const campaign = await prisma.testCampaign.findUnique({ where: { id: campaignId } });
  if (!campaign) return actionError(ADMISSION_ERRORS.CAMPAIGN_NOT_FOUND);
  if (campaign.status !== 'COMPLETED') return actionError('Campaign must be completed before archiving');

  await prisma.testCampaign.update({
    where: { id: campaignId },
    data: { status: 'ARCHIVED' },
  });

  createAuditLog(session.user.id, 'ARCHIVE_CAMPAIGN', 'TEST_CAMPAIGN', campaignId).catch(() => {});
  revalidatePath('/admin/admissions');
  return actionSuccess();
});
