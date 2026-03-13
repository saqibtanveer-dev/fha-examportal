import { prisma } from '@/lib/prisma';
import { isSharedDutyCompatible } from './datesheet-shared-duty';

type DatesheetDutyConflictDb = {
  datesheetDuty: {
    findMany: typeof prisma.datesheetDuty.findMany;
  };
  subjectClassLink: {
    findMany: typeof prisma.subjectClassLink.findMany;
  };
};

/** Check teacher duty time conflict on same date. */
export async function hasTeacherDutyConflict(
  teacherProfileId: string,
  examDate: Date,
  startTime: string,
  endTime: string,
  candidate: {
    classId: string;
    subjectId: string;
    room?: string | null;
    excludeEntryId?: string;
  },
  db: DatesheetDutyConflictDb = prisma,
): Promise<boolean> {
  const duties = await db.datesheetDuty.findMany({
    where: {
      teacherProfileId,
      datesheetEntry: {
        examDate,
        ...(candidate.excludeEntryId ? { id: { not: candidate.excludeEntryId } } : {}),
      },
    },
    select: {
      room: true,
      datesheetEntry: {
        select: {
          classId: true,
          subjectId: true,
          room: true,
          startTime: true,
          endTime: true,
        },
      },
    },
  });

  const { doTimesOverlap } = await import('./datesheet.utils');
  const overlapping = duties.filter((d) => doTimesOverlap(startTime, endTime, d.datesheetEntry.startTime, d.datesheetEntry.endTime));
  if (overlapping.length === 0) return false;

  const subjectPairs = new Set<string>();
  subjectPairs.add(`${candidate.subjectId}:${candidate.classId}`);
  for (const duty of overlapping) {
    subjectPairs.add(`${duty.datesheetEntry.subjectId}:${duty.datesheetEntry.classId}`);
  }

  const links = await db.subjectClassLink.findMany({
    where: {
      OR: [...subjectPairs].map((key) => {
        const [subjectId, classId] = key.split(':');
        return { subjectId, classId };
      }),
    },
    select: {
      subjectId: true,
      classId: true,
      isElective: true,
      electiveGroupName: true,
    },
  });

  const linkMap = new Map(links.map((l) => [`${l.subjectId}:${l.classId}`, l]));
  const candidateLink = linkMap.get(`${candidate.subjectId}:${candidate.classId}`);
  const candidateContext = {
    classId: candidate.classId,
    subjectId: candidate.subjectId,
    room: candidate.room,
    isElective: candidateLink?.isElective ?? false,
    electiveGroupName: candidateLink?.electiveGroupName ?? null,
  };

  return overlapping.some((duty) => {
    const existingLink = linkMap.get(`${duty.datesheetEntry.subjectId}:${duty.datesheetEntry.classId}`);
    const existingContext = {
      classId: duty.datesheetEntry.classId,
      subjectId: duty.datesheetEntry.subjectId,
      room: duty.room ?? duty.datesheetEntry.room,
      isElective: existingLink?.isElective ?? false,
      electiveGroupName: existingLink?.electiveGroupName ?? null,
    };

    return !isSharedDutyCompatible(existingContext, candidateContext);
  });
}
