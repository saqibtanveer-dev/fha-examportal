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

/**
 * Get elective groups for a class with subject counts and enrollment counts.
 */
export async function getElectiveGroupsForClass(classId: string, academicSessionId: string) {
  const links = await prisma.subjectClassLink.findMany({
    where: { classId, isElective: true, isActive: true },
    select: {
      subjectId: true,
      electiveGroupName: true,
      subject: { select: { id: true, name: true, code: true } },
    },
    orderBy: { electiveGroupName: 'asc' },
  });

  // Group by electiveGroupName
  const groups = new Map<string, typeof links>();
  for (const link of links) {
    const groupName = link.electiveGroupName ?? 'Ungrouped';
    const existing = groups.get(groupName) ?? [];
    existing.push(link);
    groups.set(groupName, existing);
  }

  // Get enrollment counts per subject
  const enrollmentCounts = await prisma.studentSubjectEnrollment.groupBy({
    by: ['subjectId'],
    where: {
      classId,
      academicSessionId,
      isActive: true,
      subjectId: { in: links.map((l) => l.subjectId) },
    },
    _count: true,
  });
  const countMap = new Map(enrollmentCounts.map((e) => [e.subjectId, e._count]));

  return Array.from(groups.entries()).map(([groupName, subjects]) => ({
    groupName,
    subjects: subjects.map((s) => ({
      ...s.subject,
      enrolledCount: countMap.get(s.subjectId) ?? 0,
    })),
  }));
}

/**
 * Get students NOT yet enrolled in any subject within an elective group.
 */
export async function getUnassignedStudentsForElectiveGroup(
  classId: string,
  sectionId: string,
  electiveGroupName: string,
  academicSessionId: string,
) {
  // Get all subject IDs in this group
  const groupSubjects = await prisma.subjectClassLink.findMany({
    where: { classId, electiveGroupName, isElective: true, isActive: true },
    select: { subjectId: true },
  });
  const subjectIds = groupSubjects.map((s) => s.subjectId);

  // Get students who ARE enrolled in any of these subjects
  const enrolledStudentIds = await prisma.studentSubjectEnrollment.findMany({
    where: {
      subjectId: { in: subjectIds },
      academicSessionId,
      isActive: true,
    },
    select: { studentProfileId: true },
  });
  const enrolledSet = new Set(enrolledStudentIds.map((e) => e.studentProfileId));

  // Get all section students and filter out enrolled ones
  const sectionStudents = await prisma.studentProfile.findMany({
    where: { classId, sectionId, status: 'ACTIVE' },
    select: {
      id: true,
      rollNumber: true,
      user: { select: { firstName: true, lastName: true } },
    },
    orderBy: { rollNumber: 'asc' },
  });

  return sectionStudents.filter((s) => !enrolledSet.has(s.id));
}
