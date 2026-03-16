import { startTestSessionAction } from '@/modules/admissions/portal/portal-test-start-actions';

const START_TIMEOUT_MS = 12_000;
const START_RETRY_ATTEMPTS = 2;

type StartPayload = { sessionId: string; questions: unknown[]; endsAt: string | null };

export async function bootstrapTestSession(accessToken: string): Promise<{ ok: true; data: StartPayload } | { ok: false; error: string }> {
  let lastError = 'Failed to start test';

  for (let attempt = 1; attempt <= START_RETRY_ATTEMPTS; attempt += 1) {
    try {
      const result = await withTimeout(startTestSessionAction({ token: accessToken }), START_TIMEOUT_MS);

      if (result.success && result.data) {
        return { ok: true, data: result.data };
      }

      lastError = result.error ?? 'Failed to start test';
      if (!isRetryableStartError(lastError)) {
        return { ok: false, error: lastError };
      }
    } catch {
      lastError = 'Starting test is taking too long. Please retry.';
    }

    if (attempt < START_RETRY_ATTEMPTS) {
      await new Promise((resolve) => setTimeout(resolve, 500 * attempt));
    }
  }

  return { ok: false, error: lastError };
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), timeoutMs);
    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
}

function isRetryableStartError(message: string): boolean {
  return /(timed out|please try again|database is waking up|unexpected error|network|fetch)/i.test(message);
}
