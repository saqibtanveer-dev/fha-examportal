import { logger } from '@/lib/logger';
import { env } from '@/lib/env';
import nodemailer from 'nodemailer';

/**
 * Email utility with SMTP (Gmail) provider.
 * Falls back to stub (logging) when SMTP credentials are not configured.
 */

export type EmailPayload = {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
};

let _transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  if (_transporter) return _transporter;

  if (!env.EMAIL_HOST_USER || !env.EMAIL_HOST_PASSWORD) return null;

  _transporter = nodemailer.createTransport({
    host: env.EMAIL_HOST,
    port: env.EMAIL_PORT,
    secure: env.EMAIL_PORT === 465,
    auth: {
      user: env.EMAIL_HOST_USER,
      pass: env.EMAIL_HOST_PASSWORD,
    },
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    rateDelta: 1000,
    rateLimit: 10,
  });

  return _transporter;
}

export async function sendEmail(payload: EmailPayload): Promise<boolean> {
  const transporter = getTransporter();
  const fromAddress = payload.from ?? `${env.DEFAULT_FROM_NAME} <${env.DEFAULT_FROM_EMAIL}>`;

  if (!transporter) {
    logger.warn(
      { to: payload.to, subject: payload.subject },
      '[EMAIL STUB] No SMTP credentials configured. Email NOT sent.',
    );
    return true;
  }

  try {
    await transporter.sendMail({
      from: fromAddress,
      to: Array.isArray(payload.to) ? payload.to.join(', ') : payload.to,
      subject: payload.subject,
      html: payload.html,
      replyTo: payload.replyTo,
    });

    logger.info({ to: payload.to, subject: payload.subject }, 'Email sent successfully');
    return true;
  } catch (err) {
    logger.error({ err, to: payload.to }, 'Email send failed');
    return false;
  }
}

/**
 * Send multiple emails with batch delay to respect rate limits.
 */
export async function sendBulkEmails(
  payloads: EmailPayload[],
  batchSize = 10,
  delayMs = 1000,
): Promise<{ sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;

  for (let i = 0; i < payloads.length; i += batchSize) {
    const batch = payloads.slice(i, i + batchSize);
    const results = await Promise.allSettled(batch.map(sendEmail));

    for (const result of results) {
      if (result.status === 'fulfilled' && result.value) sent++;
      else failed++;
    }

    if (i + batchSize < payloads.length) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  return { sent, failed };
}

export function buildPasswordResetEmail(resetUrl: string): string {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Password Reset Request</h2>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <p><a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px;">Reset Password</a></p>
      <p style="color: #666; font-size: 14px;">This link expires in 1 hour. If you didn&apos;t request this, ignore this email.</p>
    </div>
  `;
}
