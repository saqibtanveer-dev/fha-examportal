/**
 * Admission decision & outcome email templates.
 * Acceptance, rejection, waitlist, scholarship, enrollment.
 */

import { baseEmailTemplate, emailButton, emailInfoTable } from './base';

type SchoolBranding = {
  schoolName: string;
  primaryColor?: string;
};

export function decisionAcceptedEmail(params: {
  firstName: string;
  campaignName: string;
  conditions?: string;
  nextSteps?: string;
  branding: SchoolBranding;
}): string {
  return baseEmailTemplate({
    schoolName: params.branding.schoolName,
    primaryColor: params.branding.primaryColor,
    content: `
      <h2 style="margin: 0 0 16px; color: #16a34a; font-size: 20px;">🎉 Admission Accepted!</h2>
      <p style="color: #374151; font-size: 15px; line-height: 1.6;">
        Dear ${params.firstName},
      </p>
      <p style="color: #374151; font-size: 15px; line-height: 1.6;">
        We are pleased to inform you that you have been <strong style="color: #16a34a;">accepted</strong> for <strong>${params.campaignName}</strong>.
      </p>
      ${params.conditions ? `<p style="color: #374151; font-size: 14px;"><strong>Conditions:</strong> ${params.conditions}</p>` : ''}
      ${params.nextSteps ? `<p style="color: #374151; font-size: 14px;"><strong>Next Steps:</strong> ${params.nextSteps}</p>` : ''}
      <p style="color: #6b7280; font-size: 13px;">Please complete the enrollment process at the earliest.</p>
    `,
  });
}

export function decisionRejectedEmail(params: {
  firstName: string;
  campaignName: string;
  remarks?: string;
  branding: SchoolBranding;
}): string {
  return baseEmailTemplate({
    schoolName: params.branding.schoolName,
    primaryColor: params.branding.primaryColor,
    content: `
      <h2 style="margin: 0 0 16px; color: #111827; font-size: 20px;">Application Update</h2>
      <p style="color: #374151; font-size: 15px; line-height: 1.6;">
        Dear ${params.firstName},
      </p>
      <p style="color: #374151; font-size: 15px; line-height: 1.6;">
        After careful evaluation, we regret to inform you that your application for <strong>${params.campaignName}</strong> has not been successful.
      </p>
      ${params.remarks ? `<p style="color: #6b7280; font-size: 14px;">${params.remarks}</p>` : ''}
      <p style="color: #374151; font-size: 15px; line-height: 1.6;">We appreciate your interest and wish you the best in your future endeavors.</p>
    `,
  });
}

export function decisionWaitlistedEmail(params: {
  firstName: string;
  campaignName: string;
  waitlistPosition?: number;
  branding: SchoolBranding;
}): string {
  return baseEmailTemplate({
    schoolName: params.branding.schoolName,
    primaryColor: params.branding.primaryColor,
    content: `
      <h2 style="margin: 0 0 16px; color: #d97706; font-size: 20px;">⏳ Waitlisted</h2>
      <p style="color: #374151; font-size: 15px; line-height: 1.6;">
        Dear ${params.firstName},
      </p>
      <p style="color: #374151; font-size: 15px; line-height: 1.6;">
        You have been placed on the waitlist for <strong>${params.campaignName}</strong>.
        ${params.waitlistPosition ? `Your current position is <strong>#${params.waitlistPosition}</strong>.` : ''}
      </p>
      <p style="color: #374151; font-size: 15px; line-height: 1.6;">You will be notified if a seat becomes available.</p>
    `,
  });
}

export function scholarshipOfferedEmail(params: {
  firstName: string;
  campaignName: string;
  tierName: string;
  percentage: number;
  benefitDetails?: string;
  responseUrl?: string;
  branding: SchoolBranding;
}): string {
  return baseEmailTemplate({
    schoolName: params.branding.schoolName,
    primaryColor: params.branding.primaryColor,
    content: `
      <h2 style="margin: 0 0 16px; color: #7c3aed; font-size: 20px;">🎓 Scholarship Awarded!</h2>
      <p style="color: #374151; font-size: 15px; line-height: 1.6;">
        Dear ${params.firstName},
      </p>
      <p style="color: #374151; font-size: 15px; line-height: 1.6;">
        Based on your outstanding performance in <strong>${params.campaignName}</strong>, you have been awarded the following scholarship:
      </p>
      ${emailInfoTable([
        { label: 'Scholarship:', value: params.tierName },
        { label: 'Benefit:', value: `${params.percentage}% tuition waiver` },
        ...(params.benefitDetails ? [{ label: 'Details:', value: params.benefitDetails }] : []),
      ])}
      ${params.responseUrl ? emailButton('Respond to Scholarship', params.responseUrl, '#7c3aed') : ''}
    `,
  });
}

export function waitlistPromotedEmail(params: {
  firstName: string;
  campaignName: string;
  branding: SchoolBranding;
}): string {
  return baseEmailTemplate({
    schoolName: params.branding.schoolName,
    primaryColor: params.branding.primaryColor,
    content: `
      <h2 style="margin: 0 0 16px; color: #16a34a; font-size: 20px;">🎉 You Have Been Accepted!</h2>
      <p style="color: #374151; font-size: 15px; line-height: 1.6;">
        Dear ${params.firstName},
      </p>
      <p style="color: #374151; font-size: 15px; line-height: 1.6;">
        Great news! A seat has become available and you have been moved from the waitlist to <strong style="color: #16a34a;">accepted</strong> for <strong>${params.campaignName}</strong>.
      </p>
      <p style="color: #374151; font-size: 15px; line-height: 1.6;">Please complete the enrollment process at the earliest to secure your seat.</p>
    `,
  });
}

export function enrollmentWelcomeEmail(params: {
  firstName: string;
  lastName: string;
  email: string;
  temporaryPassword: string;
  className: string;
  loginUrl: string;
  branding: SchoolBranding;
}): string {
  return baseEmailTemplate({
    schoolName: params.branding.schoolName,
    primaryColor: params.branding.primaryColor,
    content: `
      <h2 style="margin: 0 0 16px; color: #16a34a; font-size: 20px;">Welcome to ${params.branding.schoolName}!</h2>
      <p style="color: #374151; font-size: 15px; line-height: 1.6;">
        Dear ${params.firstName} ${params.lastName},
      </p>
      <p style="color: #374151; font-size: 15px; line-height: 1.6;">
        Congratulations! You have been enrolled as a student. Below are your login credentials:
      </p>
      ${emailInfoTable([
        { label: 'Email:', value: params.email },
        { label: 'Password:', value: params.temporaryPassword },
        { label: 'Class:', value: params.className },
      ])}
      <p style="color: #dc2626; font-size: 13px; font-weight: 500;">
        ⚠ Please change your password after your first login.
      </p>
      ${emailButton('Login to Portal', params.loginUrl)}
    `,
  });
}

export const ADMISSION_EMAIL_SUBJECTS = {
  'applicant-otp': (campaign: string) => `Verification Code - ${campaign}`,
  'applicant-verified': (campaign: string) => `Registration Confirmed - ${campaign}`,
  'test-access-link': (campaign: string) => `Your Test is Ready - ${campaign}`,
  'test-submitted': (campaign: string) => `Test Submitted - ${campaign}`,
  'result-published': (campaign: string) => `Results Published - ${campaign}`,
  'decision-accepted': (campaign: string) => `Admission Accepted - ${campaign}`,
  'decision-rejected': (campaign: string) => `Application Update - ${campaign}`,
  'decision-waitlisted': (campaign: string) => `Application Waitlisted - ${campaign}`,
  'scholarship-offered': (campaign: string) => `Scholarship Awarded - ${campaign}`,
  'waitlist-promoted': (campaign: string) => `You Have Been Accepted - ${campaign}`,
  'enrollment-welcome': () => `Welcome - Your Student Account is Ready`,
} as const;

export type AdmissionEmailTemplate = keyof typeof ADMISSION_EMAIL_SUBJECTS;
