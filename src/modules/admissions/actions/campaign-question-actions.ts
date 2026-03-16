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
import { runSerializableTransaction } from '@/lib/transaction-locks';
import {
  removeQuestionsFromCampaignSchema,
  createCampaignQuestionSchema,
  updateCampaignQuestionSchema,
  csvImportQuestionsSchema,
  campaignScholarshipTiersSchema,
  type CreateCampaignQuestionInput,
  type UpdateCampaignQuestionInput,
  type CsvImportQuestionsInput,
} from '../admission-schemas';

import { logger } from '@/lib/logger';
const OPTION_LABELS = ['A', 'B', 'C', 'D'] as const;

const CSV_IMPORT_BATCH_SIZE = 50;

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

  const result = await runSerializableTransaction(async (tx) => {
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
  }, 4, { timeout: 20_000, maxWait: 10_000 });

  await syncCampaignTotalMarks(parsed.data.campaignId);

  createAuditLog(session.user.id, 'CREATE_CAMPAIGN_QUESTION', 'TEST_CAMPAIGN', parsed.data.campaignId, {
    questionId: result.id,
  }).catch((err) => logger.error({ err }, 'Audit log failed'));

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
  const rows = parsed.data.questions.map((row) => ({
    ...row,
    paperVersion: row.paperVersion ?? defaultVersion,
  }));
  const versions = [...new Set(rows.map((r) => r.paperVersion))];

  const versionMaxRows = await prisma.campaignQuestion.groupBy({
    by: ['paperVersion'],
    where: {
      campaignId: parsed.data.campaignId,
      paperVersion: { in: versions },
    },
    _max: { sortOrder: true },
  });

  const sortCursor = new Map<string, number>(
    versions.map((version) => {
      const matched = versionMaxRows.find((r) => r.paperVersion === version);
      return [version, (matched?._max.sortOrder ?? 0) + 1];
    }),
  );

  for (let i = 0; i < rows.length; i += CSV_IMPORT_BATCH_SIZE) {
    const chunk = rows.slice(i, i + CSV_IMPORT_BATCH_SIZE);

    const questionsData: Array<{
      id: string;
      subjectId: string;
      createdById: string;
      type: 'MCQ';
      title: string;
      difficulty: 'MEDIUM';
      marks: number;
      isActive: true;
    }> = [];

    const optionsData: Array<{
      questionId: string;
      label: 'A' | 'B' | 'C' | 'D';
      text: string;
      isCorrect: boolean;
      sortOrder: number;
    }> = [];

    const campaignQuestionsData: Array<{
      campaignId: string;
      questionId: string;
      sortOrder: number;
      marks: number;
      isRequired: true;
      sectionLabel: string | null;
      paperVersion: string;
    }> = [];

    for (const row of chunk) {
      const questionId = crypto.randomUUID();
      const correctIdx = OPTION_LABELS.indexOf(row.correctOption);
      const version = row.paperVersion;
      const sortOrder = sortCursor.get(version) ?? 1;
      sortCursor.set(version, sortOrder + 1);

      questionsData.push({
        id: questionId,
        subjectId,
        createdById: session.user.id,
        type: 'MCQ',
        title: sanitizeString(row.title),
        difficulty: 'MEDIUM',
        marks: row.marks,
        isActive: true,
      });

      const options = [row.optionA, row.optionB, row.optionC, row.optionD];
      options.forEach((text, idx) => {
        optionsData.push({
          questionId,
          label: OPTION_LABELS[idx]!,
          text: sanitizeString(text),
          isCorrect: idx === correctIdx,
          sortOrder: idx + 1,
        });
      });

      campaignQuestionsData.push({
        campaignId: parsed.data.campaignId,
        questionId,
        sortOrder,
        marks: row.marks,
        isRequired: true,
        sectionLabel: row.sectionLabel?.trim() || null,
        paperVersion: version,
      });
    }

    await runSerializableTransaction(async (tx) => {
      await tx.question.createMany({ data: questionsData });
      await tx.mcqOption.createMany({ data: optionsData });
      await tx.campaignQuestion.createMany({ data: campaignQuestionsData });
    }, 4, { timeout: 20_000, maxWait: 10_000 });
  }

  await syncCampaignTotalMarks(parsed.data.campaignId);

  createAuditLog(session.user.id, 'CSV_IMPORT_QUESTIONS', 'TEST_CAMPAIGN', parsed.data.campaignId, {
    count: parsed.data.questions.length,
  }).catch((err) => logger.error({ err }, 'Audit log failed'));

  revalidatePath('/admin/admissions');
  return actionSuccess({ imported: parsed.data.questions.length });
});

export const updateCampaignQuestionAction = safeAction(async function updateCampaignQuestionAction(
  input: UpdateCampaignQuestionInput,
): Promise<ActionResult> {
  const session = await requireRole('ADMIN');
  const parsed = updateCampaignQuestionSchema.safeParse(input);
  if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? 'Validation failed');

  const campaignQuestion = await prisma.campaignQuestion.findUnique({
    where: { id: parsed.data.campaignQuestionId },
    include: {
      campaign: { select: { id: true, status: true, name: true } },
      question: { select: { id: true } },
      _count: { select: { applicantAnswers: true } },
    },
  });

  if (!campaignQuestion) return actionError('Campaign question not found');

  const hasAttempts = campaignQuestion._count.applicantAnswers > 0;
  if (hasAttempts) {
    return actionError('Cannot edit question after candidate attempts have started');
  }

  const correctIdx = OPTION_LABELS.indexOf(parsed.data.correctOption);

  await runSerializableTransaction(async (tx) => {
    await tx.question.update({
      where: { id: campaignQuestion.question.id },
      data: {
        title: sanitizeString(parsed.data.title),
        description: parsed.data.description ? sanitizeString(parsed.data.description) : null,
        marks: parsed.data.marks,
      },
    });

    await tx.mcqOption.deleteMany({ where: { questionId: campaignQuestion.question.id } });
    await tx.mcqOption.createMany({
      data: parsed.data.options.map((opt, idx) => ({
        questionId: campaignQuestion.question.id,
        label: OPTION_LABELS[idx]!,
        text: sanitizeString(opt.text),
        isCorrect: idx === correctIdx,
        sortOrder: idx + 1,
      })),
    });

    await tx.campaignQuestion.update({
      where: { id: campaignQuestion.id },
      data: {
        marks: parsed.data.marks,
        sectionLabel: parsed.data.sectionLabel?.trim() || null,
      },
    });
  }, 4, { timeout: 20_000, maxWait: 10_000 });

  await syncCampaignTotalMarks(campaignQuestion.campaign.id);

  createAuditLog(
    session.user.id,
    'UPDATE_CAMPAIGN_QUESTION',
    'TEST_CAMPAIGN',
    campaignQuestion.campaign.id,
    { campaignQuestionId: campaignQuestion.id, questionId: campaignQuestion.question.id },
  ).catch((err) => logger.error({ err }, 'Audit log failed'));

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

  await syncCampaignTotalMarks(parsed.data.campaignId);

  createAuditLog(session.user.id, 'REMOVE_CAMPAIGN_QUESTIONS', 'TEST_CAMPAIGN', parsed.data.campaignId).catch((err) => logger.error({ err }, 'Audit log failed'));
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

  createAuditLog(session.user.id, 'CONFIGURE_SCHOLARSHIP_TIERS', 'TEST_CAMPAIGN', parsed.data.campaignId).catch((err) => logger.error({ err }, 'Audit log failed'));
  revalidatePath('/admin/admissions');
  return actionSuccess();
});
