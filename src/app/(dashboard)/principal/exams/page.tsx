import { Suspense } from 'react';
import { requireRole } from '@/lib/auth-utils';
import { PageHeader } from '@/components/shared';
import { ExamsPageClient } from './exams-page-client';
import { ExamsListSkeleton } from './exams-skeleton';

export default async function PrincipalExamsPage() {
  await requireRole('PRINCIPAL');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Exams"
        description="Monitor all exams, their participation, and analytics"
      />
      <Suspense fallback={<ExamsListSkeleton />}>
        <ExamsPageClient />
      </Suspense>
    </div>
  );
}
