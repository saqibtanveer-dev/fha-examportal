export const dynamic = 'force-dynamic';

import { getResultsByExam, getExamDetailedAnalytics } from '@/modules/results/result-queries';
import { ResultsTable, ExamDetailedAnalyticsDashboard } from '@/modules/results/components';
import { EmptyState } from '@/components/shared';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-utils';
import { redirect } from 'next/navigation';
import { serialize } from '@/utils/serialize';
import { ExamResultsHeader } from './exam-results-header';

type Props = { params: Promise<{ examId: string }> };

export default async function ExamResultsPage({ params }: Props) {
  const session = await requireRole('TEACHER', 'ADMIN');
  const { examId } = await params;

  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    select: { title: true, createdById: true },
  });
  if (!exam) redirect('/teacher/results');
  if (session.user.role === 'TEACHER' && exam.createdById !== session.user.id) {
    redirect('/teacher/results');
  }

  const [results, detailedAnalytics] = await Promise.all([
    getResultsByExam(examId),
    getExamDetailedAnalytics(examId),
  ]);

  return (
    <div className="space-y-6">
      <ExamResultsHeader examId={examId} examTitle={exam.title} />

      {!detailedAnalytics || results.length === 0 ? (
        <EmptyState title="No results" description="No students graded yet." />
      ) : (
        <>
          <ExamDetailedAnalyticsDashboard analytics={detailedAnalytics} />
          <ResultsTable results={serialize(results)} viewMode="teacher" examId={examId} />
        </>
      )}
    </div>
  );
}
