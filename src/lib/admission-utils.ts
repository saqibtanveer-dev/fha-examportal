import { randomBytes, createHash, randomInt } from 'crypto';
import { ADMISSION_ACCESS_TOKEN_BYTES, ADMISSION_OTP_LENGTH } from '@/lib/constants';

/**
 * Generate a cryptographically secure access token.
 * Returns raw token (sent to applicant) — store SHA-256 hash in DB.
 */
export function generateAccessToken(): string {
  return randomBytes(ADMISSION_ACCESS_TOKEN_BYTES).toString('hex');
}

/**
 * Hash a token for secure storage.
 */
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/**
 * Verify a raw token against a stored hash.
 */
export function verifyToken(rawToken: string, storedHash: string): boolean {
  const hash = hashToken(rawToken);
  // Constant-time comparison to prevent timing attacks
  if (hash.length !== storedHash.length) return false;
  let result = 0;
  for (let i = 0; i < hash.length; i++) {
    result |= hash.charCodeAt(i) ^ storedHash.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Generate a numeric OTP of specified length.
 */
export function generateOtp(length = ADMISSION_OTP_LENGTH): string {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return randomInt(min, max + 1).toString();
}

/**
 * Generate a human-readable application number.
 * Format: ADM-YYYY-NNNN
 */
export function generateApplicationNumber(prefix: string, year: number, sequence: number): string {
  return `${prefix}-${year}-${String(sequence).padStart(4, '0')}`;
}

/**
 * Sanitize a string to prevent XSS.
 * Trims, strips angle brackets, limits length.
 */
export function sanitizeString(input: string, maxLength = 500): string {
  return input
    .trim()
    .replace(/[<>]/g, '')
    .slice(0, maxLength);
}
