import { prisma } from '@/lib/prisma';

/**
 * Get all subject enrollments for a student in an academic session.
 * Returns the subjects the student is enrolled in (used to filter electives).
 */
export async function getStudentSubjectEnrollments(
  studentProfileId: string,
  academicSessionId: string,
) {
  return prisma.studentSubjectEnrollment.findMany({
    where: { studentProfileId, academicSessionId, isActive: true },
    select: {
      id: true,
      subjectId: true,
      classId: true,
      subject: { select: { id: true, name: true, code: true } },
    },
  });
}

/**
 * Get enrolled subject IDs for a student (fast lookup).
 */
export async function getStudentEnrolledSubjectIds(
  studentProfileId: string,
  academicSessionId: string,
): Promise<Set<string>> {
  const enrollments = await prisma.studentSubjectEnrollment.findMany({
    where: { studentProfileId, academicSessionId, isActive: true },
    select: { subjectId: true },
  });
  return new Set(enrollments.map((e) => e.subjectId));
}

/**
 * Get all students enrolled in a specific subject for a class/session.
 * Used for attendance marking — only show students who actually take this subject.
 */
export async function getStudentsEnrolledInSubject(
  subjectId: string,
  classId: string,
  academicSessionId: string,
) {
  return prisma.studentSubjectEnrollment.findMany({
    where: { subjectId, classId, academicSessionId, isActive: true },
    select: {
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
  });
}

/**
 * Check if a subject is elective for a class.
 * If it's elective, only enrolled students should be shown.
 */
export async function isSubjectElective(subjectId: string, classId: string): Promise<boolean> {
  const link = await prisma.subjectClassLink.findUnique({
    where: { subjectId_classId: { subjectId, classId } },
    select: { isElective: true },
  });
  return link?.isElective ?? false;
}

/**
 * Get elective subjects for a class with their group names.
 */
export async function getElectiveSubjectsForClass(classId: string) {
  return prisma.subjectClassLink.findMany({
    where: { classId, isElective: true, isActive: true },
    select: {
      subjectId: true,
      electiveGroupName: true,
      subject: { select: { id: true, name: true, code: true } },
    },
    orderBy: { electiveGroupName: 'asc' },
  });
}

/**
 * Check if any enrollments exist for a class/session.
 * Used to determine if we should apply enrollment filtering or skip it
 * (backwards compatibility — if no enrollments configured, show all students).
 */
export async function hasEnrollmentsForClass(
  classId: string,
  academicSessionId: string,
): Promise<boolean> {
  const count = await prisma.studentSubjectEnrollment.count({
    where: { classId, academicSessionId, isActive: true },
  });
  return count > 0;
}
