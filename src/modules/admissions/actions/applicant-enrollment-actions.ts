/**
 * Scholarship auto-assignment, enrollment (applicant → student), and merit list generation.
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
  enrollApplicantSchema,
  bulkEnrollSchema,
  type EnrollApplicantInput,
} from '../admission-schemas';
import { sendEmail } from '@/lib/email';
import { enrollmentWelcomeEmail, ADMISSION_EMAIL_SUBJECTS } from '@/lib/email-templates';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { getSchoolBranding } from './shared';

export const autoAssignScholarshipsAction = safeAction(async function autoAssignScholarshipsAction(
  campaignId: string,
): Promise<ActionResult<{ assigned: number }>> {
  const session = await requireRole('ADMIN');

  const [tiers, results] = await Promise.all([
    prisma.campaignScholarshipTier.findMany({
      where: { campaignId, isActive: true },
      orderBy: { sortOrder: 'asc' },
    }),
    prisma.applicantResult.findMany({
      where: { campaignId, isPassed: true },
      include: {
        applicant: {
          select: {
            id: true,
            status: true,
            testSession: { select: { isFlagged: true } },
            scholarship: { select: { id: true } },
          },
        },
      },
      orderBy: { percentage: 'desc' },
    }),
  ]);

  if (tiers.length === 0) return actionError('No scholarship tiers configured');

  const { assignScholarshipTiers } = await import('@/modules/grading/grading-core');

  const eligibleApplicants = results
    .filter((r) => !r.applicant.scholarship && !r.applicant.testSession?.isFlagged)
    .map((r) => ({
      id: r.applicant.id,
      percentage: Number(r.percentage),
      isPassed: r.isPassed,
      isFlagged: r.applicant.testSession?.isFlagged ?? false,
    }));

  const tierConfigs = tiers.map((t) => ({
    id: t.id,
    tier: t.tier,
    minPercentage: Number(t.minPercentage),
    maxRecipients: t.maxRecipients,
    sortOrder: t.sortOrder,
  }));

  const assignments = assignScholarshipTiers(eligibleApplicants, tierConfigs);

  // Find tier benefit percentages
  const tierPercentages: Record<string, number> = {};
  for (const t of tiers) {
    tierPercentages[t.id] = Number(t.minPercentage);
  }

  await prisma.$transaction(
    assignments.map((a) =>
      prisma.applicantScholarship.create({
        data: {
          applicantId: a.applicantId,
          campaignId,
          tierId: a.tierId,
          tier: a.tier as 'FULL_100' | 'SEVENTY_FIVE' | 'HALF_50' | 'QUARTER_25' | 'NONE',
          percentageAwarded: tierPercentages[a.tierId] ?? 0,
          awardedById: session.user.id,
        },
      }),
    ),
  );

  createAuditLog(session.user.id, 'AUTO_ASSIGN_SCHOLARSHIPS', 'TEST_CAMPAIGN', campaignId, {
    assigned: assignments.length,
  }).catch(() => {});
  revalidatePath('/admin/admissions');
  return actionSuccess({ assigned: assignments.length });
});

export const enrollApplicantAction = safeAction(async function enrollApplicantAction(
  input: EnrollApplicantInput,
): Promise<ActionResult<{ userId: string }>> {
  const session = await requireRole('ADMIN');
  const parsed = enrollApplicantSchema.safeParse(input);
  if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? 'Validation failed');

  const applicant = await prisma.applicant.findUnique({
    where: { id: parsed.data.applicantId },
    include: { campaign: { select: { name: true } } },
  });
  if (!applicant) return actionError(ADMISSION_ERRORS.APPLICANT_NOT_FOUND);
  if (applicant.status !== 'ACCEPTED') return actionError(ADMISSION_ERRORS.NOT_ACCEPTED);

  // Check if user with same email already exists
  const existingUser = await prisma.user.findUnique({ where: { email: applicant.email } });
  if (existingUser) return actionError(ADMISSION_ERRORS.EMAIL_ALREADY_EXISTS);

  // Generate temporary password
  const tempPassword = randomBytes(6).toString('hex');
  const passwordHash = await bcrypt.hash(tempPassword, 12);

  // Generate roll number
  const rollNumber = parsed.data.rollNumber ?? applicant.applicationNumber;

  // Create User + StudentProfile in transaction
  const user = await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: {
        email: applicant.email,
        passwordHash,
        firstName: applicant.firstName,
        lastName: applicant.lastName,
        role: 'STUDENT',
        phone: applicant.phone,
      },
    });

    await tx.studentProfile.create({
      data: {
        userId: newUser.id,
        rollNumber,
        registrationNo: applicant.applicationNumber,
        classId: parsed.data.classId,
        sectionId: parsed.data.sectionId,
        guardianName: applicant.guardianName,
        guardianPhone: applicant.guardianPhone,
        dateOfBirth: applicant.dateOfBirth,
        gender: applicant.gender,
      },
    });

    await tx.applicant.update({
      where: { id: applicant.id },
      data: { status: 'ENROLLED' },
    });

    await tx.admissionDecisionRecord.create({
      data: {
        applicantId: applicant.id,
        campaignId: applicant.campaignId,
        decision: 'ACCEPTED',
        stage: 'FINAL_DECISION',
        remarks: 'Enrolled as student',
        assignedClassId: parsed.data.classId,
        assignedSectionId: parsed.data.sectionId,
        decidedById: session.user.id,
      },
    });

    return newUser;
  });

  // Send welcome email
  const branding = await getSchoolBranding();
  const className = await prisma.class.findUnique({ where: { id: parsed.data.classId }, select: { name: true } });

  sendEmail({
    to: applicant.email,
    subject: ADMISSION_EMAIL_SUBJECTS['enrollment-welcome'](),
    html: enrollmentWelcomeEmail({
      firstName: applicant.firstName,
      lastName: applicant.lastName,
      email: applicant.email,
      temporaryPassword: tempPassword,
      className: className?.name ?? 'Assigned Class',
      loginUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/login`,
      branding,
    }),
  }).catch(() => {});

  createAuditLog(session.user.id, 'ENROLL_APPLICANT', 'APPLICANT', applicant.id, {
    userId: user.id,
  }).catch(() => {});
  revalidatePath('/admin/admissions');
  return actionSuccess({ userId: user.id });
});

export const bulkEnrollAction = safeAction(async function bulkEnrollAction(
  input: { applicants: Array<{ applicantId: string; classId: string; sectionId: string; rollNumber?: string }> },
): Promise<ActionResult<{ enrolled: number; failed: number }>> {
  const session = await requireRole('ADMIN');
  const parsed = bulkEnrollSchema.safeParse(input);
  if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? 'Validation failed');

  let enrolled = 0;
  let failed = 0;

  // Process sequentially to avoid roll number conflicts
  for (const item of parsed.data.applicants) {
    const result = await enrollApplicantAction(item);
    if (result.success) enrolled++;
    else failed++;
  }

  createAuditLog(session.user.id, 'BULK_ENROLL', 'TEST_CAMPAIGN', '', {
    enrolled,
    failed,
  }).catch(() => {});
  return actionSuccess({ enrolled, failed });
});

export const generateMeritListAction = safeAction(async function generateMeritListAction(
  campaignId: string,
): Promise<ActionResult<{ ranked: number }>> {
  const session = await requireRole('ADMIN');
  const campaign = await prisma.testCampaign.findUnique({ where: { id: campaignId } });
  if (!campaign) return actionError(ADMISSION_ERRORS.CAMPAIGN_NOT_FOUND);

  const { generateMeritRankings } = await import('@/modules/grading/admission-grading');
  const ranked = await generateMeritRankings(campaignId);

  // Auto-shortlist passed applicants
  await prisma.applicant.updateMany({
    where: {
      campaignId,
      status: 'GRADED',
      result: { isPassed: true },
    },
    data: { status: 'SHORTLISTED' },
  });

  // Auto-reject failed applicants
  await prisma.applicant.updateMany({
    where: {
      campaignId,
      status: 'GRADED',
      result: { isPassed: false },
    },
    data: { status: 'REJECTED' },
  });

  createAuditLog(session.user.id, 'GENERATE_MERIT_LIST', 'TEST_CAMPAIGN', campaignId, { ranked }).catch(() => {});
  revalidatePath('/admin/admissions');
  return actionSuccess({ ranked });
});
