import { prisma } from '@/lib/prisma';

export async function listSubjects() {
  return prisma.subject.findMany({
    orderBy: { name: 'asc' },
    include: {
      department: { select: { id: true, name: true } },
      _count: { select: { questions: true, exams: true, subjectClassLinks: true } },
      subjectClassLinks: {
        where: { isActive: true },
        include: { class: { select: { id: true, name: true, grade: true } } },
        orderBy: { class: { grade: 'asc' } },
      },
    },
  });
}

export async function getSubjectById(id: string) {
  return prisma.subject.findUnique({
    where: { id },
    include: {
      department: true,
      teacherSubjects: {
        include: {
          teacher: { include: { user: true } },
          class: { select: { id: true, name: true } },
        },
      },
      subjectClassLinks: {
        include: { class: { select: { id: true, name: true, grade: true } } },
        orderBy: { class: { grade: 'asc' } },
      },
    },
  });
}

export async function listSubjectsByDepartment(departmentId: string) {
  return prisma.subject.findMany({
    where: { departmentId, isActive: true },
    orderBy: { name: 'asc' },
  });
}

export async function getSubjectClassLinks(subjectId: string) {
  return prisma.subjectClassLink.findMany({
    where: { subjectId, isActive: true },
    include: { class: { select: { id: true, name: true, grade: true } } },
    orderBy: { class: { grade: 'asc' } },
  });
}

export async function getSubjectsForClass(classId: string) {
  return prisma.subjectClassLink.findMany({
    where: { classId, isActive: true },
    include: {
      subject: {
        select: { id: true, name: true, code: true, departmentId: true },
      },
    },
    orderBy: { subject: { name: 'asc' } },
  });
}

export async function getSubjectsForTeacher(teacherProfileId: string) {
  return prisma.teacherSubject.findMany({
    where: { teacherId: teacherProfileId },
    include: {
      subject: { select: { id: true, name: true, code: true } },
      class: { select: { id: true, name: true } },
    },
  });
}
