import type { Decimal } from '@prisma/client/runtime/library';

/**
 * Recursively maps Prisma Decimal → number and Date → string in the type system,
 * so serialized data has correct types for client components.
 * Note: JSON.stringify converts Date objects to ISO strings.
 */
export type DeepSerialize<T> =
  T extends Decimal ? number :
  T extends Date ? string :
  T extends Array<infer U> ? DeepSerialize<U>[] :
  T extends object ? { [K in keyof T]: DeepSerialize<T[K]> } :
  T;

/**
 * Recursively converts Prisma Decimal instances to plain numbers BEFORE
 * JSON serialization. This is necessary because Decimal.toJSON() returns a
 * string, and JSON.stringify calls toJSON() before the replacer — so the
 * replacer never sees the Decimal object.
 */
function convertDecimals(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj;

  // Detect Prisma Decimal (has toFixed, d, e, s properties from decimal.js)
  if (typeof obj === 'object' && obj.constructor?.name === 'Decimal') {
    return Number(obj as Decimal);
  }

  if (obj instanceof Date) return obj;

  if (Array.isArray(obj)) {
    return obj.map(convertDecimals);
  }

  if (typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = convertDecimals(value);
    }
    return result;
  }

  return obj;
}

/**
 * Deep-serializes Prisma data for safe transfer from Server to Client Components.
 * 1. Pre-walks the object tree to convert Decimal → number (before toJSON fires).
 * 2. Uses JSON round-trip to strip remaining non-serializable values (functions, etc.)
 *    and convert Dates to ISO strings.
 */
export function serialize<T>(data: T): DeepSerialize<T> {
  const converted = convertDecimals(data);
  return JSON.parse(JSON.stringify(converted));
}
