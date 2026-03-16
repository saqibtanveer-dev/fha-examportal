import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

type Tx = Prisma.TransactionClient;

const SERIALIZATION_ERROR_CODES = new Set(['P2034', 'P2028']);

function isRetriableSerializationError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  if (!('code' in error)) return false;
  const code = (error as { code?: string }).code;
  return !!code && SERIALIZATION_ERROR_CODES.has(code);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/**
 * Acquire deterministic transaction-scoped advisory locks.
 * Keys are sorted and de-duplicated to avoid deadlock from lock-order inversion.
 */
export async function lockTransactionKeys(tx: Tx, keys: string[]): Promise<void> {
  const uniqueSortedKeys = [...new Set(keys.filter(Boolean))].sort();
  for (const key of uniqueSortedKeys) {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${key}))`;
  }
}

/**
 * Run a transaction under SERIALIZABLE isolation with bounded retry on serialization conflicts.
 */
export async function runSerializableTransaction<T>(
  operation: (tx: Tx) => Promise<T>,
  maxRetries = 3,
  transactionOptions?: { timeout?: number; maxWait?: number },
): Promise<T> {
  let attempt = 0;

  while (attempt <= maxRetries) {
    try {
      return await prisma.$transaction(
        async (tx) => operation(tx),
        {
          isolationLevel: 'Serializable',
          ...(transactionOptions ?? {}),
        },
      );
    } catch (error) {
      if (!isRetriableSerializationError(error) || attempt === maxRetries) {
        throw error;
      }

      // Exponential backoff to reduce lock thrashing under high write contention.
      const backoffMs = 30 * 2 ** attempt;
      await sleep(backoffMs);
      attempt += 1;
    }
  }

  throw new Error('Serializable transaction retries exhausted');
}
