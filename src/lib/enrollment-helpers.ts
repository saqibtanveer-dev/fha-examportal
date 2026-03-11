import { prisma } from '@/lib/prisma';
import { cache } from 'react';

/**
 * Check if a subject is elective for a given class.
 * Request-scoped cache prevents redundant DB hits.
 */
export const isSubjectElectiveForClass = cache(
  async (subjectId: string, classId: string): Promise<boolean> => {
    const link = await prisma.subjectClassLink.findUnique({
      where: { subjectId_classId: { subjectId, classId } },
      select: { isElective: true },
    });
    return link?.isElective ?? false;
  },
);

/**
 * Get the elective group name for a subject in a class.
 * Returns null if subject is not elective or has no group.
 */
export const getElectiveGroupName = cache(
  async (subjectId: string, classId: string): Promise<string | null> => {
    const link = await prisma.subjectClassLink.findUnique({
      where: { subjectId_classId: { subjectId, classId } },
      select: { isElective: true, electiveGroupName: true },
    });
    if (!link?.isElective) return null;
    return link.electiveGroupName;
  },
);

/**
 * Get enrolled students for a subject in a specific section.
 * For compulsory subjects, returns ALL section students.
 * For elective subjects, returns ONLY enrolled students.
 */
export async function getStudentsForSubject(
  subjectId: string,
  classId: string,
  sectionId: string,
  academicSessionId: string,
) {
  const isElective = await isSubjectElectiveForClass(subjectId, classId);

  if (!isElective) {
    return prisma.studentProfile.findMany({
      where: { classId, sectionId, status: 'ACTIVE' },
      select: {
        id: true,
        rollNumber: true,
        userId: true,
        user: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { rollNumber: 'asc' },
    });
  }

  const enrollments = await prisma.studentSubjectEnrollment.findMany({
    where: { subjectId, classId, academicSessionId, isActive: true },
    select: {
      studentProfile: {
        select: {
          id: true,
          rollNumber: true,
          sectionId: true,
          userId: true,
          user: { select: { id: true, firstName: true, lastName: true } },
        },
      },
    },
  });

  return enrollments
    .filter((e) => e.studentProfile.sectionId === sectionId)
    .map((e) => e.studentProfile)
    .sort((a, b) => a.rollNumber.localeCompare(b.rollNumber));
}

/**
 * Check if a student is enrolled in a subject.
 * For compulsory subjects, always returns true.
 */
export async function isStudentEnrolledInSubject(
  studentProfileId: string,
  subjectId: string,
  classId: string,
  academicSessionId: string,
): Promise<boolean> {
  const isElective = await isSubjectElectiveForClass(subjectId, classId);
  if (!isElective) return true;

  const enrollment = await prisma.studentSubjectEnrollment.findFirst({
    where: { studentProfileId, subjectId, academicSessionId, isActive: true },
    select: { id: true },
  });
  return !!enrollment;
}

/**
 * Get all subject IDs a student should see: compulsory subjects for their class
 * + enrolled elective subjects. Used to filter diary entries, etc.
 */
export const getStudentVisibleSubjectIds = cache(
  async (
    studentProfileId: string,
    classId: string,
    academicSessionId: string,
  ): Promise<Set<string>> => {
    const [compulsory, electives] = await Promise.all([
      prisma.subjectClassLink.findMany({
        where: { classId, isElective: false, isActive: true },
        select: { subjectId: true },
      }),
      prisma.studentSubjectEnrollment.findMany({
        where: { studentProfileId, academicSessionId, isActive: true },
        select: { subjectId: true },
      }),
    ]);

    const ids = new Set<string>();
    for (const s of compulsory) ids.add(s.subjectId);
    for (const e of electives) ids.add(e.subjectId);
    return ids;
  },
);

/**
 * Get all elective subjects a student is enrolled in for a session.
 */
export async function getStudentElectiveSubjects(
  studentProfileId: string,
  academicSessionId: string,
) {
  return prisma.studentSubjectEnrollment.findMany({
    where: { studentProfileId, academicSessionId, isActive: true },
    select: {
      subjectId: true,
      subject: { select: { id: true, name: true, code: true } },
    },
  });
}

/**
 * Validate that enrolling a student in a subject won't conflict
 * with existing enrollments in the same elective group.
 * Returns the conflicting subject name if there's a conflict, null otherwise.
 */
export async function validateElectiveGroupConflict(
  studentProfileId: string,
  subjectId: string,
  classId: string,
  academicSessionId: string,
): Promise<string | null> {
  const groupName = await getElectiveGroupName(subjectId, classId);
  if (!groupName) return null;

  // Get all subjects in the same elective group
  const groupSubjects = await prisma.subjectClassLink.findMany({
    where: { classId, electiveGroupName: groupName, isActive: true },
    select: { subjectId: true, subject: { select: { name: true } } },
  });

  const otherSubjectIds = groupSubjects
    .filter((s) => s.subjectId !== subjectId)
    .map((s) => s.subjectId);

  if (otherSubjectIds.length === 0) return null;

  // Check if student is already enrolled in any competing subject
  const conflict = await prisma.studentSubjectEnrollment.findFirst({
    where: {
      studentProfileId,
      subjectId: { in: otherSubjectIds },
      academicSessionId,
      isActive: true,
    },
    select: { subject: { select: { name: true } } },
  });

  return conflict?.subject.name ?? null;
}
