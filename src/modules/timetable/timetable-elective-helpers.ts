import { prisma } from '@/lib/prisma';
import type { DayOfWeek } from '@prisma/client';

type TimetableWriter = {
  electiveSlotGroup: {
    upsert: typeof prisma.electiveSlotGroup.upsert;
    delete: typeof prisma.electiveSlotGroup.delete;
  };
  timetableEntry: {
    count: typeof prisma.timetableEntry.count;
  };
};

/** Find or create an ElectiveSlotGroup for the given slot coordinates. */
export async function findOrCreateElectiveGroup(
  classId: string,
  sectionId: string,
  periodSlotId: string,
  dayOfWeek: DayOfWeek,
  academicSessionId: string,
  db: TimetableWriter = prisma,
): Promise<string> {
  const group = await db.electiveSlotGroup.upsert({
    where: {
      classId_sectionId_periodSlotId_dayOfWeek_academicSessionId: {
        classId, sectionId, periodSlotId, dayOfWeek, academicSessionId,
      },
    },
    create: { classId, sectionId, periodSlotId, dayOfWeek, academicSessionId },
    update: {},
  });
  return group.id;
}

/** Delete an ElectiveSlotGroup if it has no remaining entries. */
export async function cleanupOrphanedGroup(groupId: string, db: TimetableWriter = prisma): Promise<void> {
  const remaining = await db.timetableEntry.count({
    where: { electiveSlotGroupId: groupId },
  });
  if (remaining === 0) {
    await db.electiveSlotGroup.delete({ where: { id: groupId } });
  }
}
