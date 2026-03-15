/**
 * Admin candidate management actions — add, bulk add, generate test links.
 * Admin adds candidates per campaign (no self-registration, no OTP).
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
  addCandidateSchema,
  bulkAddCandidatesSchema,
  regenerateTestPinSchema,
  updateCandidateSchema,
  type AddCandidateInput,
  type BulkAddCandidatesInput,
  type RegenerateTestPinInput,
  type UpdateCandidateInput,
} from '../admission-schemas';
import { generateTestPin, sanitizeString } from '@/lib/admission-utils';
import { getNextApplicationNumber } from '../admission-queries';
import { ADMISSION_APPLICATION_NUMBER_PREFIX } from '@/lib/constants';

import { logger } from '@/lib/logger';
/**
 * Admin adds a single candidate to a campaign.
 * Candidate starts as VERIFIED — no OTP/email verification needed.
 */
export const addCandidateAction = safeAction(async function addCandidateAction(
  input: AddCandidateInput,
): Promise<ActionResult<{ applicantId: string; applicationNumber: string; testPin: string }>> {
  const session = await requireRole('ADMIN');

  const parsed = addCandidateSchema.safeParse(input);
  if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? 'Validation failed');

  const campaign = await prisma.testCampaign.findUnique({
    where: { id: parsed.data.campaignId },
    select: { id: true, name: true, status: true, maxSeats: true, _count: { select: { applicants: true } } },
  });
  if (!campaign) return actionError(ADMISSION_ERRORS.CAMPAIGN_NOT_FOUND);

  const allowedStatuses = ['DRAFT', 'REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'TEST_ACTIVE'];
  if (!allowedStatuses.includes(campaign.status)) {
    return actionError('Cannot add candidates in the current campaign status');
  }

  if (campaign.maxSeats && campaign._count.applicants >= campaign.maxSeats) {
    return actionError(ADMISSION_ERRORS.SEAT_LIMIT_REACHED);
  }

  const existing = await prisma.applicant.findFirst({
    where: { campaignId: parsed.data.campaignId, email: parsed.data.email.toLowerCase() },
  });
  if (existing) return actionError(ADMISSION_ERRORS.DUPLICATE_APPLICATION);

  // Generate a unique memorable PIN for test access
  let pin = generateTestPin();
  let pinExists = await prisma.applicant.findFirst({ where: { accessToken: pin } });
  while (pinExists) {
    pin = generateTestPin();
    pinExists = await prisma.applicant.findFirst({ where: { accessToken: pin } });
  }

  const applicationNumber = await getNextApplicationNumber(
    parsed.data.campaignId,
    ADMISSION_APPLICATION_NUMBER_PREFIX,
  );

  const applicant = await prisma.applicant.create({
    data: {
      campaignId: parsed.data.campaignId,
      firstName: sanitizeString(parsed.data.firstName),
      lastName: sanitizeString(parsed.data.lastName),
      email: parsed.data.email.toLowerCase().trim(),
      phone: parsed.data.phone?.trim(),
      dateOfBirth: parsed.data.dateOfBirth ? new Date(parsed.data.dateOfBirth) : undefined,
      gender: parsed.data.gender,
      guardianName: parsed.data.guardianName ? sanitizeString(parsed.data.guardianName) : undefined,
      guardianPhone: parsed.data.guardianPhone?.trim(),
      address: parsed.data.address ? sanitizeString(parsed.data.address, 1000) : undefined,
      previousSchool: parsed.data.previousSchool ? sanitizeString(parsed.data.previousSchool) : undefined,
      previousClass: parsed.data.previousClass ? sanitizeString(parsed.data.previousClass) : undefined,
      applicationNumber,
      accessToken: pin,
      status: 'VERIFIED',
      isEmailVerified: true,
      paperVersion: parsed.data.paperVersion,
    },
  });

  createAuditLog(session.user.id, 'ADD_CANDIDATE', 'APPLICANT', applicant.id, {
    campaignId: campaign.id,
    applicationNumber,
  }).catch((err) => logger.error({ err }, 'Audit log failed'));

  revalidatePath('/admin/admissions');
  return actionSuccess({
    applicantId: applicant.id,
    applicationNumber,
    testPin: pin,
  });
});

/**
 * Admin bulk-adds candidates to a campaign.
 */
export const bulkAddCandidatesAction = safeAction(async function bulkAddCandidatesAction(
  input: BulkAddCandidatesInput,
): Promise<ActionResult<{ added: number; skipped: number }>> {
  const session = await requireRole('ADMIN');

  const parsed = bulkAddCandidatesSchema.safeParse(input);
  if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? 'Validation failed');

  const campaign = await prisma.testCampaign.findUnique({
    where: { id: parsed.data.campaignId },
    select: { id: true, status: true },
  });
  if (!campaign) return actionError(ADMISSION_ERRORS.CAMPAIGN_NOT_FOUND);

  const allowedStatuses = ['DRAFT', 'REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'TEST_ACTIVE'];
  if (!allowedStatuses.includes(campaign.status)) {
    return actionError('Cannot add candidates in the current campaign status');
  }

  let added = 0;
  let skipped = 0;

  for (const c of parsed.data.candidates) {
    const email = c.email.toLowerCase().trim();
    const existing = await prisma.applicant.findFirst({
      where: { campaignId: parsed.data.campaignId, email },
    });
    if (existing) { skipped++; continue; }

    let pin = generateTestPin();
    let pinExists = await prisma.applicant.findFirst({ where: { accessToken: pin } });
    while (pinExists) {
      pin = generateTestPin();
      pinExists = await prisma.applicant.findFirst({ where: { accessToken: pin } });
    }

    const applicationNumber = await getNextApplicationNumber(
      parsed.data.campaignId,
      ADMISSION_APPLICATION_NUMBER_PREFIX,
    );

    await prisma.applicant.create({
      data: {
        campaignId: parsed.data.campaignId,
        firstName: sanitizeString(c.firstName),
        lastName: sanitizeString(c.lastName),
        email,
        phone: c.phone?.trim(),
        dateOfBirth: c.dateOfBirth ? new Date(c.dateOfBirth) : undefined,
        gender: c.gender,
        guardianName: c.guardianName ? sanitizeString(c.guardianName) : undefined,
        guardianPhone: c.guardianPhone?.trim(),
        address: c.address ? sanitizeString(c.address, 1000) : undefined,
        previousSchool: c.previousSchool ? sanitizeString(c.previousSchool) : undefined,
        previousClass: c.previousClass ? sanitizeString(c.previousClass) : undefined,
        applicationNumber,
        accessToken: pin,
        status: 'VERIFIED',
        isEmailVerified: true,
        paperVersion: (c as { paperVersion?: string }).paperVersion ?? 'A',
      },
    });
    added++;
  }

  createAuditLog(session.user.id, 'BULK_ADD_CANDIDATES', 'TEST_CAMPAIGN', campaign.id, {
    added,
    skipped,
  }).catch((err) => logger.error({ err }, 'Audit log failed'));

  revalidatePath('/admin/admissions');
  return actionSuccess({ added, skipped });
});

/**
 * Admin regenerates a test PIN for a candidate.
 */
export const regenerateTestPinAction = safeAction(async function regenerateTestPinAction(
  input: RegenerateTestPinInput,
): Promise<ActionResult<{ testPin: string }>> {
  await requireRole('ADMIN');

  const parsed = regenerateTestPinSchema.safeParse(input);
  if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? 'Validation failed');

  const applicant = await prisma.applicant.findUnique({
    where: { id: parsed.data.applicantId },
    select: { id: true, status: true },
  });
  if (!applicant) return actionError(ADMISSION_ERRORS.APPLICANT_NOT_FOUND);

  if (!['VERIFIED', 'TEST_IN_PROGRESS'].includes(applicant.status)) {
    return actionError('Candidate must be in VERIFIED or TEST_IN_PROGRESS status to regenerate PIN');
  }

  let pin = generateTestPin();
  let pinExists = await prisma.applicant.findFirst({ where: { accessToken: pin } });
  while (pinExists) {
    pin = generateTestPin();
    pinExists = await prisma.applicant.findFirst({ where: { accessToken: pin } });
  }

  await prisma.applicant.update({
    where: { id: applicant.id },
    data: { accessToken: pin },
  });

  return actionSuccess({ testPin: pin });
});

export const updateCandidateAction = safeAction(async function updateCandidateAction(
  input: UpdateCandidateInput,
): Promise<ActionResult> {
  await requireRole('ADMIN');

  const parsed = updateCandidateSchema.safeParse(input);
  if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? 'Validation failed');

  const applicant = await prisma.applicant.findUnique({
    where: { id: parsed.data.applicantId },
    select: { id: true, campaignId: true },
  });
  if (!applicant) return actionError(ADMISSION_ERRORS.APPLICANT_NOT_FOUND);

  const { applicantId: _id, ...fields } = parsed.data;
  const updateData: Record<string, unknown> = {};

  if (fields.firstName) updateData.firstName = sanitizeString(fields.firstName);
  if (fields.lastName) updateData.lastName = sanitizeString(fields.lastName);
  if (fields.email) updateData.email = fields.email.toLowerCase().trim();
  if (fields.phone !== undefined) updateData.phone = fields.phone?.trim() || null;
  if (fields.dateOfBirth) updateData.dateOfBirth = new Date(fields.dateOfBirth);
  if (fields.gender) updateData.gender = fields.gender;
  if (fields.guardianName !== undefined) updateData.guardianName = fields.guardianName ? sanitizeString(fields.guardianName) : null;
  if (fields.guardianPhone !== undefined) updateData.guardianPhone = fields.guardianPhone?.trim() || null;
  if (fields.address !== undefined) updateData.address = fields.address ? sanitizeString(fields.address, 1000) : null;
  if (fields.previousSchool !== undefined) updateData.previousSchool = fields.previousSchool ? sanitizeString(fields.previousSchool) : null;
  if (fields.previousClass !== undefined) updateData.previousClass = fields.previousClass ? sanitizeString(fields.previousClass) : null;

  if (Object.keys(updateData).length === 0) return actionError('No fields to update');

  await prisma.applicant.update({ where: { id: applicant.id }, data: updateData });

  revalidatePath('/admin/admissions');
  return actionSuccess();
});
