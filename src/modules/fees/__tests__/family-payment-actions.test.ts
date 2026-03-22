import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/auth-utils', () => ({
  requireRole: vi.fn().mockResolvedValue({ user: { id: 'admin-001', role: 'ADMIN' } }),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    familyProfile: { findUnique: vi.fn() },
    familyStudentLink: { findFirst: vi.fn() },
    feeAssignment: { findMany: vi.fn() },
    familyPayment: { create: vi.fn() },
    feePayment: { create: vi.fn() },
    feeCredit: { create: vi.fn() },
    $transaction: vi.fn(),
  },
}));

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('@/modules/audit/audit-queries', () => ({ createAuditLog: vi.fn().mockResolvedValue(undefined) }));
vi.mock('@/lib/logger', () => ({ logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() } }));
vi.mock('@/lib/transaction-locks', () => ({
  runSerializableTransaction: vi.fn(),
  lockTransactionKeys: vi.fn(),
}));
vi.mock('../fee-queries', () => ({
  getCurrentAcademicSessionId: vi.fn().mockResolvedValue('session-001'),
  findFeeSettings: vi.fn().mockResolvedValue({ familyReceiptPrefix: 'FMRC', receiptPrefix: 'FRCP' }),
}));
vi.mock('../receipt-generator', () => ({
  generateFamilyReceiptNumber: vi.fn().mockResolvedValue('FMRC-260322-0001'),
  generateReceiptNumber: vi.fn().mockResolvedValue('FRCP-260322-0001'),
}));

import { recordFamilyPaymentAction } from '../family-payment-actions';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('recordFamilyPaymentAction custom allocation validation', () => {
  it('rejects CUSTOM strategy without custom allocations', async () => {
    const result = await recordFamilyPaymentAction({
      familyProfileId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      totalAmount: 5000,
      paymentMethod: 'CASH',
      allocationStrategy: 'CUSTOM',
    });

    expect(result.success).toBe(false);
    expect(result.error?.toLowerCase()).toContain('custom allocations');
  });

  it('rejects when custom allocation sum does not match total amount', async () => {
    const result = await recordFamilyPaymentAction({
      familyProfileId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      totalAmount: 5000,
      paymentMethod: 'CASH',
      allocationStrategy: 'CUSTOM',
      customAllocations: [
        { feeAssignmentId: '550e8400-e29b-41d4-a716-446655440001', amount: 1000 },
        { feeAssignmentId: '550e8400-e29b-41d4-a716-446655440002', amount: 2000 },
      ],
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('must match payment total amount');
  });
});
