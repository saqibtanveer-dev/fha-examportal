/**
 * Admission email template registry.
 * All admission-related email templates and subjects.
 */

import { baseEmailTemplate, emailButton, emailInfoTable } from './base';

type SchoolBranding = {
  schoolName: string;
  primaryColor?: string;
};

// ============================================
// OTP Verification
// ============================================

export function applicantOtpEmail(params: {
  firstName: string;
  otp: string;
  campaignName: string;
  branding: SchoolBranding;
}): string {
  return baseEmailTemplate({
    schoolName: params.branding.schoolName,
    primaryColor: params.branding.primaryColor,
    content: `
      <h2 style="margin: 0 0 16px; color: #111827; font-size: 20px;">Verify Your Email</h2>
      <p style="color: #374151; font-size: 15px; line-height: 1.6;">
        Dear ${params.firstName},
      </p>
      <p style="color: #374151; font-size: 15px; line-height: 1.6;">
        Thank you for registering for <strong>${params.campaignName}</strong>. Please use the following code to verify your email address:
      </p>
      <div style="text-align: center; margin: 24px 0;">
        <span style="display: inline-block; padding: 16px 40px; background-color: #f3f4f6; border-radius: 8px; font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #111827;">
          ${params.otp}
        </span>
      </div>
      <p style="color: #6b7280; font-size: 13px;">This code expires in 10 minutes. Do not share it with anyone.</p>
    `,
  });
}

// ============================================
// Registration Confirmed (after OTP)
// ============================================

export function applicantVerifiedEmail(params: {
  firstName: string;
  applicationNumber: string;
  campaignName: string;
  testDate?: string;
  branding: SchoolBranding;
}): string {
  const rows = [
    { label: 'Application No:', value: params.applicationNumber },
    { label: 'Campaign:', value: params.campaignName },
  ];
  if (params.testDate) rows.push({ label: 'Test Date:', value: params.testDate });

  return baseEmailTemplate({
    schoolName: params.branding.schoolName,
    primaryColor: params.branding.primaryColor,
    content: `
      <h2 style="margin: 0 0 16px; color: #111827; font-size: 20px;">Registration Confirmed ✓</h2>
      <p style="color: #374151; font-size: 15px; line-height: 1.6;">
        Dear ${params.firstName},
      </p>
      <p style="color: #374151; font-size: 15px; line-height: 1.6;">
        Your email has been verified and your application is confirmed. Here are your details:
      </p>
      ${emailInfoTable(rows)}
      <p style="color: #374151; font-size: 15px; line-height: 1.6;">
        Please save your application number. You will receive a test access link when the test window opens.
      </p>
    `,
  });
}

// ============================================
// Test Access Link
// ============================================

export function testAccessLinkEmail(params: {
  firstName: string;
  campaignName: string;
  testUrl: string;
  testStartAt: string;
  testEndAt: string;
  duration: number;
  branding: SchoolBranding;
}): string {
  return baseEmailTemplate({
    schoolName: params.branding.schoolName,
    primaryColor: params.branding.primaryColor,
    content: `
      <h2 style="margin: 0 0 16px; color: #111827; font-size: 20px;">Your Test is Ready</h2>
      <p style="color: #374151; font-size: 15px; line-height: 1.6;">
        Dear ${params.firstName},
      </p>
      <p style="color: #374151; font-size: 15px; line-height: 1.6;">
        The test for <strong>${params.campaignName}</strong> is now available. Click the link below to start your test.
      </p>
      ${emailInfoTable([
        { label: 'Test Window:', value: `${params.testStartAt} — ${params.testEndAt}` },
        { label: 'Duration:', value: `${params.duration} minutes` },
      ])}
      ${emailButton('Start Test', params.testUrl)}
      <p style="color: #dc2626; font-size: 13px; font-weight: 500;">
        ⚠ This link is unique to you. Do not share it with anyone.
      </p>
      <p style="color: #6b7280; font-size: 13px;">
        Ensure a stable internet connection and a quiet environment before starting.
      </p>
    `,
  });
}

// ============================================
// Test Submitted
// ============================================

export function testSubmittedEmail(params: {
  firstName: string;
  campaignName: string;
  applicationNumber: string;
  branding: SchoolBranding;
}): string {
  return baseEmailTemplate({
    schoolName: params.branding.schoolName,
    primaryColor: params.branding.primaryColor,
    content: `
      <h2 style="margin: 0 0 16px; color: #111827; font-size: 20px;">Test Submitted Successfully</h2>
      <p style="color: #374151; font-size: 15px; line-height: 1.6;">
        Dear ${params.firstName},
      </p>
      <p style="color: #374151; font-size: 15px; line-height: 1.6;">
        Your test for <strong>${params.campaignName}</strong> has been submitted successfully. Your results will be available once the evaluation is complete.
      </p>
      ${emailInfoTable([
        { label: 'Application No:', value: params.applicationNumber },
      ])}
      <p style="color: #6b7280; font-size: 13px;">You will receive an email when results are published.</p>
    `,
  });
}

// ============================================
// Result Published
// ============================================

export function resultPublishedEmail(params: {
  firstName: string;
  campaignName: string;
  resultUrl: string;
  isPassed: boolean;
  percentage: number;
  rank?: number;
  branding: SchoolBranding;
}): string {
  const statusText = params.isPassed ? '🎉 Congratulations!' : 'Thank you for participating.';
  const statusColor = params.isPassed ? '#16a34a' : '#6b7280';

  const rows = [
    { label: 'Score:', value: `${params.percentage.toFixed(1)}%` },
  ];
  if (params.rank) rows.push({ label: 'Rank:', value: `#${params.rank}` });

  return baseEmailTemplate({
    schoolName: params.branding.schoolName,
    primaryColor: params.branding.primaryColor,
    content: `
      <h2 style="margin: 0 0 16px; color: #111827; font-size: 20px;">Results Published</h2>
      <p style="color: #374151; font-size: 15px; line-height: 1.6;">
        Dear ${params.firstName},
      </p>
      <p style="color: ${statusColor}; font-size: 16px; font-weight: 600;">${statusText}</p>
      <p style="color: #374151; font-size: 15px; line-height: 1.6;">
        The results for <strong>${params.campaignName}</strong> have been published.
      </p>
      ${emailInfoTable(rows)}
      ${emailButton('View Full Result', params.resultUrl)}
    `,
  });
}

// ============================================
// Decision Emails
// ============================================

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

// ============================================
// Scholarship Offered
// ============================================

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

// ============================================
// Waitlist Promoted
// ============================================

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

// ============================================
// Enrollment Welcome
// ============================================

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

// ============================================
// Subject Map & Factory
// ============================================

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
