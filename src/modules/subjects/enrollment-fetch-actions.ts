'use server';

import { requireRole } from '@/lib/auth-utils';
import { safeFetchAction } from '@/lib/safe-action';

export const fetchEnrollmentsBySubjectAction = safeFetchAction(async (
  subjectId: string,
  classId: string,
  academicSessionId: string,
) => {
  await requireRole('ADMIN', 'TEACHER');

  const { prisma } = await import('@/lib/prisma');
  return prisma.studentSubjectEnrollment.findMany({
    where: { subjectId, classId, academicSessionId, isActive: true },
    select: {
      id: true,
      studentProfileId: true,
      studentProfile: {
        select: {
          id: true,
          rollNumber: true,
          sectionId: true,
          user: { select: { firstName: true, lastName: true } },
        },
      },
    },
    orderBy: { studentProfile: { rollNumber: 'asc' } },
  });
});

export const fetchElectiveGroupsAction = safeFetchAction(async (
  classId: string,
  academicSessionId: string,
) => {
  await requireRole('ADMIN');

  const { getElectiveGroupsForClass } = await import('./enrollment-queries');
  return getElectiveGroupsForClass(classId, academicSessionId);
});

export const fetchUnassignedStudentsAction = safeFetchAction(async (
  classId: string,
  sectionId: string,
  electiveGroupName: string,
  academicSessionId: string,
) => {
  await requireRole('ADMIN');

  const { getUnassignedStudentsForElectiveGroup } = await import('./enrollment-queries');
  return getUnassignedStudentsForElectiveGroup(classId, sectionId, electiveGroupName, academicSessionId);
});

export const fetchEnrolledStudentsForGroupAction = safeFetchAction(async (
  classId: string,
  sectionId: string,
  electiveGroupName: string,
  academicSessionId: string,
) => {
  await requireRole('ADMIN');

  const { getEnrolledStudentsForElectiveGroup } = await import('./enrollment-queries');
  return getEnrolledStudentsForElectiveGroup(classId, sectionId, electiveGroupName, academicSessionId);
});
