import { beforeEach, describe, expect, it, vi } from 'vitest';

const requireRoleMock = vi.fn();
const revalidatePathMock = vi.fn();
const createAuditLogMock = vi.fn();
const createWithLockMock = vi.fn();
const updateWithLockMock = vi.fn();
const bulkWithLockMock = vi.fn();

vi.mock('@/lib/auth-utils', () => ({
  requireRole: requireRoleMock,
}));

vi.mock('next/cache', () => ({
  revalidatePath: revalidatePathMock,
}));

vi.mock('@/modules/audit/audit-queries', () => ({
  createAuditLog: createAuditLogMock,
}));

vi.mock('../timetable-entry-write-ops', () => ({
  createTimetableEntryWithLock: createWithLockMock,
  updateTimetableEntryWithLock: updateWithLockMock,
  bulkCreateTimetableWithLock: bulkWithLockMock,
}));

const uuid1 = '11111111-1111-4111-8111-111111111111';
const uuid2 = '22222222-2222-4222-8222-222222222222';
const uuid3 = '33333333-3333-4333-8333-333333333333';
const uuid4 = '44444444-4444-4444-8444-444444444444';
const uuid5 = '55555555-5555-4555-8555-555555555555';
const uuid6 = '66666666-6666-4666-8666-666666666666';

describe('timetable-entry-actions integration', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    requireRoleMock.mockResolvedValue({ user: { id: 'admin-user' } });
    createAuditLogMock.mockResolvedValue(undefined);
  });

  it('createTimetableEntryAction: success path', async () => {
    const { createTimetableEntryAction } = await import('../timetable-entry-actions');
    createWithLockMock.mockResolvedValue({ entry: { id: 'entry-1' } });

    const result = await createTimetableEntryAction({
      classId: uuid1,
      sectionId: uuid2,
      subjectId: uuid3,
      teacherProfileId: uuid4,
      periodSlotId: uuid5,
      dayOfWeek: 'MONDAY',
      academicSessionId: uuid6,
      room: 'R-101',
      isElectiveSlot: false,
    });

    expect(result.success).toBe(true);
    expect(result.data).toEqual({ id: 'entry-1' });
    expect(createWithLockMock).toHaveBeenCalledTimes(1);
    expect(revalidatePathMock).toHaveBeenCalled();
  });

  it('createTimetableEntryAction: conflict error path', async () => {
    const { createTimetableEntryAction } = await import('../timetable-entry-actions');
    createWithLockMock.mockResolvedValue({ error: 'Teacher conflict' });

    const result = await createTimetableEntryAction({
      classId: uuid1,
      sectionId: uuid2,
      subjectId: uuid3,
      teacherProfileId: uuid4,
      periodSlotId: uuid5,
      dayOfWeek: 'MONDAY',
      academicSessionId: uuid6,
      isElectiveSlot: false,
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('Teacher conflict');
  });

  it('updateTimetableEntryAction: success and failure paths', async () => {
    const { updateTimetableEntryAction } = await import('../timetable-entry-actions');

    updateWithLockMock.mockResolvedValueOnce({});
    const success = await updateTimetableEntryAction('entry-id', {
      room: 'Lab-2',
      teacherProfileId: uuid4,
    });
    expect(success.success).toBe(true);

    updateWithLockMock.mockResolvedValueOnce({ error: 'Cannot change to regular' });
    const failed = await updateTimetableEntryAction('entry-id', {
      subjectId: uuid3,
    });
    expect(failed.success).toBe(false);
    expect(failed.error).toContain('Cannot change to regular');
  });

  it('bulkCreateTimetableAction: success and conflict paths', async () => {
    const { bulkCreateTimetableAction } = await import('../timetable-entry-actions');

    const payload = {
      entries: [{
        classId: uuid1,
        sectionId: uuid2,
        subjectId: uuid3,
        teacherProfileId: uuid4,
        periodSlotId: uuid5,
        dayOfWeek: 'TUESDAY' as const,
        academicSessionId: uuid6,
        room: 'R-201',
        isElectiveSlot: false,
      }],
    };

    bulkWithLockMock.mockResolvedValueOnce({ created: 1 });
    const success = await bulkCreateTimetableAction(payload);
    expect(success.success).toBe(true);
    expect(success.data).toEqual({ created: 1 });

    bulkWithLockMock.mockResolvedValueOnce({ error: 'Batch teacher conflict' });
    const failed = await bulkCreateTimetableAction(payload);
    expect(failed.success).toBe(false);
    expect(failed.error).toContain('Batch teacher conflict');
  });
});
