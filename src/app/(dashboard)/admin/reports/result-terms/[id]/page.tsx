import { notFound } from 'next/navigation';
import { requireRole } from '@/lib/auth-utils';
import { PageHeader } from '@/components/shared';
import { getResultTermWithGroups, getAvailableExamsForTerm } from '@/modules/reports/queries/result-term-queries';
import { ResultTermDetailClient } from '@/modules/reports/components/screens/result-term-detail-client';

export const metadata = { title: 'Configure Result Term' };

type Props = { params: Promise<{ id: string }> };

export default async function ResultTermDetailPage({ params }: Props) {
  await requireRole('ADMIN', 'PRINCIPAL');
  const { id } = await params;

  let term: Awaited<ReturnType<typeof getResultTermWithGroups>> = null;
  let availableExams: Awaited<ReturnType<typeof getAvailableExamsForTerm>> = [];
  try {
    [term, availableExams] = await Promise.all([
      getResultTermWithGroups(id),
      getAvailableExamsForTerm(id),
    ]);
  } catch {
    // DB temporarily unreachable — treat as not found
    notFound();
  }

  if (!term) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        title={term.name}
        description={`${term.class.name} · ${term.academicSession.name}`}
        breadcrumbs={[
          { label: 'Reports', href: '/admin/reports' },
          { label: 'Result Terms', href: '/admin/reports/result-terms' },
          { label: term.name },
        ]}
      />
      <ResultTermDetailClient term={term} availableExams={availableExams} />
    </div>
  );
}
