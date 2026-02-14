export const dynamic = 'force-dynamic';

import { requireRole } from '@/lib/auth-utils';
import { notFound } from 'next/navigation';
import { getExamDetail } from '@/modules/principal/principal-queries';
import { getExamDetailedAnalytics } from '@/modules/results/result-queries';
import { ExamDetailClient } from './exam-detail-client';

type Props = {
  params: Promise<{ examId: string }>;
};

export default async function PrincipalExamDetailPage({ params }: Props) {
  await requireRole('PRINCIPAL');
  const { examId } = await params;

  const [examInfo, analytics] = await Promise.all([
    getExamDetail(examId),
    getExamDetailedAnalytics(examId),
  ]);

  if (!examInfo) notFound();

  return (
    <ExamDetailClient
      exam={{
        ...examInfo,
        scheduledStartAt: examInfo.scheduledStartAt?.toISOString() ?? null,
        scheduledEndAt: examInfo.scheduledEndAt?.toISOString() ?? null,
        createdAt: examInfo.createdAt.toISOString(),
        updatedAt: examInfo.updatedAt.toISOString(),
      }}
      analytics={analytics}
    />
  );
}
