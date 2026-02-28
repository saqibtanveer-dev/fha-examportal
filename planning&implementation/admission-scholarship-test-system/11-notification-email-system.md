# Admission Test & Scholarship Test — Notification & Email System

> **Date:** February 28, 2026
> **Scope:** Email templates, notification triggers, delivery pipeline, OTP flow

---

## 1. Notification Events Map

### Applicant-Facing Notifications (Email)

| Event | Trigger | Email Template | Priority |
|-------|---------|---------------|----------|
| Registration Confirmation | After registration + OTP sent | `applicant-registered` | P0 |
| OTP Code | Registration / resend | `applicant-otp` | P0 |
| Email Verified | After OTP verification | `applicant-verified` | P1 |
| Test Access Link | Campaign enters TEST_ACTIVE | `test-access-link` | P0 |
| Test Reminder | 24h before test window closes | `test-reminder` | P1 |
| Test Submitted | After test submission | `test-submitted` | P1 |
| Result Published | Admin publishes results | `result-published` | P0 |
| Scholarship Offered | Scholarship assigned | `scholarship-offered` | P0 |
| Scholarship Declined Cascade | Previous recipient declined | `scholarship-offered` | P0 |
| Admission Accepted | Decision = ACCEPTED | `decision-accepted` | P0 |
| Admission Rejected | Decision = REJECTED | `decision-rejected` | P0 |
| Waitlisted | Decision = WAITLISTED | `decision-waitlisted` | P1 |
| Waitlist Promoted | Moved from waitlist to accepted | `waitlist-promoted` | P0 |
| Enrollment Welcome | Converted to student | `enrollment-welcome` | P0 |

### Admin-Facing Notifications (In-App)

| Event | Trigger | Notification Type |
|-------|---------|------------------|
| Registration Milestone | Every 50 registrations | SYSTEM |
| Campaign Registration Closed | Auto/manual close | SYSTEM |
| Test Phase Started | Campaign enters TEST_ACTIVE | SYSTEM |
| All Tests Graded | Batch grading complete | SYSTEM |
| Scholarship Declined | Applicant declines scholarship | ALERT |
| Security Alert | Suspicious activity detected | ALERT |
| Bulk Enrollment Complete | Batch enrollment done | SYSTEM |

---

## 2. Email Template Design

### Base Template Structure

```typescript
// src/lib/email-templates/base.ts

export function baseTemplate(content: string, schoolName: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Segoe UI', Tahoma, sans-serif; margin: 0; padding: 0; background: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
    .header { background: #1a1a2e; color: white; padding: 24px; text-align: center; }
    .header h1 { margin: 0; font-size: 20px; }
    .content { padding: 32px 24px; }
    .footer { background: #f5f5f5; padding: 16px 24px; text-align: center; font-size: 12px; color: #666; }
    .btn { display: inline-block; padding: 12px 32px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; font-weight: 600; }
    .otp-box { background: #f0f4ff; border: 2px dashed #2563eb; padding: 16px; text-align: center; font-size: 32px; letter-spacing: 8px; font-weight: bold; margin: 24px 0; }
    .info-box { background: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px 16px; margin: 16px 0; }
    .warn-box { background: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px 16px; margin: 16px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${schoolName}</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>This is an automated email from ${schoolName} Admission Portal.</p>
      <p>Please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>`;
}
```

### Template: OTP Verification

```typescript
export function otpTemplate(data: {
  name: string;
  campaignName: string;
  otp: string;
  expiresIn: string;
}): string {
  return `
    <h2>Email Verification</h2>
    <p>Dear ${data.name},</p>
    <p>Thank you for registering for <strong>${data.campaignName}</strong>.</p>
    <p>Please use the following OTP to verify your email address:</p>
    
    <div class="otp-box">${data.otp}</div>
    
    <p>This code expires in <strong>${data.expiresIn}</strong>.</p>
    
    <div class="warn-box">
      <strong>Important:</strong> Do not share this code with anyone.
    </div>
  `;
}
```

### Template: Test Access Link

```typescript
export function testAccessTemplate(data: {
  name: string;
  campaignName: string;
  testDate: string;
  testEndDate: string;
  duration: string;
  accessUrl: string;
  registrationNumber: string;
}): string {
  return `
    <h2>Your Test is Ready!</h2>
    <p>Dear ${data.name},</p>
    <p>The test for <strong>${data.campaignName}</strong> is now available.</p>
    
    <div class="info-box">
      <p><strong>Registration No:</strong> ${data.registrationNumber}</p>
      <p><strong>Test Window:</strong> ${data.testDate} — ${data.testEndDate}</p>
      <p><strong>Duration:</strong> ${data.duration}</p>
    </div>
    
    <p>Click the button below to start your test:</p>
    <p style="text-align: center; margin: 24px 0;">
      <a href="${data.accessUrl}" class="btn">Start Test</a>
    </p>
    
    <div class="warn-box">
      <strong>Important:</strong>
      <ul style="margin: 8px 0;">
        <li>Ensure stable internet connection before starting</li>
        <li>Once started, the timer cannot be paused</li>
        <li>Do not refresh or close the browser during the test</li>
        <li>Your answers are auto-saved periodically</li>
      </ul>
    </div>
  `;
}
```

### Template: Result Published

```typescript
export function resultPublishedTemplate(data: {
  name: string;
  campaignName: string;
  resultUrl: string;
  registrationNumber: string;
}): string {
  return `
    <h2>Results Are Out!</h2>
    <p>Dear ${data.name},</p>
    <p>The results for <strong>${data.campaignName}</strong> have been published.</p>
    
    <p>Click the button below to view your result:</p>
    <p style="text-align: center; margin: 24px 0;">
      <a href="${data.resultUrl}" class="btn">View My Result</a>
    </p>
    
    <p style="font-size: 13px; color: #666;">
      Registration No: ${data.registrationNumber}
    </p>
  `;
}
```

### Template: Admission Decision

```typescript
export function decisionAcceptedTemplate(data: {
  name: string;
  campaignName: string;
  scholarshipTier?: string;
  nextSteps: string;
  deadline?: string;
}): string {
  return `
    <h2>Congratulations! 🎉</h2>
    <p>Dear ${data.name},</p>
    <p>We are pleased to inform you that you have been <strong>accepted</strong> for admission through <strong>${data.campaignName}</strong>.</p>
    
    ${data.scholarshipTier ? `
    <div class="info-box">
      <strong>🏆 Scholarship Awarded:</strong> ${data.scholarshipTier}
    </div>
    ` : ''}
    
    <h3>Next Steps</h3>
    <p>${data.nextSteps}</p>
    
    ${data.deadline ? `
    <div class="warn-box">
      <strong>Deadline:</strong> Please complete enrollment by ${data.deadline}.
    </div>
    ` : ''}
  `;
}

export function decisionRejectedTemplate(data: {
  name: string;
  campaignName: string;
}): string {
  return `
    <h2>Application Update</h2>
    <p>Dear ${data.name},</p>
    <p>Thank you for participating in <strong>${data.campaignName}</strong>.</p>
    <p>After careful review, we regret to inform you that we are unable to offer you admission at this time.</p>
    <p>We wish you the best in your future academic endeavors.</p>
  `;
}

export function decisionWaitlistedTemplate(data: {
  name: string;
  campaignName: string;
  waitlistPosition?: number;
}): string {
  return `
    <h2>Waitlist Notification</h2>
    <p>Dear ${data.name},</p>
    <p>You have been placed on the <strong>waitlist</strong> for <strong>${data.campaignName}</strong>.</p>
    ${data.waitlistPosition ? `<p>Your waitlist position: <strong>#${data.waitlistPosition}</strong></p>` : ''}
    <p>We will notify you if a seat becomes available.</p>
  `;
}
```

### Template: Enrollment Welcome

```typescript
export function enrollmentWelcomeTemplate(data: {
  name: string;
  schoolName: string;
  className: string;
  rollNumber?: string;
  loginEmail: string;
  temporaryPassword: string;
  dashboardUrl: string;
}): string {
  return `
    <h2>Welcome to ${data.schoolName}!</h2>
    <p>Dear ${data.name},</p>
    <p>Your enrollment is complete. Welcome to <strong>${data.className}</strong>!</p>
    
    <div class="info-box">
      <h3 style="margin-top: 0;">Your Login Credentials</h3>
      <p><strong>Email:</strong> ${data.loginEmail}</p>
      <p><strong>Temporary Password:</strong> ${data.temporaryPassword}</p>
      ${data.rollNumber ? `<p><strong>Roll Number:</strong> ${data.rollNumber}</p>` : ''}
    </div>
    
    <p style="text-align: center; margin: 24px 0;">
      <a href="${data.dashboardUrl}" class="btn">Login to Student Dashboard</a>
    </p>
    
    <div class="warn-box">
      <strong>Important:</strong> Please change your password after first login.
    </div>
  `;
}
```

---

## 3. Email Sending Service

### Integration with Existing Email System

```typescript
// src/lib/email.ts — extend existing

import { Resend } from 'resend';
import { baseTemplate } from './email-templates/base';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.EMAIL_FROM ?? 'noreply@school.edu.pk';
const SCHOOL_NAME = process.env.SCHOOL_NAME ?? 'ExamCore School';

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
  tags?: { name: string; value: string }[];
}

export async function sendEmail(options: SendEmailOptions): Promise<{ id: string }> {
  const wrappedHtml = baseTemplate(options.html, SCHOOL_NAME);
  
  const { data, error } = await resend.emails.send({
    from: `${SCHOOL_NAME} <${FROM_EMAIL}>`,
    to: options.to,
    subject: options.subject,
    html: wrappedHtml,
    replyTo: options.replyTo,
    tags: options.tags,
  });
  
  if (error) {
    console.error('Email send failed:', error);
    throw new Error(`Email failed: ${error.message}`);
  }
  
  return { id: data!.id };
}

// Admission-specific email sender with rate limiting
export async function sendAdmissionEmail(
  to: string,
  template: string,
  data: Record<string, unknown>
): Promise<void> {
  // Rate limit: 10 emails per applicant per day
  const rateLimitKey = `email:${to}`;
  const limited = await checkRateLimit('email', rateLimitKey);
  if (limited.limited) {
    console.warn(`Email rate limit reached for ${to}`);
    return;
  }
  
  // Get template function
  const templateFn = EMAIL_TEMPLATES[template];
  if (!templateFn) {
    throw new Error(`Unknown email template: ${template}`);
  }
  
  const html = templateFn(data);
  const subject = EMAIL_SUBJECTS[template](data);
  
  await sendEmail({
    to,
    subject,
    html,
    tags: [
      { name: 'type', value: 'admission' },
      { name: 'template', value: template },
    ],
  });
}
```

### Template Registry

```typescript
// src/lib/email-templates/index.ts

import { otpTemplate } from './otp';
import { testAccessTemplate } from './test-access';
import { resultPublishedTemplate } from './result-published';
import { decisionAcceptedTemplate, decisionRejectedTemplate, decisionWaitlistedTemplate } from './decision';
import { enrollmentWelcomeTemplate } from './enrollment-welcome';
import { scholarshipOfferedTemplate } from './scholarship';

export const EMAIL_TEMPLATES: Record<string, (data: any) => string> = {
  'applicant-otp': otpTemplate,
  'applicant-verified': (data) => `<p>Dear ${data.name}, your email has been verified successfully!</p>`,
  'test-access-link': testAccessTemplate,
  'test-reminder': (data) => `<p>Dear ${data.name}, the test window for ${data.campaignName} closes in 24 hours.</p>`,
  'test-submitted': (data) => `<p>Dear ${data.name}, your test has been submitted successfully. Registration: ${data.registrationNumber}</p>`,
  'result-published': resultPublishedTemplate,
  'scholarship-offered': scholarshipOfferedTemplate,
  'decision-accepted': decisionAcceptedTemplate,
  'decision-rejected': decisionRejectedTemplate,
  'decision-waitlisted': decisionWaitlistedTemplate,
  'waitlist-promoted': (data) => decisionAcceptedTemplate({ ...data, isWaitlistPromotion: true }),
  'enrollment-welcome': enrollmentWelcomeTemplate,
};

export const EMAIL_SUBJECTS: Record<string, (data: any) => string> = {
  'applicant-otp': (d) => `Verify Your Email — ${d.campaignName}`,
  'applicant-verified': (d) => `Email Verified — ${d.campaignName}`,
  'test-access-link': (d) => `Your Test is Ready — ${d.campaignName}`,
  'test-reminder': (d) => `Test Reminder — ${d.campaignName}`,
  'test-submitted': (d) => `Test Submitted — ${d.campaignName}`,
  'result-published': (d) => `Results Published — ${d.campaignName}`,
  'scholarship-offered': (d) => `🏆 Scholarship Awarded — ${d.campaignName}`,
  'decision-accepted': (d) => `Congratulations! Admission Accepted — ${d.campaignName}`,
  'decision-rejected': (d) => `Application Update — ${d.campaignName}`,
  'decision-waitlisted': (d) => `Waitlist Notification — ${d.campaignName}`,
  'waitlist-promoted': (d) => `Great News! You've Been Accepted — ${d.campaignName}`,
  'enrollment-welcome': (d) => `Welcome to ${d.schoolName}!`,
};
```

---

## 4. Bulk Email Sending

### For Result Publication (hundreds of applicants)

```typescript
export async function sendBulkResultEmails(campaignId: string): Promise<{
  sent: number;
  failed: number;
}> {
  const campaign = await prisma.testCampaign.findUnique({
    where: { id: campaignId },
  });
  
  if (!campaign) throw new Error('Campaign not found');
  
  const applicants = await prisma.applicant.findMany({
    where: {
      campaignId,
      isEmailVerified: true,
      testSession: { status: 'COMPLETED' },
    },
    include: { result: true },
  });
  
  let sent = 0;
  let failed = 0;
  
  // Send in batches of 10 with 1s delay between batches
  // (Resend rate limit: 10 emails/second on free tier)
  const BATCH_SIZE = 10;
  
  for (let i = 0; i < applicants.length; i += BATCH_SIZE) {
    const batch = applicants.slice(i, i + BATCH_SIZE);
    
    const promises = batch.map(async (applicant) => {
      try {
        await sendAdmissionEmail(applicant.email, 'result-published', {
          name: applicant.firstName,
          campaignName: campaign.name,
          registrationNumber: applicant.registrationNumber,
          resultUrl: `${process.env.NEXT_PUBLIC_APP_URL}/results/${applicant.accessToken}`,
        });
        sent++;
      } catch (err) {
        console.error(`Failed to send result email to ${applicant.email}:`, err);
        failed++;
      }
    });
    
    await Promise.all(promises);
    
    // Delay between batches
    if (i + BATCH_SIZE < applicants.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return { sent, failed };
}
```

---

## 5. In-App Notification Integration

### Extending Existing Notification System

```typescript
// The existing system already has:
// - Notification model in Prisma
// - NotificationType enum (EXAM, RESULT, SYSTEM, ANNOUNCEMENT, GRADE)
// - notification-actions.ts with createNotification()

// We need to add ADMISSION to NotificationType enum:
// enum NotificationType { ...existing, ADMISSION }

// Admin notification triggers:
export async function notifyAdminCampaignEvent(
  event: 'REGISTRATION_MILESTONE' | 'GRADING_COMPLETE' | 'SCHOLARSHIP_DECLINED' | 'SECURITY_ALERT',
  data: Record<string, unknown>
) {
  const admins = await prisma.user.findMany({
    where: { role: 'ADMIN' },
    select: { id: true },
  });
  
  const titles: Record<string, string> = {
    REGISTRATION_MILESTONE: `${data.count} registrations for ${data.campaignName}`,
    GRADING_COMPLETE: `Grading complete for ${data.campaignName}`,
    SCHOLARSHIP_DECLINED: `Scholarship declined by ${data.applicantName}`,
    SECURITY_ALERT: `Security alert: ${data.alertType}`,
  };
  
  for (const admin of admins) {
    await prisma.notification.create({
      data: {
        userId: admin.id,
        title: titles[event] ?? 'Admission Update',
        message: JSON.stringify(data),
        type: 'ADMISSION',
      },
    });
  }
}
```

---

## 6. Email File Structure

```
src/lib/email-templates/
├── base.ts                    # Base HTML wrapper
├── index.ts                   # Template registry
├── applicant-otp.ts           # OTP email
├── test-access.ts             # Test link email
├── test-reminder.ts           # 24h reminder
├── result-published.ts        # Result notification
├── decision-accepted.ts       # Acceptance email
├── decision-rejected.ts       # Rejection email
├── decision-waitlisted.ts     # Waitlist notification
├── scholarship-offered.ts     # Scholarship award
├── enrollment-welcome.ts      # New student welcome
└── test-submitted.ts          # Confirmation
```
