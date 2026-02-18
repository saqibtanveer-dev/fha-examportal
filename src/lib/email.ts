import { logger } from '@/lib/logger';

/**
 * Email utility with Resend provider support.
 * Falls back to stub (logging) when RESEND_API_KEY is not configured.
 * 
 * To enable real email delivery:
 * 1. Sign up at https://resend.com
 * 2. Add RESEND_API_KEY and EMAIL_FROM to your .env
 */

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
};

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM ?? 'ExamCore <noreply@examcore.app>';

export async function sendEmail(payload: EmailPayload): Promise<boolean> {
  // If no API key configured, use stub mode (dev/testing)
  if (!RESEND_API_KEY) {
    logger.warn(
      { to: payload.to, subject: payload.subject },
      '[EMAIL STUB] No RESEND_API_KEY configured. Email NOT sent. Set RESEND_API_KEY in .env for production.',
    );
    return true;
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      logger.error(
        { status: response.status, body: errorBody, to: payload.to },
        'Failed to send email via Resend',
      );
      return false;
    }

    logger.info({ to: payload.to, subject: payload.subject }, 'Email sent successfully');
    return true;
  } catch (err) {
    logger.error({ err, to: payload.to }, 'Email send failed with exception');
    return false;
  }
}

export function buildPasswordResetEmail(resetUrl: string): string {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Password Reset Request</h2>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <p><a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px;">Reset Password</a></p>
      <p style="color: #666; font-size: 14px;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
    </div>
  `;
}
