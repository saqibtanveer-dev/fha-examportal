import { Suspense } from 'react';
import { requireRole } from '@/lib/auth-utils';
import { QuestionsPageClient } from './questions-page-client';
import { QuestionsSkeleton } from './questions-skeleton';

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
  const filters = {
    search: params.search,
    subjectId: params.subjectId,
    classId: params.classId,
    type: params.type as 'MCQ' | 'SHORT_ANSWER' | 'LONG_ANSWER' | undefined,
    difficulty: params.difficulty as 'EASY' | 'MEDIUM' | 'HARD' | undefined,
    createdById: session.user.role === 'TEACHER' ? session.user.id : undefined,
  };

  // Client-first: No server data fetch. React Query handles caching.
  // First visit: Client fetches → shows skeleton → renders data.
  // Subsequent visits: React Query uses cache → instant render.
  return (
    <Suspense fallback={<QuestionsSkeleton />}>
      <QuestionsPageClient
        filters={filters}
        pagination={{ page, pageSize: 20 }}
      />
    </Suspense>
  );
}
