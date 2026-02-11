import { getResultsByExam, getExamAnalytics } from '@/modules/results/result-queries';
import { ResultsTable, ExamAnalyticsChart } from '@/modules/results/components';
import { PageHeader, EmptyState } from '@/components/shared';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

type Props = { params: Promise<{ examId: string }> };

export default async function ExamResultsPage({ params }: Props) {
  const { examId } = await params;

  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    select: { title: true },
  });
  if (!exam) redirect('/teacher/results');

  const [results, analytics] = await Promise.all([
    getResultsByExam(examId),
    getExamAnalytics(examId),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={exam.title}
        description="Exam results and analytics"
        breadcrumbs={[
          { label: 'Teacher', href: '/teacher' },
          { label: 'Results', href: '/teacher/results' },
          { label: exam.title },
        ]}
      />

      {!analytics || results.length === 0 ? (
        <EmptyState title="No results" description="No students graded yet." />
      ) : (
        <>
          <ExamAnalyticsChart analytics={analytics} />
          <ResultsTable results={results} />
        </>
      )}
    </div>
  );
}
