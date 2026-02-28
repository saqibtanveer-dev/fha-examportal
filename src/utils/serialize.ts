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

  if (typeof obj !== 'object') return obj;

  // Detect Prisma Decimal by structural signature.
  // Prisma minifies the Decimal class (constructor.name becomes "i"),
  // so we detect by the {s, e, d} shape + toFixed method from decimal.js.
  if (isDecimalLike(obj)) {
    return Number(obj as Decimal);
  }

  if (obj instanceof Date) return obj;

  if (Array.isArray(obj)) {
    return obj.map(convertDecimals);
  }

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    result[key] = convertDecimals(value);
  }
  return result;
}

/** Detect decimal.js objects by their internal structure: {s, e, d} + toFixed */
function isDecimalLike(obj: unknown): boolean {
  if (typeof obj !== 'object' || obj === null) return false;
  return (
    'd' in obj &&
    'e' in obj &&
    's' in obj &&
    typeof (obj as Record<string, unknown>).toFixed === 'function'
  );
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
