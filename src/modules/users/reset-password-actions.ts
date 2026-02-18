'use server';

import { prisma } from '@/lib/prisma';
import { sendEmail, buildPasswordResetEmail } from '@/lib/email';
import { forgotPasswordSchema, resetPasswordSchema } from '@/validations/password-schemas';
import { logger } from '@/lib/logger';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import type { ActionResult } from '@/types/action-result';

const RESET_TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

/** Hash a reset token before storing — prevents token theft from DB leaks */
function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/* ─── Request Password Reset ─── */

export async function forgotPasswordAction(
  formData: { email: string },
): Promise<ActionResult> {
  const parsed = forgotPasswordSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: 'Invalid email address' };
  }

  const { email } = parsed.data;

  // Rate limit password reset requests
  const rateLimit = checkRateLimit(`reset:${email.toLowerCase()}`, RATE_LIMITS.PASSWORD_RESET);
  if (!rateLimit.allowed) {
    // Return success to prevent enumeration, but don't actually send
    return { success: true };
  }

  // Always return success to prevent email enumeration
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { success: true };
  }

  // Delete existing tokens for this email
  await prisma.passwordResetToken.deleteMany({ where: { email } });

  // Generate token — store hash, send plaintext in email
  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_MS);

  await prisma.passwordResetToken.create({
    data: { email, token: tokenHash, expiresAt },
  });

  // Build reset URL with plaintext token
  const baseUrl = process.env.NEXTAUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const resetUrl = `${baseUrl}/login/reset-password?token=${token}`;

  try {
    await sendEmail({
      to: email,
      subject: 'Password Reset Request',
      html: buildPasswordResetEmail(resetUrl),
    });
  } catch (err) {
    logger.error({ err, email }, 'Failed to send password reset email');
  }

  return { success: true };
}

/* ─── Execute Password Reset ─── */

export async function resetPasswordAction(
  formData: { token: string; newPassword: string; confirmPassword: string },
): Promise<ActionResult> {
  const parsed = resetPasswordSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  }

  const { token, newPassword } = parsed.data;

  // Hash the incoming token and look up by hash
  const tokenHash = hashToken(token);
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token: tokenHash },
  });

  if (!resetToken) {
    return { success: false, error: 'Invalid or expired reset link' };
  }

  if (resetToken.expiresAt < new Date()) {
    await prisma.passwordResetToken.delete({ where: { id: resetToken.id } });
    return { success: false, error: 'Reset link has expired. Please request a new one.' };
  }

  const user = await prisma.user.findUnique({
    where: { email: resetToken.email },
  });

  if (!user) {
    return { success: false, error: 'User not found' };
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: hashedPassword },
    }),
    prisma.passwordResetToken.delete({ where: { id: resetToken.id } }),
  ]);

  return { success: true };
}
