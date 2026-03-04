/**
 * Applicant lifecycle email templates.
 * OTP, verification, test access, submission, and result publication.
 */

import { baseEmailTemplate, emailButton, emailInfoTable } from './base';

type SchoolBranding = {
  schoolName: string;
  primaryColor?: string;
};

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
