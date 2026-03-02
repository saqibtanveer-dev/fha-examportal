/**
 * Public portal result & scholarship actions — check results, respond to scholarship,
 * track application status.
 */

'use server';

import { prisma } from '@/lib/prisma';
import { safeAction } from '@/lib/safe-action';
import type { ActionResult } from '@/types/action-result';
import { actionError, actionSuccess } from '@/types/action-result';
import { ADMISSION_ERRORS } from '../admission-types';
import {
  checkResultSchema,
  scholarshipResponseSchema,
  type CheckResultInput,
  type ScholarshipResponseInput,
} from '../admission-schemas';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { serialize } from '@/utils/serialize';

export const checkResultAction = safeAction(async function checkResultAction(
  input: CheckResultInput,
): Promise<ActionResult<unknown>> {
  const parsed = checkResultSchema.safeParse(input);
  if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? 'Validation failed');

  const rl = checkRateLimit(`admission:result:${parsed.data.email}`, RATE_LIMITS.ADMISSION_CHECK_RESULT);
  if (!rl.allowed) return actionError('Too many result check attempts. Please try again later.');

  const applicant = await prisma.applicant.findFirst({
    where: {
      applicationNumber: parsed.data.applicationNumber,
      email: parsed.data.email.toLowerCase(),
    },
    include: {
      campaign: { select: { name: true, type: true, hasScholarship: true, status: true } },
      result: {
        select: {
          totalMarks: true,
          obtainedMarks: true,
          percentage: true,
          grade: true,
          isPassed: true,
          rank: true,
          publishedAt: true,
          sectionScores: true,
        },
      },
      scholarship: {
        select: {
          tier: true,
          percentageAwarded: true,
          isAccepted: true,
          acceptedAt: true,
          declinedAt: true,
        },
      },
      decisions: {
        where: { stage: 'FINAL_DECISION' },
        select: { decision: true, remarks: true, conditions: true },
        take: 1,
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!applicant) return actionError(ADMISSION_ERRORS.RESULT_NOT_PUBLISHED);
  if (!applicant.result?.publishedAt) return actionError(ADMISSION_ERRORS.RESULT_NOT_PUBLISHED);

  const scholarshipData = applicant.scholarship
    ? {
        tier: applicant.scholarship.tier,
        percentageAwarded: applicant.scholarship.percentageAwarded,
        status: applicant.scholarship.isAccepted === null
          ? 'PENDING'
          : applicant.scholarship.isAccepted
          ? 'ACCEPTED'
          : 'DECLINED',
      }
    : null;

  return actionSuccess(serialize({
    name: `${applicant.firstName} ${applicant.lastName}`,
    applicationNumber: applicant.applicationNumber,
    campaignName: applicant.campaign.name,
    campaignType: applicant.campaign.type,
    status: applicant.status,
    result: applicant.result,
    scholarship: scholarshipData,
    decision: applicant.decisions[0] ?? null,
  }));
});

export const respondToScholarshipAction = safeAction(async function respondToScholarshipAction(
  input: ScholarshipResponseInput,
): Promise<ActionResult> {
  const parsed = scholarshipResponseSchema.safeParse(input);
  if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? 'Validation failed');

  const applicant = await prisma.applicant.findUnique({
    where: { id: parsed.data.applicantId },
    include: { scholarship: true },
  });
  if (!applicant) return actionError(ADMISSION_ERRORS.APPLICANT_NOT_FOUND);
  if (!applicant.scholarship) return actionError('No scholarship offer found');
  if (applicant.scholarship.isAccepted !== null) {
    return actionError('Scholarship already ' + (applicant.scholarship.isAccepted ? 'accepted' : 'declined'));
  }

  const isAccepted = parsed.data.response === 'ACCEPT';
  await prisma.applicantScholarship.update({
    where: { id: applicant.scholarship.id },
    data: {
      isAccepted,
      acceptedAt: isAccepted ? new Date() : undefined,
      declinedAt: !isAccepted ? new Date() : undefined,
    },
  });

  return actionSuccess();
});

export const trackApplicationAction = safeAction(async function trackApplicationAction(
  input: { applicationNumber: string; email: string },
): Promise<ActionResult<unknown>> {
  const applicant = await prisma.applicant.findFirst({
    where: {
      applicationNumber: input.applicationNumber.trim(),
      email: input.email.toLowerCase().trim(),
    },
    include: {
      campaign: { select: { name: true, type: true, status: true } },
      testSession: {
        select: { startedAt: true, submittedAt: true },
      },
      result: {
        select: { percentage: true, isPassed: true, rank: true },
      },
      scholarship: {
        select: { tier: true, percentageAwarded: true, isAccepted: true },
      },
      decisions: {
        where: { stage: 'FINAL_DECISION' },
        select: { decision: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });

  if (!applicant) return actionError('Application not found. Please check your details.');

  const scholarshipData = applicant.scholarship
    ? {
        tier: applicant.scholarship.tier,
        percentageAwarded: applicant.scholarship.percentageAwarded,
        status: applicant.scholarship.isAccepted === null
          ? 'PENDING'
          : applicant.scholarship.isAccepted
          ? 'ACCEPTED'
          : 'DECLINED',
      }
    : null;

  return actionSuccess(serialize({
    name: `${applicant.firstName} ${applicant.lastName}`,
    email: applicant.email,
    applicationNumber: applicant.applicationNumber,
    campaignName: applicant.campaign.name,
    campaignType: applicant.campaign.type,
    status: applicant.status,
    appliedAt: applicant.createdAt.toISOString(),
    testSession: applicant.testSession
      ? {
          startedAt: applicant.testSession.startedAt?.toISOString() ?? null,
          submittedAt: applicant.testSession.submittedAt?.toISOString() ?? null,
        }
      : null,
    result: applicant.result
      ? {
          percentage: applicant.result.percentage,
          isPassed: applicant.result.isPassed,
          rank: applicant.result.rank,
        }
      : null,
    decision: applicant.decisions[0]
      ? {
          decision: applicant.decisions[0].decision,
          decidedAt: applicant.decisions[0].createdAt.toISOString(),
        }
      : null,
    scholarship: scholarshipData,
  }));
});
