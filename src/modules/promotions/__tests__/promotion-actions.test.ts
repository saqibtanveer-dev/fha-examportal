import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  requireRoleMock,
  revalidatePathMock,
  createAuditLogMock,
  runSerializableTransactionMock,
  lockTransactionKeysMock,
  tx,
  prismaMock,
} = vi.hoisted(() => {
  const txClient = {
    $executeRaw: vi.fn(),
    studentProfile: {
      findMany: vi.fn(),
      updateMany: vi.fn(),
    },
    studentPromotion: {
      findMany: vi.fn(),
      createMany: vi.fn(),
      deleteMany: vi.fn(),
    },
    user: {
      updateMany: vi.fn(),
    },
    notification: {
      createMany: vi.fn(),
    },
  };

  const rootPrismaMock = {
    academicSession: {
      findUnique: vi.fn(),
    },
    studentProfile: {
      findMany: vi.fn(),
    },
    class: {
      findMany: vi.fn(),
    },
    section: {
      findMany: vi.fn(),
    },
    studentPromotion: {
      findMany: vi.fn(),
    },
  };

  return {
    requireRoleMock: vi.fn(),
    revalidatePathMock: vi.fn(),
    createAuditLogMock: vi.fn(),
    runSerializableTransactionMock: vi.fn(),
    lockTransactionKeysMock: vi.fn(),
    tx: txClient,
    prismaMock: rootPrismaMock,
  };
});

vi.mock('@/lib/auth-utils', () => ({
  requireRole: requireRoleMock,
}));

vi.mock('next/cache', () => ({
  revalidatePath: revalidatePathMock,
}));

vi.mock('@/modules/audit/audit-queries', () => ({
  createAuditLog: createAuditLogMock,
}));

vi.mock('@/lib/transaction-locks', () => ({
  runSerializableTransaction: runSerializableTransactionMock,
  lockTransactionKeys: lockTransactionKeysMock,
}));

vi.mock('@/lib/logger', () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));

vi.mock('@/lib/prisma', () => ({
  prisma: prismaMock,
}));

const uuidA = '11111111-1111-4111-8111-111111111111';
const uuidB = '22222222-2222-4222-8222-222222222222';
const uuidC = '33333333-3333-4333-8333-333333333333';
const uuidD = '44444444-4444-4444-8444-444444444444';
const uuidE = '55555555-5555-4555-8555-555555555555';
const uuidF = '66666666-6666-4666-8666-666666666666';
const uuidG = '77777777-7777-4777-8777-777777777777';
const uuidH = '88888888-8888-4888-8888-888888888888';
const uuidI = '99999999-9999-4999-8999-999999999999';
const uuidJ = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

beforeEach(() => {
  vi.resetAllMocks();

  requireRoleMock.mockResolvedValue({ user: { id: 'admin-1' } });
  createAuditLogMock.mockResolvedValue(undefined);
  prismaMock.academicSession.findUnique.mockResolvedValue({ id: uuidA, name: '2025-2026' });
  prismaMock.studentProfile.findMany.mockResolvedValue([]);
  prismaMock.class.findMany.mockResolvedValue([]);
  prismaMock.section.findMany.mockResolvedValue([]);
  prismaMock.studentPromotion.findMany.mockResolvedValue([]);

  tx.studentProfile.findMany.mockResolvedValue([]);
  tx.studentProfile.updateMany.mockResolvedValue({ count: 0 });
  tx.studentPromotion.findMany.mockResolvedValue([]);
  tx.studentPromotion.createMany.mockResolvedValue({ count: 0 });
  tx.studentPromotion.deleteMany.mockResolvedValue({ count: 0 });
  tx.$executeRaw.mockResolvedValue(1);
  tx.user.updateMany.mockResolvedValue({ count: 0 });
  tx.notification.createMany.mockResolvedValue({ count: 0 });

  runSerializableTransactionMock.mockImplementation(async (operation: (client: typeof tx) => Promise<unknown>) => operation(tx));
});

describe('promotion-actions', () => {
  it('executeYearTransitionAction processes valid rows and skips already processed/mismatched rows', async () => {
    const { executeYearTransitionAction } = await import('../promotion-actions');

    prismaMock.studentProfile.findMany.mockResolvedValue([
      { id: uuidB, classId: uuidC, sectionId: uuidD, userId: 'user-1' },
      { id: uuidE, classId: uuidC, sectionId: uuidD, userId: 'user-2' },
      { id: uuidF, classId: uuidG, sectionId: uuidH, userId: 'user-3' },
    ]);

    prismaMock.studentPromotion.findMany.mockResolvedValue([{ studentProfileId: uuidE }]);

    prismaMock.class.findMany.mockResolvedValue([{ id: uuidI }]);
    prismaMock.section.findMany.mockResolvedValue([{ id: uuidJ, classId: uuidI, isActive: true }]);

    const result = await executeYearTransitionAction({
      academicSessionId: uuidA,
      promotions: [
        {
          fromClassId: uuidC,
          toClassId: uuidI,
          defaultSectionId: uuidJ,
          entries: [
            { studentProfileId: uuidB, action: 'PROMOTE', toClassId: uuidI, toSectionId: uuidJ },
            { studentProfileId: uuidE, action: 'GRADUATE' },
            { studentProfileId: uuidF, action: 'PROMOTE', toClassId: uuidI, toSectionId: uuidJ },
          ],
        },
      ],
    });

    expect(result.success).toBe(true);
    expect(result.data).toEqual({
      promoted: 1,
      graduated: 0,
      heldBack: 0,
      skipped: 2,
      processed: 1,
    });

    expect(tx.studentPromotion.createMany).toHaveBeenCalledTimes(1);
    expect(tx.studentPromotion.createMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: [expect.objectContaining({ studentProfileId: uuidB, status: 'PROMOTED', toClassId: uuidI, toSectionId: uuidJ })],
      }),
    );
  });

  it('executeYearTransitionAction honors per-student target class override', async () => {
    const { executeYearTransitionAction } = await import('../promotion-actions');

    prismaMock.studentProfile.findMany.mockResolvedValue([{ id: uuidB, classId: uuidC, sectionId: uuidD, userId: 'user-1' }]);
    prismaMock.studentPromotion.findMany.mockResolvedValue([]);

    prismaMock.class.findMany.mockResolvedValue([{ id: uuidI }, { id: uuidH }]);
    prismaMock.section.findMany.mockResolvedValue([{ id: uuidJ, classId: uuidH, isActive: true }]);

    const result = await executeYearTransitionAction({
      academicSessionId: uuidA,
      promotions: [
        {
          fromClassId: uuidC,
          toClassId: uuidI,
          defaultSectionId: uuidD,
          entries: [
            { studentProfileId: uuidB, action: 'PROMOTE', toClassId: uuidH, toSectionId: uuidJ },
          ],
        },
      ],
    });

    expect(result.success).toBe(true);
    expect(tx.studentPromotion.createMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: [expect.objectContaining({ toClassId: uuidH, toSectionId: uuidJ })],
      }),
    );
  });

  it('undoSelectedYearTransitionAction reverts selected rows only', async () => {
    const { undoSelectedYearTransitionAction } = await import('../promotion-actions');

    prismaMock.studentPromotion.findMany.mockResolvedValue([
      {
        id: uuidB,
        studentProfileId: uuidC,
        fromClassId: uuidD,
        fromSectionId: uuidE,
        status: 'GRADUATED',
        studentProfile: { userId: 'user-1' },
      },
      {
        id: uuidF,
        studentProfileId: uuidG,
        fromClassId: uuidD,
        fromSectionId: uuidE,
        status: 'PROMOTED',
        studentProfile: { userId: 'user-2' },
      },
    ]);

    const result = await undoSelectedYearTransitionAction({
      academicSessionId: uuidA,
      promotionIds: [uuidB, uuidF],
    });

    expect(result.success).toBe(true);
    expect(result.data).toEqual({ undone: 2 });
    expect(tx.$executeRaw).toHaveBeenCalledTimes(1);
    expect(tx.user.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: { in: ['user-1'] } } }),
    );
    expect(tx.studentPromotion.deleteMany).toHaveBeenCalledWith(
      { where: { id: { in: [uuidB, uuidF] } } },
    );
  });

  it('listSessionTransitionsAction maps rows into UI shape', async () => {
    const { listSessionTransitionsAction } = await import('../promotion-actions');

    prismaMock.studentPromotion.findMany.mockResolvedValue([
      {
        id: uuidB,
        studentProfileId: uuidC,
        promotedAt: new Date('2026-03-28T00:00:00.000Z'),
        status: 'PROMOTED',
        studentProfile: {
          rollNumber: '12',
          user: { firstName: 'Ali', lastName: 'Khan' },
        },
        fromClass: { name: 'Class 7' },
        fromSection: { name: 'A' },
        toClass: { name: 'Class 9' },
        toSection: { name: 'B' },
      },
    ]);

    const result = await listSessionTransitionsAction({ academicSessionId: uuidA });

    expect(result.success).toBe(true);
    expect(result.data).toEqual([
      {
        id: uuidB,
        studentProfileId: uuidC,
        studentName: 'Ali Khan',
        rollNumber: '12',
        fromClassName: 'Class 7',
        fromSectionName: 'A',
        toClassName: 'Class 9',
        toSectionName: 'B',
        status: 'PROMOTED',
        promotedAt: new Date('2026-03-28T00:00:00.000Z'),
      },
    ]);
  });
});
