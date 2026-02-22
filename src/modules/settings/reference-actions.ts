'use server';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-utils';
import type { ActionResult } from '@/types/action-result';

export type ReferenceDataPayload = {
  subjects: { id: string; name: string; code: string }[];
  classes: { id: string; name: string; sections: { id: string; name: string }[] }[];
  academicSessions: { id: string; name: string; isCurrent: boolean }[];
  tags: { id: string; name: string; category: string; _count: { questionTags: number } }[];
  subjectClassLinks: { subjectId: string; classId: string; className: string }[];
  teacherProfileId: string | null;
};

/**
 * Fetches all reference data for the teacher dashboard in a single call.
 * Used for Zustand store hydration at layout level.
 */
export async function fetchTeacherReferenceData(): Promise<ActionResult<ReferenceDataPayload>> {
  const session = await requireRole('TEACHER', 'ADMIN');

  const [allSubjects, classes, academicSessions, tags] = await Promise.all([
    prisma.subject.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, code: true },
    }),
    prisma.class.findMany({
      where: { isActive: true },
      orderBy: { grade: 'asc' },
      include: { sections: { where: { isActive: true }, orderBy: { name: 'asc' }, select: { id: true, name: true } } },
    }),
    prisma.academicSession.findMany({
      orderBy: { startDate: 'desc' },
      select: { id: true, name: true, isCurrent: true },
    }),
    prisma.tag.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { questionTags: true } } },
    }),
  ]);

  // Get teacher-scoped subjects if applicable
  let subjects = allSubjects;
  let teacherProfileId: string | null = null;

  if (session.user.role === 'TEACHER') {
    const profile = await prisma.teacherProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });
    teacherProfileId = profile?.id ?? null;

    if (teacherProfileId) {
      const teacherSubjects = await prisma.teacherSubject.findMany({
        where: { teacherId: teacherProfileId },
        include: { subject: { select: { id: true, name: true, code: true } } },
      });
      if (teacherSubjects.length > 0) {
        const map = new Map<string, { id: string; name: string; code: string }>();
        for (const ts of teacherSubjects) map.set(ts.subject.id, ts.subject);
        subjects = Array.from(map.values());
      }
    }
  }

  // Subject-class links
  const links = await prisma.subjectClassLink.findMany({
    where: { subjectId: { in: subjects.map((s) => s.id) }, isActive: true },
    include: { class: { select: { id: true, name: true } } },
  });

  return {
    success: true,
    data: {
      subjects,
      classes: classes.map((c) => ({ id: c.id, name: c.name, sections: c.sections })),
      academicSessions,
      tags: tags.map((t) => ({ id: t.id, name: t.name, category: t.category, _count: t._count })),
      subjectClassLinks: links.map((l) => ({
        subjectId: l.subjectId,
        classId: l.classId,
        className: l.class.name,
      })),
      teacherProfileId,
    },
  };
}

/**
 * Fetches reference data for admin pages.
 */
export async function fetchAdminReferenceData(): Promise<ActionResult<Pick<ReferenceDataPayload, 'subjects' | 'classes' | 'academicSessions'>>> {
  await requireRole('ADMIN');

  const [subjects, classes, academicSessions] = await Promise.all([
    prisma.subject.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, code: true },
    }),
    prisma.class.findMany({
      where: { isActive: true },
      orderBy: { grade: 'asc' },
      include: { sections: { where: { isActive: true }, orderBy: { name: 'asc' }, select: { id: true, name: true } } },
    }),
    prisma.academicSession.findMany({
      orderBy: { startDate: 'desc' },
      select: { id: true, name: true, isCurrent: true },
    }),
  ]);

  return {
    success: true,
    data: {
      subjects,
      classes: classes.map((c) => ({ id: c.id, name: c.name, sections: c.sections })),
      academicSessions,
    },
  };
}

/**
 * Fetches reference data for principal pages (same shape as admin).
 */
export async function fetchPrincipalReferenceData(): Promise<ActionResult<Pick<ReferenceDataPayload, 'subjects' | 'classes' | 'academicSessions'>>> {
  await requireRole('PRINCIPAL');

  const [subjects, classes, academicSessions] = await Promise.all([
    prisma.subject.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, code: true },
    }),
    prisma.class.findMany({
      where: { isActive: true },
      orderBy: { grade: 'asc' },
      include: { sections: { where: { isActive: true }, orderBy: { name: 'asc' }, select: { id: true, name: true } } },
    }),
    prisma.academicSession.findMany({
      orderBy: { startDate: 'desc' },
      select: { id: true, name: true, isCurrent: true },
    }),
  ]);

  return {
    success: true,
    data: {
      subjects,
      classes: classes.map((c) => ({ id: c.id, name: c.name, sections: c.sections })),
      academicSessions,
    },
  };
}
