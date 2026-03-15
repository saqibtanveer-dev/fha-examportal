type RunInChunksOptions = {
  maxRetries?: number;
  initialRetryDelayMs?: number;
  retryBackoffMultiplier?: number;
  isRetryableError?: (error: unknown) => boolean;
};

function isTransientDbError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;

  const maybeError = error as {
    code?: unknown;
    message?: unknown;
  };

  const code = typeof maybeError.code === 'string' ? maybeError.code : '';
  // Common transient Prisma/DB classes: connection timeout, pool timeout, serialization/deadlock.
  if (code === 'P1001' || code === 'P1002' || code === 'P2024' || code === 'P2034') {
    return true;
  }

  const message = typeof maybeError.message === 'string' ? maybeError.message.toLowerCase() : '';
  return (
    message.includes('deadlock')
    || message.includes('timeout')
    || message.includes('temporarily unavailable')
    || message.includes('could not serialize access')
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function runWithRetry<T, R>(
  item: T,
  processor: (item: T) => Promise<R>,
  options?: RunInChunksOptions,
): Promise<R> {
  const maxRetries = Math.max(0, Math.floor(options?.maxRetries ?? 0));
  const initialDelayMs = Math.max(25, Math.floor(options?.initialRetryDelayMs ?? 100));
  const backoffMultiplier = Math.max(1, options?.retryBackoffMultiplier ?? 2);
  const isRetryableError = options?.isRetryableError ?? isTransientDbError;

  let attempt = 0;
  let delayMs = initialDelayMs;

  while (true) {
    try {
      return await processor(item);
    } catch (error) {
      if (attempt >= maxRetries || !isRetryableError(error)) {
        throw error;
      }
      await sleep(delayMs);
      delayMs = Math.floor(delayMs * backoffMultiplier);
      attempt += 1;
    }
  }
}

export async function runInChunks<T, R>(
  items: T[],
  chunkSize: number,
  processor: (item: T) => Promise<R>,
  options?: RunInChunksOptions,
): Promise<R[]> {
  const normalizedChunkSize = Number.isFinite(chunkSize)
    ? Math.max(1, Math.floor(chunkSize))
    : 1;

  const results: R[] = [];
  for (let i = 0; i < items.length; i += normalizedChunkSize) {
    const chunk = items.slice(i, i + normalizedChunkSize);
    const chunkResults = await Promise.all(
      chunk.map((item) => runWithRetry(item, processor, options)),
    );
    results.push(...chunkResults);
  }

  return results;
}