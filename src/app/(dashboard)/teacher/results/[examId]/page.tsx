import { getResultsByExamPage } from '@/modules/results/result-queries';
import { ResultsTable } from '@/modules/results/components';
import { EmptyState } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-utils';
import { redirect } from 'next/navigation';
import { serialize } from '@/utils/serialize';
import { ExamResultsHeader } from './exam-results-header';
import { ExamAnalyticsSection } from './exam-analytics-section';
import Link from 'next/link';

type Props = {
  params: Promise<{ examId: string }>;
  searchParams?: Promise<{ page?: string }>;
};

export default async function ExamResultsPage({ params, searchParams }: Props) {
  const session = await requireRole('TEACHER', 'ADMIN');
  const { examId } = await params;
  const rawPage = Number((await searchParams)?.page ?? '1');
  const page = Number.isFinite(rawPage) ? Math.max(1, Math.floor(rawPage)) : 1;

  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    select: { title: true, createdById: true },
  });
  if (!exam) redirect('/teacher/results');
  if (session.user.role === 'TEACHER' && exam.createdById !== session.user.id) {
    redirect('/teacher/results');
  }

  const resultPage = await getResultsByExamPage(examId, { page, pageSize: 50 });

  const totalPages = Math.max(1, Math.ceil(resultPage.total / resultPage.pageSize));
  const hasPrev = resultPage.page > 1;
  const hasNext = resultPage.page < totalPages;

  function buildPageHref(nextPage: number): string {
    const normalizedPage = Math.max(1, nextPage);
    return normalizedPage === 1
      ? `/teacher/results/${examId}`
      : `/teacher/results/${examId}?page=${normalizedPage}`;
  }

  return (
    <div className="space-y-6">
      <ExamResultsHeader examId={examId} examTitle={exam.title} />

      {resultPage.total === 0 ? (
        <EmptyState title="No results" description="No students graded yet." />
      ) : (
        <>
          <ExamAnalyticsSection examId={examId} />
          <ResultsTable results={serialize(resultPage.results)} viewMode="teacher" examId={examId} />
          <div className="flex items-center justify-between rounded-md border p-3">
            <p className="text-sm text-muted-foreground">
              Showing page {resultPage.page} of {totalPages} ({resultPage.total} results)
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={!hasPrev} asChild={hasPrev}>
                {hasPrev ? (
                  <Link href={buildPageHref(resultPage.page - 1)}>Previous</Link>
                ) : (
                  <span>Previous</span>
                )}
              </Button>
              <Button variant="outline" size="sm" disabled={!hasNext} asChild={hasNext}>
                {hasNext ? (
                  <Link href={buildPageHref(resultPage.page + 1)}>Next</Link>
                ) : (
                  <span>Next</span>
                )}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
