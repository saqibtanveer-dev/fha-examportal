import { listQuestions } from '@/modules/questions/question-queries';
import { listSubjects } from '@/modules/subjects/subject-queries';
import { auth } from '@/lib/auth';
import { serialize } from '@/utils/serialize';
import { QuestionsPageClient } from './questions-page-client';

type Props = {
  searchParams: Promise<{
    page?: string;
    search?: string;
    subjectId?: string;
    type?: string;
    difficulty?: string;
  }>;
};

export default async function QuestionsPage({ searchParams }: Props) {
  const session = await auth();
  const params = await searchParams;

  const page = Math.max(1, parseInt(params.page ?? '1', 10));
  const result = await listQuestions(
    { page, pageSize: 20 },
    {
      search: params.search,
      subjectId: params.subjectId,
      type: params.type as 'MCQ' | 'SHORT_ANSWER' | 'LONG_ANSWER' | undefined,
      difficulty: params.difficulty as 'EASY' | 'MEDIUM' | 'HARD' | undefined,
      createdById: session?.user.role === 'TEACHER' ? session.user.id : undefined,
    },
  );

  const subjects = await listSubjects();

  return (
    <QuestionsPageClient
      result={serialize(result)}
      subjects={subjects.map((s) => ({ id: s.id, name: s.name, code: s.code }))}
    />
  );
}
