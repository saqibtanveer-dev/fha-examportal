import { beforeEach, describe, expect, it, vi } from 'vitest';

const requireRoleMock = vi.fn();
const revalidatePathMock = vi.fn();
const createAuditLogMock = vi.fn();
const lockTransactionKeysMock = vi.fn();
const runSerializableTransactionMock = vi.fn();
const hasTeacherDutyConflictMock = vi.fn();

const prismaMock = {
  datesheetEntry: { findUnique: vi.fn() },
  datesheetDuty: {
    findUnique: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
};

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
  lockTransactionKeys: lockTransactionKeysMock,
  runSerializableTransaction: runSerializableTransactionMock,
}));

vi.mock('../datesheet-duty-conflict', () => ({
  hasTeacherDutyConflict: hasTeacherDutyConflictMock,
}));

vi.mock('@/lib/prisma', () => ({
  prisma: prismaMock,
}));

const uuidA = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const uuidB = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const uuidC = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
const uuidD = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';

describe('datesheet-duty-actions integration', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    requireRoleMock.mockResolvedValue({ user: { id: 'admin-user' } });
    createAuditLogMock.mockResolvedValue(undefined);
  });

  it('assignDutyAction: success and conflict paths', async () => {
    const { assignDutyAction } = await import('../datesheet-duty-actions');

    const tx = {
      datesheetEntry: {
        findUnique: vi.fn().mockResolvedValue({
          id: uuidD,
          classId: uuidA,
          subjectId: uuidB,
          room: 'R-100',
          examDate: new Date('2026-03-20'),
          startTime: '09:00',
          endTime: '10:00',
          datesheet: { status: 'DRAFT' },
          _count: { duties: 0 },
        }),
      },
      datesheetDuty: {
        create: vi.fn().mockResolvedValue({ id: uuidD }),
      },
      $executeRaw: vi.fn(),
    };

    runSerializableTransactionMock.mockImplementation(async (cb: (x: typeof tx) => Promise<unknown>) => cb(tx));
    hasTeacherDutyConflictMock.mockResolvedValueOnce(false);

    const success = await assignDutyAction({
      datesheetEntryId: uuidD,
      teacherProfileId: uuidC,
      role: 'INVIGILATOR',
      room: 'R-100',
      notes: 'Merged elective exam',
    });

    expect(success.success).toBe(true);
    expect(success.data).toEqual({ id: uuidD });
    expect(lockTransactionKeysMock).toHaveBeenCalled();

    hasTeacherDutyConflictMock.mockResolvedValueOnce(true);
    const conflict = await assignDutyAction({
      datesheetEntryId: uuidD,
      teacherProfileId: uuidC,
      role: 'INVIGILATOR',
    });

    expect(conflict.success).toBe(false);
    expect(conflict.error).toContain('conflicting duty');
  });

  it('updateDutyAction: success and conflict paths', async () => {
    const { updateDutyAction } = await import('../datesheet-duty-actions');

    const tx = {
      datesheetDuty: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'duty-1',
          teacherProfileId: uuidC,
          room: 'R-200',
          datesheetEntry: {
            id: 'entry-2',
            classId: uuidA,
            subjectId: uuidB,
            room: 'R-200',
            examDate: new Date('2026-03-21'),
            startTime: '10:00',
            endTime: '11:00',
            datesheet: { status: 'DRAFT' },
          },
        }),
        update: vi.fn().mockResolvedValue({ id: 'duty-1' }),
      },
      $executeRaw: vi.fn(),
    };

    runSerializableTransactionMock.mockImplementation(async (cb: (x: typeof tx) => Promise<unknown>) => cb(tx));

    hasTeacherDutyConflictMock.mockResolvedValueOnce(false);
    const success = await updateDutyAction('duty-1', {
      room: 'R-200',
      role: 'INVIGILATOR',
    });
    expect(success.success).toBe(true);

    hasTeacherDutyConflictMock.mockResolvedValueOnce(true);
    const conflict = await updateDutyAction('duty-1', {
      room: 'R-201',
    });
    expect(conflict.success).toBe(false);
    expect(conflict.error).toContain('conflicting duty');
  });
});
