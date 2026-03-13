import { prisma } from '@/lib/prisma';
import type { CreateTimetableEntryInput } from '@/validations/timetable-schemas';
import { hasTeacherConflict } from './timetable-queries';
import { isSharedElectiveDeliveryCompatible } from './timetable-shared-delivery';

type TimetableBulkDb = {
  subjectClassLink: {
    findMany: typeof prisma.subjectClassLink.findMany;
  };
  timetableEntry: {
    findMany: typeof prisma.timetableEntry.findMany;
  };
};

export async function validateBulkTeacherAssignments(
  entries: CreateTimetableEntryInput[],
  db: TimetableBulkDb = prisma,
): Promise<{
  electiveMap: Map<string, boolean>;
  error?: string;
}> {
  const links = await db.subjectClassLink.findMany({
    where: {
      OR: entries.map((e) => ({ subjectId: e.subjectId, classId: e.classId })),
    },
    select: { subjectId: true, classId: true, isElective: true },
  });
  const electiveMap = new Map(links.map((l) => [`${l.subjectId}:${l.classId}`, l.isElective]));

  const batchAssignments = new Map<string, {
    classId: string;
    sectionId: string;
    subjectId: string;
    room?: string;
    isElectiveSlot: boolean;
  }[]>();

  for (const entry of entries) {
    const isElective = electiveMap.get(`${entry.subjectId}:${entry.classId}`) ?? false;

    const conflict = await hasTeacherConflict({
      teacherProfileId: entry.teacherProfileId,
      classId: entry.classId,
      sectionId: entry.sectionId,
      subjectId: entry.subjectId,
      periodSlotId: entry.periodSlotId,
      dayOfWeek: entry.dayOfWeek,
      academicSessionId: entry.academicSessionId,
      room: entry.room,
      isElectiveSlot: isElective,
    }, db);
    if (conflict) {
      return {
        electiveMap,
        error: `Teacher conflict found for ${entry.dayOfWeek} period ${entry.periodSlotId}`,
      };
    }

    const slotKey = `${entry.teacherProfileId}:${entry.periodSlotId}:${entry.dayOfWeek}:${entry.academicSessionId}`;
    const slotItems = batchAssignments.get(slotKey) ?? [];
    const candidate = {
      classId: entry.classId,
      sectionId: entry.sectionId,
      subjectId: entry.subjectId,
      room: entry.room,
      isElectiveSlot: isElective,
    };

    if (slotItems.some((existingItem) => !isSharedElectiveDeliveryCompatible(existingItem, candidate))) {
      return {
        electiveMap,
        error: `Batch teacher conflict for ${entry.dayOfWeek} period ${entry.periodSlotId}. Shared slots require same elective subject and room.`,
      };
    }

    slotItems.push(candidate);
    batchAssignments.set(slotKey, slotItems);
  }

  return { electiveMap };
}
