/**
 * Campaign question management — per-campaign MCQ creation, CSV import,
 * remove, and scholarship tier configuration.
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
import { sanitizeString } from '@/lib/admission-utils';
import {
  removeQuestionsFromCampaignSchema,
  createCampaignQuestionSchema,
  csvImportQuestionsSchema,
  campaignScholarshipTiersSchema,
  type CreateCampaignQuestionInput,
  type CsvImportQuestionsInput,
} from '../admission-schemas';

const OPTION_LABELS = ['A', 'B', 'C', 'D'] as const;

/** Find or create a "General" subject for admission-specific questions. */
async function getOrCreateGeneralSubject(): Promise<string> {
  const existing = await prisma.subject.findFirst({ where: { code: 'GENERAL' } });
  if (existing) return existing.id;

  // Ensure a "General" department exists for admission-specific subjects
  let dept = await prisma.department.findFirst({ where: { name: 'General' } });
  if (!dept) {
    dept = await prisma.department.create({
      data: { name: 'General', description: 'Admission & general purpose' },
    });
  }

  const created = await prisma.subject.create({
    data: { name: 'General', code: 'GENERAL', departmentId: dept.id },
  });
  return created.id;
}

/** Recalculate and sync campaign totalMarks from its questions. */
async function syncCampaignTotalMarks(campaignId: string) {
  const agg = await prisma.campaignQuestion.aggregate({
    where: { campaignId },
    _sum: { marks: true },
    _count: true,
  });
  await prisma.testCampaign.update({
    where: { id: campaignId },
    data: { totalMarks: agg._sum.marks ?? 0 },
  });
}

/** Get the next sortOrder for a campaign's questions within a paper version. */
async function getNextSortOrder(campaignId: string, paperVersion: string): Promise<number> {
  const max = await prisma.campaignQuestion.aggregate({
    where: { campaignId, paperVersion },
    _max: { sortOrder: true },
  });
  return (max._max.sortOrder ?? 0) + 1;
}

// ========================================================================
// Create a NEW MCQ question directly for a campaign (per-campaign creation)
// ========================================================================

export const createCampaignQuestionAction = safeAction(async function createCampaignQuestionAction(
  input: CreateCampaignQuestionInput,
): Promise<ActionResult<{ questionId: string }>> {
  const session = await requireRole('ADMIN');
  const parsed = createCampaignQuestionSchema.safeParse(input);
  if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? 'Validation failed');

  const campaign = await prisma.testCampaign.findUnique({ where: { id: parsed.data.campaignId } });
  if (!campaign) return actionError(ADMISSION_ERRORS.CAMPAIGN_NOT_FOUND);
  if (campaign.status !== 'DRAFT') return actionError(ADMISSION_ERRORS.CAMPAIGN_NOT_DRAFT);

  const subjectId = await getOrCreateGeneralSubject();
  const nextSort = await getNextSortOrder(parsed.data.campaignId, parsed.data.paperVersion);
  const correctIdx = OPTION_LABELS.indexOf(parsed.data.correctOption);

  const result = await prisma.$transaction(async (tx) => {
    // 1. Create Question record
    const question = await tx.question.create({
      data: {
        subjectId,
        createdById: session.user.id,
        type: 'MCQ',
        title: sanitizeString(parsed.data.title),
        description: parsed.data.description ? sanitizeString(parsed.data.description) : null,
        difficulty: 'MEDIUM',
        marks: parsed.data.marks,
        isActive: true,
      },
    });

    // 2. Create 4 MCQ options
    await tx.mcqOption.createMany({
      data: parsed.data.options.map((opt, i) => ({
        questionId: question.id,
        label: OPTION_LABELS[i]!,
        text: sanitizeString(opt.text),
        isCorrect: i === correctIdx,
        sortOrder: i + 1,
      })),
    });

    // 3. Link to campaign with paper version
    await tx.campaignQuestion.create({
      data: {
        campaignId: parsed.data.campaignId,
        questionId: question.id,
        sortOrder: nextSort,
        marks: parsed.data.marks,
        isRequired: true,
        sectionLabel: parsed.data.sectionLabel?.trim() || null,
        paperVersion: parsed.data.paperVersion,
      },
    });

    return question;
  });

  await syncCampaignTotalMarks(parsed.data.campaignId);

  createAuditLog(session.user.id, 'CREATE_CAMPAIGN_QUESTION', 'TEST_CAMPAIGN', parsed.data.campaignId, {
    questionId: result.id,
  }).catch(() => {});

  revalidatePath('/admin/admissions');
  return actionSuccess({ questionId: result.id });
});

// ========================================================================
// CSV Bulk Import — creates multiple MCQs in one transaction
// ========================================================================

export const importCsvQuestionsAction = safeAction(async function importCsvQuestionsAction(
  input: CsvImportQuestionsInput,
): Promise<ActionResult<{ imported: number }>> {
  const session = await requireRole('ADMIN');
  const parsed = csvImportQuestionsSchema.safeParse(input);
  if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? 'Validation failed');

  const campaign = await prisma.testCampaign.findUnique({ where: { id: parsed.data.campaignId } });
  if (!campaign) return actionError(ADMISSION_ERRORS.CAMPAIGN_NOT_FOUND);
  if (campaign.status !== 'DRAFT') return actionError(ADMISSION_ERRORS.CAMPAIGN_NOT_DRAFT);

  const subjectId = await getOrCreateGeneralSubject();
  const defaultVersion = parsed.data.defaultPaperVersion;
  const targetCampaignId = parsed.data.campaignId;

  // Track next sortOrder per paper version
  const sortOrders = new Map<string, number>();

  async function getSortForVersion(version: string): Promise<number> {
    if (!sortOrders.has(version)) {
      const max = await prisma.campaignQuestion.aggregate({
        where: { campaignId: targetCampaignId, paperVersion: version },
        _max: { sortOrder: true },
      });
      sortOrders.set(version, (max._max.sortOrder ?? 0) + 1);
    }
    const current = sortOrders.get(version)!;
    sortOrders.set(version, current + 1);
    return current;
  }

  await prisma.$transaction(async (tx) => {
    for (const row of parsed.data.questions) {
      const correctIdx = OPTION_LABELS.indexOf(row.correctOption);
      const options = [row.optionA, row.optionB, row.optionC, row.optionD];
      const version = row.paperVersion ?? defaultVersion;
      const sortOrder = await getSortForVersion(version);

      const question = await tx.question.create({
        data: {
          subjectId,
          createdById: session.user.id,
          type: 'MCQ',
          title: sanitizeString(row.title),
          difficulty: 'MEDIUM',
          marks: row.marks,
          isActive: true,
        },
      });

      await tx.mcqOption.createMany({
        data: options.map((text, i) => ({
          questionId: question.id,
          label: OPTION_LABELS[i]!,
          text: sanitizeString(text),
          isCorrect: i === correctIdx,
          sortOrder: i + 1,
        })),
      });

      await tx.campaignQuestion.create({
        data: {
          campaignId: parsed.data.campaignId,
          questionId: question.id,
          sortOrder,
          marks: row.marks,
          isRequired: true,
          sectionLabel: row.sectionLabel?.trim() || null,
          paperVersion: version,
        },
      });
    }
  });

  await syncCampaignTotalMarks(parsed.data.campaignId);

  createAuditLog(session.user.id, 'CSV_IMPORT_QUESTIONS', 'TEST_CAMPAIGN', parsed.data.campaignId, {
    count: parsed.data.questions.length,
  }).catch(() => {});

  revalidatePath('/admin/admissions');
  return actionSuccess({ imported: parsed.data.questions.length });
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

  await syncCampaignTotalMarks(parsed.data.campaignId);

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
