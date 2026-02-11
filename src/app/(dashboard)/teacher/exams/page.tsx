import { listExams } from '@/modules/exams/exam-queries';
import { listSubjects } from '@/modules/subjects/subject-queries';
import { listActiveClasses } from '@/modules/classes/class-queries';
import { listQuestions } from '@/modules/questions/question-queries';
import { auth } from '@/lib/auth';
import { serialize } from '@/utils/serialize';
import { ExamsPageClient } from './exams-page-client';

type Props = {
  searchParams: Promise<{ page?: string; status?: string; search?: string }>;
};

export default async function ExamsPage({ searchParams }: Props) {
  const session = await auth();
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? '1', 10));

  const [result, subjects, classes, questionResult] = await Promise.all([
    listExams(
      { page, pageSize: 20 },
      {
        status: params.status as 'DRAFT' | 'PUBLISHED' | 'ACTIVE' | 'COMPLETED' | undefined,
        search: params.search,
        createdById: session?.user.role === 'TEACHER' ? session.user.id : undefined,
      },
    ),
    listSubjects(),
    listActiveClasses(),
    listQuestions(
      { page: 1, pageSize: 200 },
      { createdById: session?.user.role === 'TEACHER' ? session.user.id : undefined },
    ),
  ]);

  return (
    <ExamsPageClient
      result={serialize(result)}
      subjects={subjects.map((s) => ({ id: s.id, name: s.name, code: s.code }))}
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
    />
  );
}
