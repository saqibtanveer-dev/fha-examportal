import { prisma } from '@/lib/prisma';
import type { DayOfWeek } from '@prisma/client';

/** Find or create an ElectiveSlotGroup for the given slot coordinates. */
export async function findOrCreateElectiveGroup(
  classId: string,
  sectionId: string,
  periodSlotId: string,
  dayOfWeek: DayOfWeek,
  academicSessionId: string,
): Promise<string> {
  const group = await prisma.electiveSlotGroup.upsert({
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
export async function cleanupOrphanedGroup(groupId: string): Promise<void> {
  const remaining = await prisma.timetableEntry.count({
    where: { electiveSlotGroupId: groupId },
  });
  if (remaining === 0) {
    await prisma.electiveSlotGroup.delete({ where: { id: groupId } });
  }
}
