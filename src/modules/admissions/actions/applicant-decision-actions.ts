/**
 * Applicant decision actions — accept/reject/waitlist, bulk decisions, waitlist promotion.
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
  singleDecisionSchema,
  bulkDecisionSchema,
  type SingleDecisionInput,
  type BulkDecisionInput,
} from '../admission-schemas';
import { sendEmail } from '@/lib/email';
import {
  decisionAcceptedEmail,
  decisionRejectedEmail,
  decisionWaitlistedEmail,
  scholarshipOfferedEmail,
  waitlistPromotedEmail,
  ADMISSION_EMAIL_SUBJECTS,
} from '@/lib/email-templates';
import { getSchoolBranding } from './shared';

type ApplicantStatusType = 'REGISTERED' | 'VERIFIED' | 'TEST_IN_PROGRESS' | 'TEST_COMPLETED' | 'GRADED' | 'SHORTLISTED' | 'INTERVIEW_SCHEDULED' | 'ACCEPTED' | 'REJECTED' | 'WAITLISTED' | 'ENROLLED' | 'WITHDRAWN' | 'EXPIRED';

export const makeDecisionAction = safeAction(async function makeDecisionAction(
  input: SingleDecisionInput,
): Promise<ActionResult> {
  const session = await requireRole('ADMIN');
  const parsed = singleDecisionSchema.safeParse(input);
  if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? 'Validation failed');

  const applicant = await prisma.applicant.findUnique({
    where: { id: parsed.data.applicantId },
    include: { campaign: { select: { id: true, name: true, maxSeats: true } } },
  });
  if (!applicant) return actionError(ADMISSION_ERRORS.APPLICANT_NOT_FOUND);
  if (!['GRADED', 'SHORTLISTED', 'WAITLISTED'].includes(applicant.status)) {
    return actionError(ADMISSION_ERRORS.NOT_SHORTLISTED);
  }

  // Check seat limit for acceptance
  if (parsed.data.decision === 'ACCEPTED' && applicant.campaign.maxSeats) {
    const accepted = await prisma.applicant.count({
      where: { campaignId: applicant.campaignId, status: { in: ['ACCEPTED', 'ENROLLED'] } },
    });
    if (accepted >= applicant.campaign.maxSeats) return actionError(ADMISSION_ERRORS.SEAT_LIMIT_REACHED);
  }

  const statusMap: Record<string, string> = {
    ACCEPTED: 'ACCEPTED',
    REJECTED: 'REJECTED',
    WAITLISTED: 'WAITLISTED',
    SCHOLARSHIP_OFFERED: 'ACCEPTED',
  };

  await prisma.$transaction([
    prisma.applicant.update({
      where: { id: parsed.data.applicantId },
      data: { status: statusMap[parsed.data.decision] as ApplicantStatusType },
    }),
    prisma.admissionDecisionRecord.create({
      data: {
        applicantId: parsed.data.applicantId,
        campaignId: applicant.campaignId,
        decision: parsed.data.decision,
        remarks: parsed.data.remarks,
        conditions: parsed.data.conditions,
        assignedClassId: parsed.data.assignedClassId,
        assignedSectionId: parsed.data.assignedSectionId,
        decidedById: session.user.id,
      },
    }),
  ]);

  // Send email notification
  const branding = await getSchoolBranding();
  const emailTemplates: Record<string, () => string> = {
    ACCEPTED: () => decisionAcceptedEmail({
      firstName: applicant.firstName,
      campaignName: applicant.campaign.name,
      conditions: parsed.data.conditions,
      branding,
    }),
    REJECTED: () => decisionRejectedEmail({
      firstName: applicant.firstName,
      campaignName: applicant.campaign.name,
      remarks: parsed.data.remarks,
      branding,
    }),
    WAITLISTED: () => decisionWaitlistedEmail({
      firstName: applicant.firstName,
      campaignName: applicant.campaign.name,
      branding,
    }),
    SCHOLARSHIP_OFFERED: () => scholarshipOfferedEmail({
      firstName: applicant.firstName,
      campaignName: applicant.campaign.name,
      tierName: parsed.data.conditions ?? 'Scholarship',
      percentage: 0,
      benefitDetails: parsed.data.remarks,
      branding,
    }),
  };

  const templateFn = emailTemplates[parsed.data.decision];
  if (templateFn) {
    const subjectMap: Record<string, (c: string) => string> = {
      ACCEPTED: ADMISSION_EMAIL_SUBJECTS['decision-accepted'],
      REJECTED: ADMISSION_EMAIL_SUBJECTS['decision-rejected'],
      WAITLISTED: ADMISSION_EMAIL_SUBJECTS['decision-waitlisted'],
      SCHOLARSHIP_OFFERED: ADMISSION_EMAIL_SUBJECTS['scholarship-offered'],
    };
    const subjectFn = subjectMap[parsed.data.decision];
    if (subjectFn) {
      sendEmail({
        to: applicant.email,
        subject: subjectFn(applicant.campaign.name),
        html: templateFn(),
      }).catch(() => {});
    }
  }

  createAuditLog(session.user.id, 'MAKE_DECISION', 'APPLICANT', parsed.data.applicantId, {
    decision: parsed.data.decision,
  }).catch(() => {});
  revalidatePath('/admin/admissions');
  return actionSuccess();
});

export const bulkDecisionAction = safeAction(async function bulkDecisionAction(
  input: BulkDecisionInput,
): Promise<ActionResult<{ processed: number }>> {
  const session = await requireRole('ADMIN');
  const parsed = bulkDecisionSchema.safeParse(input);
  if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? 'Validation failed');

  const statusMap: Record<string, ApplicantStatusType> = {
    ACCEPTED: 'ACCEPTED',
    REJECTED: 'REJECTED',
    WAITLISTED: 'WAITLISTED',
  };

  const applicants = await prisma.applicant.findMany({
    where: {
      id: { in: parsed.data.applicantIds },
      status: { in: ['GRADED', 'SHORTLISTED', 'WAITLISTED'] },
    },
    include: { campaign: { select: { id: true, name: true } } },
  });

  if (applicants.length === 0) return actionError('No eligible applicants found');

  await prisma.$transaction([
    prisma.applicant.updateMany({
      where: { id: { in: applicants.map((a) => a.id) } },
      data: { status: statusMap[parsed.data.decision] },
    }),
    ...applicants.map((a) =>
      prisma.admissionDecisionRecord.create({
        data: {
          applicantId: a.id,
          campaignId: a.campaignId,
          decision: parsed.data.decision,
          remarks: parsed.data.remarks,
          assignedClassId: parsed.data.assignedClassId,
          assignedSectionId: parsed.data.assignedSectionId,
          decidedById: session.user.id,
        },
      }),
    ),
  ]);

  createAuditLog(session.user.id, 'BULK_DECISION', 'TEST_CAMPAIGN', applicants[0]?.campaignId ?? '', {
    count: applicants.length,
    decision: parsed.data.decision,
  }).catch(() => {});
  revalidatePath('/admin/admissions');
  return actionSuccess({ processed: applicants.length });
});

export const promoteFromWaitlistAction = safeAction(async function promoteFromWaitlistAction(
  campaignId: string,
  count: number = 1,
): Promise<ActionResult<{ promoted: number }>> {
  const session = await requireRole('ADMIN');

  const waitlisted = await prisma.applicant.findMany({
    where: { campaignId, status: 'WAITLISTED' },
    include: {
      result: { select: { rank: true, percentage: true } },
      campaign: { select: { name: true } },
    },
    orderBy: { result: { rank: 'asc' } },
    take: Number(count),
  });

  if (waitlisted.length === 0) return actionError('No waitlisted applicants found');

  const branding = await getSchoolBranding();

  await prisma.$transaction([
    prisma.applicant.updateMany({
      where: { id: { in: waitlisted.map((a) => a.id) } },
      data: { status: 'ACCEPTED' },
    }),
    ...waitlisted.map((a) =>
      prisma.admissionDecisionRecord.create({
        data: {
          applicantId: a.id,
          campaignId,
          decision: 'ACCEPTED',
          remarks: 'Promoted from waitlist',
          decidedById: session.user.id,
        },
      }),
    ),
  ]);

  // Send emails
  for (const applicant of waitlisted) {
    sendEmail({
      to: applicant.email,
      subject: ADMISSION_EMAIL_SUBJECTS['waitlist-promoted'](applicant.campaign.name),
      html: waitlistPromotedEmail({
        firstName: applicant.firstName,
        campaignName: applicant.campaign.name,
        branding,
      }),
    }).catch(() => {});
  }

  createAuditLog(session.user.id, 'PROMOTE_WAITLIST', 'TEST_CAMPAIGN', campaignId, {
    count: waitlisted.length,
  }).catch(() => {});
  revalidatePath('/admin/admissions');
  return actionSuccess({ promoted: waitlisted.length });
});
