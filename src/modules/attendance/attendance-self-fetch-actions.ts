'use server';

import { requireRole } from '@/lib/auth-utils';
import { serialize } from '@/utils/serialize';
import { prisma } from '@/lib/prisma';
import { safeFetchAction } from '@/lib/safe-action';

export const fetchMyStudentProfileAction = safeFetchAction(async () => {
  const session = await requireRole('STUDENT');
  const profile = await prisma.studentProfile.findFirst({
    where: { userId: session.user.id },
    select: { id: true, rollNumber: true, registrationNo: true, classId: true, sectionId: true },
  });
  return serialize(profile);
});

export const fetchCurrentAcademicSessionAction = safeFetchAction(async () => {
  await requireRole('ADMIN', 'PRINCIPAL', 'TEACHER', 'STUDENT', 'FAMILY');
  const session = await prisma.academicSession.findFirst({
    where: { isCurrent: true },
    select: { id: true, name: true, isCurrent: true },
  });
  return serialize(session);
});
