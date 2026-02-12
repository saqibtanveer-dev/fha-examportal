import { prisma } from '@/lib/prisma';

export async function listAcademicSessions() {
  return prisma.academicSession.findMany({
    orderBy: { startDate: 'desc' },
    include: {
      _count: { select: { exams: true } },
    },
  });
}

export async function getAcademicSessionById(id: string) {
  return prisma.academicSession.findUnique({
    where: { id },
    include: {
      _count: { select: { exams: true } },
    },
  });
}

export async function getCurrentAcademicSession() {
  return prisma.academicSession.findFirst({
    where: { isCurrent: true },
  });
}

export async function getAcademicSessionsForSelect() {
  return prisma.academicSession.findMany({
    orderBy: { startDate: 'desc' },
    select: { id: true, name: true, isCurrent: true },
  });
}
