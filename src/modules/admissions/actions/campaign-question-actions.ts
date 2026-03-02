/**
 * Campaign question management and scholarship tier configuration.
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
import {
  addQuestionsToCampaignSchema,
  removeQuestionsFromCampaignSchema,
  campaignScholarshipTiersSchema,
  type AddQuestionsToCampaignInput,
} from '../admission-schemas';

export const addQuestionsToCampaignAction = safeAction(async function addQuestionsToCampaignAction(
  input: AddQuestionsToCampaignInput,
): Promise<ActionResult> {
  const session = await requireRole('ADMIN');
  const parsed = addQuestionsToCampaignSchema.safeParse(input);
  if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? 'Validation failed');

  const campaign = await prisma.testCampaign.findUnique({ where: { id: parsed.data.campaignId } });
  if (!campaign) return actionError(ADMISSION_ERRORS.CAMPAIGN_NOT_FOUND);
  if (campaign.status !== 'DRAFT') return actionError(ADMISSION_ERRORS.CAMPAIGN_NOT_DRAFT);

  await prisma.campaignQuestion.createMany({
    data: parsed.data.questions.map((q) => ({
      campaignId: parsed.data.campaignId,
      questionId: q.questionId,
      sortOrder: q.sortOrder,
      marks: q.marks,
      isRequired: q.isRequired,
      sectionLabel: q.sectionLabel,
    })),
    skipDuplicates: true,
  });

  // Recalculate total marks
  const agg = await prisma.campaignQuestion.aggregate({
    where: { campaignId: parsed.data.campaignId },
    _sum: { marks: true },
  });
  await prisma.testCampaign.update({
    where: { id: parsed.data.campaignId },
    data: { totalMarks: agg._sum.marks ?? 0 },
  });

  createAuditLog(session.user.id, 'ADD_CAMPAIGN_QUESTIONS', 'TEST_CAMPAIGN', parsed.data.campaignId).catch(() => {});
  revalidatePath('/admin/admissions');
  return actionSuccess();
});

export const removeQuestionsFromCampaignAction = safeAction(async function removeQuestionsFromCampaignAction(
  input: { campaignId: string; questionIds: string[] },
): Promise<ActionResult> {
  const session = await requireRole('ADMIN');
  const parsed = removeQuestionsFromCampaignSchema.safeParse(input);
  if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? 'Validation failed');

  const campaign = await prisma.testCampaign.findUnique({ where: { id: parsed.data.campaignId } });
  if (!campaign) return actionError(ADMISSION_ERRORS.CAMPAIGN_NOT_FOUND);
  if (campaign.status !== 'DRAFT') return actionError(ADMISSION_ERRORS.CAMPAIGN_NOT_DRAFT);

  await prisma.campaignQuestion.deleteMany({
    where: {
      campaignId: parsed.data.campaignId,
      questionId: { in: parsed.data.questionIds },
    },
  });

  // Recalculate total marks
  const agg = await prisma.campaignQuestion.aggregate({
    where: { campaignId: parsed.data.campaignId },
    _sum: { marks: true },
  });
  await prisma.testCampaign.update({
    where: { id: parsed.data.campaignId },
    data: { totalMarks: agg._sum.marks ?? 0 },
  });

  createAuditLog(session.user.id, 'REMOVE_CAMPAIGN_QUESTIONS', 'TEST_CAMPAIGN', parsed.data.campaignId).catch(() => {});
  revalidatePath('/admin/admissions');
  return actionSuccess();
});

export const configureScholarshipTiersAction = safeAction(async function configureScholarshipTiersAction(
  input: { campaignId: string; tiers: Array<{
    tier: string; name: string; description?: string; minPercentage: number;
    maxPercentage?: number; maxRecipients: number; benefitDetails?: string;
    isActive?: boolean; sortOrder: number;
  }> },
): Promise<ActionResult> {
  const session = await requireRole('ADMIN');
  const parsed = campaignScholarshipTiersSchema.safeParse(input);
  if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? 'Validation failed');

  const campaign = await prisma.testCampaign.findUnique({ where: { id: parsed.data.campaignId } });
  if (!campaign) return actionError(ADMISSION_ERRORS.CAMPAIGN_NOT_FOUND);

  // Delete existing tiers and recreate
  await prisma.$transaction([
    prisma.campaignScholarshipTier.deleteMany({ where: { campaignId: parsed.data.campaignId } }),
    ...parsed.data.tiers.map((tier) =>
      prisma.campaignScholarshipTier.create({
        data: {
          campaignId: parsed.data.campaignId,
          tier: tier.tier as 'FULL_100' | 'SEVENTY_FIVE' | 'HALF_50' | 'QUARTER_25' | 'NONE',
          name: tier.name,
          description: tier.description,
          minPercentage: tier.minPercentage,
          maxPercentage: tier.maxPercentage,
          maxRecipients: tier.maxRecipients,
          benefitDetails: tier.benefitDetails,
          isActive: tier.isActive ?? true,
          sortOrder: tier.sortOrder,
        },
      }),
    ),
  ]);

  await prisma.testCampaign.update({
    where: { id: parsed.data.campaignId },
    data: { hasScholarship: parsed.data.tiers.length > 0 },
  });

  createAuditLog(session.user.id, 'CONFIGURE_SCHOLARSHIP_TIERS', 'TEST_CAMPAIGN', parsed.data.campaignId).catch(() => {});
  revalidatePath('/admin/admissions');
  return actionSuccess();
});
