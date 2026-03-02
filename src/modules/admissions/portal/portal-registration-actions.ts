/**
 * Public portal registration actions — applicant registration, OTP verification, resend OTP.
 * No auth required (public access).
 */

'use server';

import { prisma } from '@/lib/prisma';
import { safeAction } from '@/lib/safe-action';
import type { ActionResult } from '@/types/action-result';
import { actionError, actionSuccess } from '@/types/action-result';
import { ADMISSION_ERRORS } from '../admission-types';
import {
  applicantRegistrationSchema,
  verifyOtpSchema,
  resendOtpSchema,
  type ApplicantRegistrationInput,
  type VerifyOtpInput,
  type ResendOtpInput,
} from '../admission-schemas';
import {
  generateAccessToken,
  hashToken,
  verifyToken,
  generateOtp,
  sanitizeString,
} from '@/lib/admission-utils';
import { getNextApplicationNumber } from '../admission-queries';
import { sendEmail } from '@/lib/email';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import {
  applicantOtpEmail,
  applicantVerifiedEmail,
  ADMISSION_EMAIL_SUBJECTS,
} from '@/lib/email-templates';
import {
  ADMISSION_APPLICATION_NUMBER_PREFIX,
  ADMISSION_OTP_LENGTH,
  ADMISSION_OTP_EXPIRY_MS,
  ADMISSION_OTP_MAX_ATTEMPTS,
} from '@/lib/constants';
import { getSchoolBranding } from '../actions/shared';

export const registerApplicantAction = safeAction(async function registerApplicantAction(
  input: ApplicantRegistrationInput,
): Promise<ActionResult<{ applicantId: string }>> {
  const parsed = applicantRegistrationSchema.safeParse(input);
  if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? 'Validation failed');

  const rl = checkRateLimit(`admission:register:${parsed.data.email}`, RATE_LIMITS.ADMISSION_REGISTER);
  if (!rl.allowed) return actionError('Too many registration attempts. Please try again later.');

  const campaign = await prisma.testCampaign.findUnique({
    where: { id: parsed.data.campaignId },
    select: {
      id: true,
      name: true,
      status: true,
      registrationStartAt: true,
      registrationEndAt: true,
      maxSeats: true,
      _count: { select: { applicants: true } },
    },
  });
  if (!campaign) return actionError(ADMISSION_ERRORS.CAMPAIGN_NOT_FOUND);
  if (campaign.status !== 'REGISTRATION_OPEN') return actionError(ADMISSION_ERRORS.REGISTRATION_NOT_OPEN);

  const now = new Date();
  if (campaign.registrationStartAt && now < campaign.registrationStartAt) {
    return actionError(ADMISSION_ERRORS.REGISTRATION_NOT_OPEN);
  }
  if (campaign.registrationEndAt && now > campaign.registrationEndAt) {
    return actionError(ADMISSION_ERRORS.REGISTRATION_CLOSED);
  }
  if (campaign.maxSeats && campaign._count.applicants >= campaign.maxSeats) {
    return actionError(ADMISSION_ERRORS.SEAT_LIMIT_REACHED);
  }

  const existing = await prisma.applicant.findFirst({
    where: { campaignId: parsed.data.campaignId, email: parsed.data.email.toLowerCase() },
  });
  if (existing) return actionError(ADMISSION_ERRORS.DUPLICATE_APPLICATION);

  const rawToken = generateAccessToken();
  const tokenHash = hashToken(rawToken);
  const otp = generateOtp(ADMISSION_OTP_LENGTH);
  const otpExpiry = new Date(Date.now() + ADMISSION_OTP_EXPIRY_MS);

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
      accessToken: tokenHash,
      emailOtp: hashToken(otp.toString()),
      otpExpiresAt: otpExpiry,
      status: 'REGISTERED',
    },
  });

  if (process.env.NODE_ENV === 'development') {
    console.log(`\n[DEV] OTP for ${applicant.email}: ${otp}\n`);
  }

  const branding = await getSchoolBranding();
  sendEmail({
    to: applicant.email,
    subject: ADMISSION_EMAIL_SUBJECTS['applicant-otp'](campaign.name),
    html: applicantOtpEmail({
      firstName: applicant.firstName,
      otp: otp.toString(),
      campaignName: campaign.name,
      branding,
    }),
  }).catch(() => {});

  return actionSuccess({ applicantId: applicant.id });
});

export const verifyOtpAction = safeAction(async function verifyOtpAction(
  input: VerifyOtpInput,
): Promise<ActionResult<{ accessToken: string; applicationNumber: string }>> {
  const parsed = verifyOtpSchema.safeParse(input);
  if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? 'Validation failed');

  const rl = checkRateLimit(`admission:otp:${parsed.data.applicantId}`, RATE_LIMITS.ADMISSION_OTP_VERIFY);
  if (!rl.allowed) return actionError('Too many verification attempts. Please try again later.');

  const applicant = await prisma.applicant.findUnique({
    where: { id: parsed.data.applicantId },
    include: { campaign: { select: { name: true } } },
  });
  if (!applicant) return actionError(ADMISSION_ERRORS.APPLICANT_NOT_FOUND);
  if (applicant.status !== 'REGISTERED') return actionError(ADMISSION_ERRORS.ALREADY_VERIFIED);

  if (applicant.otpAttempts >= ADMISSION_OTP_MAX_ATTEMPTS) {
    return actionError(ADMISSION_ERRORS.OTP_MAX_ATTEMPTS);
  }

  if (!applicant.otpExpiresAt || new Date() > applicant.otpExpiresAt) {
    return actionError(ADMISSION_ERRORS.OTP_EXPIRED);
  }

  const isDevBypass = process.env.NODE_ENV === 'development' && parsed.data.otp === '000000';
  if (!isDevBypass && !verifyToken(parsed.data.otp, applicant.emailOtp ?? '')) {
    await prisma.applicant.update({
      where: { id: applicant.id },
      data: { otpAttempts: { increment: 1 } },
    });
    return actionError(ADMISSION_ERRORS.INVALID_OTP);
  }

  const newRawToken = generateAccessToken();
  const newTokenHash = hashToken(newRawToken);

  await prisma.applicant.update({
    where: { id: applicant.id },
    data: {
      status: 'VERIFIED',
      isEmailVerified: true,
      emailOtp: null,
      otpExpiresAt: null,
      otpAttempts: 0,
      accessToken: newTokenHash,
    },
  });

  const branding = await getSchoolBranding();
  sendEmail({
    to: applicant.email,
    subject: ADMISSION_EMAIL_SUBJECTS['applicant-verified'](applicant.campaign.name),
    html: applicantVerifiedEmail({
      firstName: applicant.firstName,
      applicationNumber: applicant.applicationNumber,
      campaignName: applicant.campaign.name,
      branding,
    }),
  }).catch(() => {});

  return actionSuccess({ accessToken: newRawToken, applicationNumber: applicant.applicationNumber });
});

export const resendOtpAction = safeAction(async function resendOtpAction(
  input: ResendOtpInput,
): Promise<ActionResult> {
  const parsed = resendOtpSchema.safeParse(input);
  if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? 'Validation failed');

  const rl = checkRateLimit(`admission:resend:${parsed.data.applicantId}`, RATE_LIMITS.ADMISSION_OTP_RESEND);
  if (!rl.allowed) return actionError('Too many OTP requests. Please try again later.');

  const applicant = await prisma.applicant.findUnique({
    where: { id: parsed.data.applicantId },
    include: { campaign: { select: { name: true } } },
  });
  if (!applicant) return actionError(ADMISSION_ERRORS.APPLICANT_NOT_FOUND);
  if (applicant.status !== 'REGISTERED') return actionError(ADMISSION_ERRORS.ALREADY_VERIFIED);

  const otp = generateOtp(ADMISSION_OTP_LENGTH);
  const otpExpiry = new Date(Date.now() + ADMISSION_OTP_EXPIRY_MS);

  await prisma.applicant.update({
    where: { id: applicant.id },
    data: { emailOtp: hashToken(otp.toString()), otpExpiresAt: otpExpiry },
  });

  if (process.env.NODE_ENV === 'development') {
    console.log(`\n[DEV] Resent OTP for ${applicant.email}: ${otp}\n`);
  }

  const branding = await getSchoolBranding();
  sendEmail({
    to: applicant.email,
    subject: ADMISSION_EMAIL_SUBJECTS['applicant-otp'](applicant.campaign.name),
    html: applicantOtpEmail({
      firstName: applicant.firstName,
      otp: otp.toString(),
      campaignName: applicant.campaign.name,
      branding,
    }),
  }).catch(() => {});

  return actionSuccess();
});
