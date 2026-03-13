import { describe, expect, it, vi, beforeEach } from 'vitest';

const transactionMock = vi.fn();

vi.mock('@/lib/prisma', () => ({
  prisma: {
    $transaction: transactionMock,
  },
}));

describe('transaction-locks', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('runSerializableTransaction retries on serialization conflict', async () => {
    const { runSerializableTransaction } = await import('../transaction-locks');

    transactionMock
      .mockRejectedValueOnce({ code: 'P2034' })
      .mockResolvedValueOnce('ok');

    const result = await runSerializableTransaction(async () => 'ok', 2);

    expect(result).toBe('ok');
    expect(transactionMock).toHaveBeenCalledTimes(2);
  });

  it('lockTransactionKeys de-duplicates lock keys', async () => {
    const { lockTransactionKeys } = await import('../transaction-locks');

    const tx = {
      $executeRaw: vi.fn().mockResolvedValue(undefined),
    } as unknown as Parameters<typeof lockTransactionKeys>[0];

    await lockTransactionKeys(tx, ['b-key', 'a-key', 'a-key']);

    expect((tx.$executeRaw as unknown as ReturnType<typeof vi.fn>).mock.calls.length).toBe(2);
  });
});
