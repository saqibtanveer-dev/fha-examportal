import { describe, it, expect, vi } from 'vitest';
import { safeAction, safeFetchAction } from '@/lib/safe-action';

// Mock logger
vi.mock('@/lib/logger', () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));

describe('safeAction', () => {
  it('returns action result on success', async () => {
    const action = safeAction(async (name: string) => ({
      success: true as const,
      data: { name },
    }));
    const result = await action('test');
    expect(result).toEqual({ success: true, data: { name: 'test' } });
  });

  it('catches Prisma P2002 and returns friendly error', async () => {
    const action = safeAction(async () => {
      const error = Object.assign(new Error('Unique constraint'), {
        code: 'P2002',
        meta: { target: ['email'] },
      });
      throw error;
    });
    const result = await action();
    expect(result.success).toBe(false);
    expect(result.error).toContain('already exists');
  });

  it('catches Prisma P2025 and returns "not found"', async () => {
    const action = safeAction(async () => {
      throw Object.assign(new Error(), { code: 'P2025' });
    });
    const result = await action();
    expect(result).toEqual({ success: false, error: 'Record not found' });
  });

  it('catches unknown errors and returns generic message', async () => {
    const action = safeAction(async () => {
      throw new Error('Something weird');
    });
    const result = await action();
    expect(result.success).toBe(false);
    expect(result.error).toBe('An unexpected error occurred. Please try again.');
  });

  it('re-throws Next.js redirect errors', async () => {
    const redirectError = { digest: 'NEXT_REDIRECT;/login' };
    const action = safeAction(async () => {
      throw redirectError;
    });
    await expect(action()).rejects.toEqual(redirectError);
  });

  it('preserves generic return type', async () => {
    const action = safeAction(async (id: string) => ({
      success: true as const,
      data: { id, count: 42 },
    }));
    const result = await action('abc');
    if (result.success && result.data) {
      expect(result.data.id).toBe('abc');
      expect(result.data.count).toBe(42);
    }
  });
});

describe('safeFetchAction', () => {
  it('returns data on success', async () => {
    const action = safeFetchAction(async (id: string) => ({ id, name: 'Test' }));
    const result = await action('123');
    expect(result).toEqual({ id: '123', name: 'Test' });
  });

  it('throws clean Error on Prisma error (hides internals)', async () => {
    const action = safeFetchAction(async () => {
      throw Object.assign(new Error('Connection pool exhausted'), {
        code: 'P2024',
        meta: { connection_limit: 5 },
      });
    });
    await expect(action()).rejects.toThrow('Failed to load data. Please try again.');
  });

  it('throws clean Error on unknown error (hides internals)', async () => {
    const action = safeFetchAction(async () => {
      throw new TypeError('Cannot read property of undefined');
    });
    await expect(action()).rejects.toThrow('Failed to load data. Please try again.');
  });

  it('re-throws Next.js redirect errors', async () => {
    const redirectError = { digest: 'NEXT_REDIRECT;/dashboard' };
    const action = safeFetchAction(async () => {
      throw redirectError;
    });
    await expect(action()).rejects.toEqual(redirectError);
  });

  it('re-throws Next.js NOT_FOUND errors', async () => {
    const notFoundError = { digest: 'NEXT_NOT_FOUND' };
    const action = safeFetchAction(async () => {
      throw notFoundError;
    });
    await expect(action()).rejects.toEqual(notFoundError);
  });

  it('preserves generic return type and passes arguments', async () => {
    const action = safeFetchAction(async (a: number, b: number) => a + b);
    expect(await action(3, 7)).toBe(10);
  });
});
