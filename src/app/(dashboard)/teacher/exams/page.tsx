export const dynamic = 'force-dynamic';

import { listExams } from '@/modules/exams/exam-queries';
import { listSubjects, getSubjectsForTeacher } from '@/modules/subjects/subject-queries';
import { listActiveClasses } from '@/modules/classes/class-queries';
import { listQuestions } from '@/modules/questions/question-queries';
import { getTeacherProfileId } from '@/modules/users/user-queries';
import { listAcademicSessions } from '@/modules/academic-sessions/session-queries';
import { requireRole } from '@/lib/auth-utils';
import { serialize } from '@/utils/serialize';
import { ExamsPageClient } from './exams-page-client';

type Props = {
  searchParams: Promise<{ page?: string; status?: string; search?: string }>;
};

export default async function ExamsPage({ searchParams }: Props) {
  const session = await requireRole('TEACHER', 'ADMIN');
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? '1', 10));

  const [result, classes, questionResult, academicSessions] = await Promise.all([
    listExams(
      { page, pageSize: 20 },
      {
        status: params.status as 'DRAFT' | 'PUBLISHED' | 'ACTIVE' | 'COMPLETED' | undefined,
        search: params.search,
        createdById: session.user.role === 'TEACHER' ? session.user.id : undefined,
      },
    ),
    listActiveClasses(),
    listQuestions(
      { page: 1, pageSize: 200 },
      { createdById: session.user.role === 'TEACHER' ? session.user.id : undefined },
    ),
    listAcademicSessions(),
  ]);

  // Teacher-scoped subjects
  let subjects: { id: string; name: string; code: string }[] = [];
  if (session.user.role === 'TEACHER') {
    const teacherProfileId = await getTeacherProfileId(session.user.id);
    if (teacherProfileId) {
      const ts = await getSubjectsForTeacher(teacherProfileId);
      if (ts.length > 0) {
        const map = new Map<string, { id: string; name: string; code: string }>();
        for (const t of ts) map.set(t.subject.id, t.subject);
        subjects = Array.from(map.values());
      }
    }
  }
  if (subjects.length === 0) {
    const allSubjects = await listSubjects();
    subjects = allSubjects.map((s) => ({ id: s.id, name: s.name, code: s.code }));
  }

  return (
    <ExamsPageClient
      result={serialize(result)}
      subjects={subjects}
      classes={classes.map((c) => ({
        id: c.id,
        name: c.name,
        sections: c.sections.map((s) => ({ id: s.id, name: s.name })),
      }))}
      questions={questionResult.data.map((q) => ({
        id: q.id,
        title: q.title,
        marks: Number(q.marks),
        type: q.type,
      }))}
      academicSessions={academicSessions.map((s) => ({
        id: s.id,
        name: s.name,
        isCurrent: s.isCurrent,
      }))}
    />
  );
}
