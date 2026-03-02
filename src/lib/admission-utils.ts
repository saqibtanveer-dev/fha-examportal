import { randomInt } from 'crypto';
import { ADMISSION_PIN_LENGTH } from '@/lib/constants';

/**
 * Generate a memorable numeric PIN for test access.
 * Returns a 6-digit number string (e.g., "847291").
 * Stored as plain text in DB — rate limiting prevents brute force.
 */
export function generateTestPin(length = ADMISSION_PIN_LENGTH): string {
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
