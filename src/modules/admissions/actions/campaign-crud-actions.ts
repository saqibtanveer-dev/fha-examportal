/**
 * Campaign CRUD actions — create, update, soft-delete.
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
  createCampaignSchema,
  updateCampaignSchema,
  type CreateCampaignInput,
  type UpdateCampaignInput,
} from '../admission-schemas';

import { logger } from '@/lib/logger';
export const createCampaignAction = safeAction(async function createCampaignAction(
  input: CreateCampaignInput,
): Promise<ActionResult<{ id: string }>> {
  const session = await requireRole('ADMIN');
  const parsed = createCampaignSchema.safeParse(input);
  if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? 'Validation failed');

  const { registrationStartAt, registrationEndAt, testStartAt, testEndAt, ...data } = parsed.data;

  const campaign = await prisma.testCampaign.create({
    data: {
      ...data,
      registrationStartAt: registrationStartAt ? new Date(registrationStartAt) : undefined,
      registrationEndAt: registrationEndAt ? new Date(registrationEndAt) : undefined,
      testStartAt: testStartAt ? new Date(testStartAt) : undefined,
      testEndAt: testEndAt ? new Date(testEndAt) : undefined,
      createdById: session.user.id,
    },
  });

  createAuditLog(session.user.id, 'CREATE_CAMPAIGN', 'TEST_CAMPAIGN', campaign.id, { name: data.name }).catch((err) => logger.error({ err }, 'Audit log failed'));
  revalidatePath('/admin/admissions');
  return actionSuccess({ id: campaign.id });
});

export const updateCampaignAction = safeAction(async function updateCampaignAction(
  input: UpdateCampaignInput,
): Promise<ActionResult> {
  const session = await requireRole('ADMIN');
  const parsed = updateCampaignSchema.safeParse(input);
  if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? 'Validation failed');

  const { id, registrationStartAt, registrationEndAt, testStartAt, testEndAt, ...data } = parsed.data;

  const campaign = await prisma.testCampaign.findUnique({ where: { id } });
  if (!campaign) return actionError(ADMISSION_ERRORS.CAMPAIGN_NOT_FOUND);
  if (campaign.status !== 'DRAFT') return actionError(ADMISSION_ERRORS.CAMPAIGN_NOT_DRAFT);

  await prisma.testCampaign.update({
    where: { id },
    data: {
      ...data,
      registrationStartAt: registrationStartAt ? new Date(registrationStartAt) : undefined,
      registrationEndAt: registrationEndAt ? new Date(registrationEndAt) : undefined,
      testStartAt: testStartAt ? new Date(testStartAt) : undefined,
      testEndAt: testEndAt ? new Date(testEndAt) : undefined,
    },
  });

  createAuditLog(session.user.id, 'UPDATE_CAMPAIGN', 'TEST_CAMPAIGN', id, data).catch((err) => logger.error({ err }, 'Audit log failed'));
  revalidatePath('/admin/admissions');
  return actionSuccess();
});

export const deleteCampaignAction = safeAction(async function deleteCampaignAction(
  id: string,
): Promise<ActionResult> {
  const session = await requireRole('ADMIN');

  const campaign = await prisma.testCampaign.findUnique({
    where: { id, deletedAt: null },
    include: { _count: { select: { applicants: true } } },
  });
  if (!campaign) return actionError(ADMISSION_ERRORS.CAMPAIGN_NOT_FOUND);
  if (campaign._count.applicants > 0 && campaign.status !== 'DRAFT') {
    return actionError('Cannot delete campaign with applicants unless it is in draft status');
  }

  await prisma.testCampaign.update({ where: { id }, data: { deletedAt: new Date() } });
  createAuditLog(session.user.id, 'DELETE_CAMPAIGN', 'TEST_CAMPAIGN', id).catch((err) => logger.error({ err }, 'Audit log failed'));
  revalidatePath('/admin/admissions');
  return actionSuccess();
});
