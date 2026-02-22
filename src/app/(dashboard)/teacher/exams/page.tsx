import { Suspense } from 'react';
import { requireRole } from '@/lib/auth-utils';
import { ExamsPageClient } from './exams-page-client';
import { ExamsSkeleton } from './exams-skeleton';

type Props = {
  searchParams: Promise<{ page?: string; status?: string; search?: string }>;
};

export default async function ExamsPage({ searchParams }: Props) {
  const session = await requireRole('TEACHER', 'ADMIN');
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? '1', 10));

  const filters = {
    status: params.status as 'DRAFT' | 'PUBLISHED' | 'ACTIVE' | 'COMPLETED' | undefined,
    search: params.search,
    createdById: session.user.role === 'TEACHER' ? session.user.id : undefined,
  };

  // Client-first: React Query handles caching
  return (
    <Suspense fallback={<ExamsSkeleton />}>
      <ExamsPageClient
        filters={filters}
        pagination={{ page, pageSize: 20 }}
      />
    </Suspense>
  );
}
