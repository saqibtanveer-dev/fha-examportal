import { isSubjectElectiveForClass } from '@/lib/enrollment-helpers';
import { lockTransactionKeys, runSerializableTransaction } from '@/lib/transaction-locks';
import type { DayOfWeek } from '@prisma/client';
import type { BulkCreateTimetableInput, UpdateTimetableEntryInput } from '@/validations/timetable-schemas';
import { hasTeacherConflict } from './timetable-queries';
import { cleanupOrphanedGroup, findOrCreateElectiveGroup } from './timetable-elective-helpers';
import { validateBulkTeacherAssignments } from './timetable-bulk-create-helper';

type TimetableEntryRow = {
  id: string;
  classId: string;
  sectionId: string;
  subjectId: string;
  teacherProfileId: string;
  periodSlotId: string;
  dayOfWeek: DayOfWeek;
  academicSessionId: string;
  room: string | null;
  isElectiveSlot: boolean;
  electiveSlotGroupId: string | null;
};

type CreateEntryInput = BulkCreateTimetableInput['entries'][number];

function teacherSlotLockKey(
  teacherProfileId: string,
  periodSlotId: string,
  dayOfWeek: string,
  academicSessionId: string,
): string {
  return `tt:teacher:${teacherProfileId}:${academicSessionId}:${dayOfWeek}:${periodSlotId}`;
}

function classSectionSlotLockKey(
  classId: string,
  sectionId: string,
  periodSlotId: string,
  dayOfWeek: string,
  academicSessionId: string,
): string {
  return `tt:class-section:${classId}:${sectionId}:${academicSessionId}:${dayOfWeek}:${periodSlotId}`;
}

export async function createTimetableEntryWithLock(data: CreateEntryInput): Promise<{ entry?: { id: string }; error?: string }> {
  const isElective = await isSubjectElectiveForClass(data.subjectId, data.classId);

  const result = await runSerializableTransaction(async (tx) => {
    await lockTransactionKeys(tx, [
      teacherSlotLockKey(data.teacherProfileId, data.periodSlotId, data.dayOfWeek, data.academicSessionId),
      classSectionSlotLockKey(data.classId, data.sectionId, data.periodSlotId, data.dayOfWeek, data.academicSessionId),
    ]);

    const periodSlot = await tx.periodSlot.findUnique({ where: { id: data.periodSlotId } });
    if (!periodSlot) return { error: 'Period slot not found' } as const;
    if (periodSlot.isBreak) return { error: 'Cannot assign a subject to a break period' } as const;

    const conflict = await hasTeacherConflict({
      teacherProfileId: data.teacherProfileId,
      classId: data.classId,
      sectionId: data.sectionId,
      subjectId: data.subjectId,
      periodSlotId: data.periodSlotId,
      dayOfWeek: data.dayOfWeek,
      academicSessionId: data.academicSessionId,
      room: data.room,
      isElectiveSlot: isElective,
    }, tx);
    if (conflict) {
      return { error: 'Teacher is already assigned in this period. For shared elective classes, use same class, subject and room across sections.' } as const;
    }

    const existingEntries = await tx.timetableEntry.findMany({
      where: {
        classId: data.classId,
        sectionId: data.sectionId,
        periodSlotId: data.periodSlotId,
        dayOfWeek: data.dayOfWeek,
        academicSessionId: data.academicSessionId,
        isActive: true,
      },
      select: { isElectiveSlot: true },
    });

    if (existingEntries.length > 0) {
      const hasElective = existingEntries.some((e) => e.isElectiveSlot);
      const hasRegular = existingEntries.some((e) => !e.isElectiveSlot);
      if (isElective && hasRegular) return { error: 'This period has a regular subject. Remove it first to create an elective block.' } as const;
      if (!isElective && hasElective) return { error: 'This period is an elective block. Cannot add a non-elective subject.' } as const;
      if (!isElective && hasRegular) return { error: 'This period already has a subject assigned.' } as const;
    }

    const electiveSlotGroupId = isElective
      ? await findOrCreateElectiveGroup(data.classId, data.sectionId, data.periodSlotId, data.dayOfWeek, data.academicSessionId, tx)
      : undefined;

    const entry = await tx.timetableEntry.create({
      data: {
        classId: data.classId,
        sectionId: data.sectionId,
        subjectId: data.subjectId,
        teacherProfileId: data.teacherProfileId,
        periodSlotId: data.periodSlotId,
        dayOfWeek: data.dayOfWeek,
        academicSessionId: data.academicSessionId,
        room: data.room,
        isElectiveSlot: isElective,
        electiveSlotGroupId,
      },
      select: { id: true },
    });

    return { entry } as const;
  });

  if ('error' in result) return { error: result.error };
  return { entry: result.entry };
}

export async function updateTimetableEntryWithLock(id: string, data: UpdateTimetableEntryInput): Promise<{ error?: string }> {
  const txResult = await runSerializableTransaction(async (tx) => {
    const existing = await tx.timetableEntry.findUnique({ where: { id } }) as TimetableEntryRow | null;
    if (!existing) return { error: 'Timetable entry not found' } as const;

    const effectiveTeacherProfileId = data.teacherProfileId ?? existing.teacherProfileId;
    await lockTransactionKeys(tx, [
      classSectionSlotLockKey(existing.classId, existing.sectionId, existing.periodSlotId, existing.dayOfWeek, existing.academicSessionId),
      teacherSlotLockKey(existing.teacherProfileId, existing.periodSlotId, existing.dayOfWeek, existing.academicSessionId),
      teacherSlotLockKey(effectiveTeacherProfileId, existing.periodSlotId, existing.dayOfWeek, existing.academicSessionId),
    ]);

    let electiveUpdates: Record<string, unknown> = {};
    let effectiveIsElective = existing.isElectiveSlot;
    let effectiveSubjectId = existing.subjectId;

    if (data.subjectId && data.subjectId !== existing.subjectId) {
      const newIsElective = await isSubjectElectiveForClass(data.subjectId, existing.classId);
      effectiveIsElective = newIsElective;
      effectiveSubjectId = data.subjectId;

      if (newIsElective !== existing.isElectiveSlot) {
        const siblings = await tx.timetableEntry.findMany({
          where: {
            classId: existing.classId,
            sectionId: existing.sectionId,
            periodSlotId: existing.periodSlotId,
            dayOfWeek: existing.dayOfWeek,
            academicSessionId: existing.academicSessionId,
            isActive: true,
            id: { not: id },
          },
          select: { isElectiveSlot: true },
        });

        if (siblings.length > 0) {
          const siblingHasElective = siblings.some((s) => s.isElectiveSlot);
          const siblingHasRegular = siblings.some((s) => !s.isElectiveSlot);
          if (newIsElective && siblingHasRegular) return { error: 'Cannot change to elective — this period has a regular subject.' } as const;
          if (!newIsElective && siblingHasElective) return { error: 'Cannot change to regular — this period is an elective block.' } as const;
        }
      }

      if (newIsElective) {
        const groupId = await findOrCreateElectiveGroup(existing.classId, existing.sectionId, existing.periodSlotId, existing.dayOfWeek, existing.academicSessionId, tx);
        electiveUpdates = { isElectiveSlot: true, electiveSlotGroupId: groupId };
      } else {
        electiveUpdates = { isElectiveSlot: false, electiveSlotGroupId: null };
      }
    }

    const effectiveRoom = data.room ?? existing.room;
    const requiresTeacherConflictCheck = (
      effectiveTeacherProfileId !== existing.teacherProfileId
      || effectiveSubjectId !== existing.subjectId
      || effectiveRoom !== existing.room
      || effectiveIsElective !== existing.isElectiveSlot
    );

    if (requiresTeacherConflictCheck) {
      const conflict = await hasTeacherConflict({
        teacherProfileId: effectiveTeacherProfileId,
        classId: existing.classId,
        sectionId: existing.sectionId,
        subjectId: effectiveSubjectId,
        periodSlotId: existing.periodSlotId,
        dayOfWeek: existing.dayOfWeek,
        academicSessionId: existing.academicSessionId,
        room: effectiveRoom ?? undefined,
        isElectiveSlot: effectiveIsElective,
        excludeEntryId: id,
      }, tx);
      if (conflict) return { error: 'Teacher conflict in this period. Shared delivery is allowed only for same elective subject and room across sections.' } as const;
    }

    await tx.timetableEntry.update({ where: { id }, data: { ...data, ...electiveUpdates } });
    if (electiveUpdates.electiveSlotGroupId === null && existing.electiveSlotGroupId) {
      await cleanupOrphanedGroup(existing.electiveSlotGroupId, tx);
    }

    return { ok: true } as const;
  });

  if ('error' in txResult) return { error: txResult.error };
  return {};
}

export async function bulkCreateTimetableWithLock(entries: BulkCreateTimetableInput['entries']): Promise<{ created?: number; error?: string }> {
  const result = await runSerializableTransaction(async (tx) => {
    const lockKeys = entries.flatMap((e) => ([
      teacherSlotLockKey(e.teacherProfileId, e.periodSlotId, e.dayOfWeek, e.academicSessionId),
      classSectionSlotLockKey(e.classId, e.sectionId, e.periodSlotId, e.dayOfWeek, e.academicSessionId),
    ]));
    await lockTransactionKeys(tx, lockKeys);

    const { electiveMap, error } = await validateBulkTeacherAssignments(entries, tx);
    if (error) return { error } as const;

    const periodSlotIds = [...new Set(entries.map((e) => e.periodSlotId))];
    const periodSlots = await tx.periodSlot.findMany({
      where: { id: { in: periodSlotIds } },
      select: { id: true, isBreak: true },
    });
    const breakSlotIds = new Set(periodSlots.filter((p) => p.isBreak).map((p) => p.id));
    for (const entry of entries) {
      if (breakSlotIds.has(entry.periodSlotId)) return { error: 'Cannot assign a subject to a break period' } as const;
    }

    const created = await tx.timetableEntry.createMany({
      data: entries.map((e) => ({
        classId: e.classId,
        sectionId: e.sectionId,
        subjectId: e.subjectId,
        teacherProfileId: e.teacherProfileId,
        periodSlotId: e.periodSlotId,
        dayOfWeek: e.dayOfWeek,
        academicSessionId: e.academicSessionId,
        room: e.room,
        isElectiveSlot: electiveMap.get(`${e.subjectId}:${e.classId}`) ?? false,
        electiveSlotGroupId: e.electiveSlotGroupId,
      })),
      skipDuplicates: true,
    });

    return { created: created.count } as const;
  });

  if ('error' in result) return { error: result.error };
  return { created: result.created };
}
