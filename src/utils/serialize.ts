import type { Decimal } from '@prisma/client/runtime/library';

/**
 * Recursively maps Prisma Decimal → number in the type system,
 * so serialized data has correct types for client components.
 */
export type DeepSerialize<T> =
  T extends Decimal ? number :
  T extends Date ? Date :
  T extends Array<infer U> ? DeepSerialize<U>[] :
  T extends object ? { [K in keyof T]: DeepSerialize<T[K]> } :
  T;

/**
 * Deep-serializes Prisma data for safe transfer from Server to Client Components.
 * Uses JSON round-trip to strip Decimal objects, functions, and other non-serializable values.
 */
export function serialize<T>(data: T): DeepSerialize<T> {
  return JSON.parse(JSON.stringify(data, (_key, value) => {
    // Convert Decimal to number (has toJSON but we want plain number)
    if (value !== null && typeof value === 'object' && value.constructor?.name === 'Decimal') {
      return Number(value);
    }
    return value;
  }));
}
