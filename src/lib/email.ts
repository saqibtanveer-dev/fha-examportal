import { logger } from '@/lib/logger';

/**
 * Email utility — stub implementation.
 * Replace with a real provider (SendGrid, Resend, AWS SES, etc.)
 * when ready for production email delivery.
 */

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
};

export async function sendEmail(payload: EmailPayload): Promise<boolean> {
  // TODO: Replace with real email provider
  // Example with Resend:
  //   const { data, error } = await resend.emails.send({
  //     from: 'noreply@yourdomain.com',
  //     to: payload.to,
  //     subject: payload.subject,
  //     html: payload.html,
  //   });

  logger.info(
    { to: payload.to, subject: payload.subject },
    '[EMAIL STUB] Would send email:',
  );
  logger.info({ html: payload.html }, '[EMAIL STUB] Content:');

  return true;
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
