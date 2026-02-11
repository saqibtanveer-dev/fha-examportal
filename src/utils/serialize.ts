/**
 * Deep-serializes Prisma data for safe transfer from Server to Client Components.
 * Uses JSON round-trip to strip Decimal objects, functions, and other non-serializable values.
 */
export function serialize<T>(data: T): T {
  return JSON.parse(JSON.stringify(data, (_key, value) => {
    // Convert Decimal to number (has toJSON but we want plain number)
    if (value !== null && typeof value === 'object' && value.constructor?.name === 'Decimal') {
      return Number(value);
    }
    return value;
  }));
}
