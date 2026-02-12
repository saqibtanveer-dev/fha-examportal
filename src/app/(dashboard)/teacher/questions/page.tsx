export const dynamic = 'force-dynamic';

import { listQuestions } from '@/modules/questions/question-queries';
import { listSubjects, getSubjectsForTeacher } from '@/modules/subjects/subject-queries';
import { getTeacherProfileId } from '@/modules/users/user-queries';
import { listTags } from '@/modules/tags/tag-queries';
import { requireRole } from '@/lib/auth-utils';
import { serialize } from '@/utils/serialize';
import { QuestionsPageClient } from './questions-page-client';
import { prisma } from '@/lib/prisma';

type Props = {
  searchParams: Promise<{
    page?: string;
    search?: string;
    subjectId?: string;
    classId?: string;
    type?: string;
    difficulty?: string;
  }>;
};

export default async function QuestionsPage({ searchParams }: Props) {
  const session = await requireRole('TEACHER', 'ADMIN');
  const params = await searchParams;

  const page = Math.max(1, parseInt(params.page ?? '1', 10));
  const result = await listQuestions(
    { page, pageSize: 20 },
    {
      search: params.search,
      subjectId: params.subjectId,
      classId: params.classId,
      type: params.type as 'MCQ' | 'SHORT_ANSWER' | 'LONG_ANSWER' | undefined,
      difficulty: params.difficulty as 'EASY' | 'MEDIUM' | 'HARD' | undefined,
      createdById: session.user.role === 'TEACHER' ? session.user.id : undefined,
    },
  );

  // Get teacher-scoped subjects if teacher has assignments; else fallback to all
  let subjects: { id: string; name: string; code: string }[] = [];
  let subjectClassLinks: { subjectId: string; classId: string; className: string }[] = [];

  if (session.user.role === 'TEACHER') {
    const teacherProfileId = await getTeacherProfileId(session.user.id);
    if (teacherProfileId) {
      const teacherSubjects = await getSubjectsForTeacher(teacherProfileId);
      if (teacherSubjects.length > 0) {
        // De-duplicate subjects
        const subjectMap = new Map<string, { id: string; name: string; code: string }>();
        for (const ts of teacherSubjects) {
          subjectMap.set(ts.subject.id, ts.subject);
        }
        subjects = Array.from(subjectMap.values());
      }
    }
  }

  if (subjects.length === 0) {
    const allSubjects = await listSubjects();
    subjects = allSubjects.map((s) => ({ id: s.id, name: s.name, code: s.code }));
  }

  // Get subject-class links for the available subjects
  const links = await prisma.subjectClassLink.findMany({
    where: { subjectId: { in: subjects.map((s) => s.id) }, isActive: true },
    include: { class: { select: { id: true, name: true } } },
  });
  subjectClassLinks = links.map((l) => ({
    subjectId: l.subjectId,
    classId: l.classId,
    className: l.class.name,
  }));

  const tags = await listTags();

  return (
    <QuestionsPageClient
      result={serialize(result)}
      subjects={subjects}
      subjectClassLinks={subjectClassLinks}
      tags={tags.map((t) => ({ id: t.id, name: t.name, category: t.category, _count: t._count }))}
    />
  );
}
