import { prisma } from '@/lib/prisma';

export async function listSubjects() {
  return prisma.subject.findMany({
    orderBy: { name: 'asc' },
    include: {
      department: { select: { id: true, name: true } },
      _count: { select: { questions: true, exams: true } },
    },
  });
}

export async function getSubjectById(id: string) {
  return prisma.subject.findUnique({
    where: { id },
    include: {
      department: true,
      teacherSubjects: { include: { teacher: { include: { user: true } } } },
    },
  });
}

export async function listSubjectsByDepartment(departmentId: string) {
  return prisma.subject.findMany({
    where: { departmentId, isActive: true },
    orderBy: { name: 'asc' },
  });
}
