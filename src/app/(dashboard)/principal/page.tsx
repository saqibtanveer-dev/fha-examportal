import { Suspense } from 'react';
import { requireRole } from '@/lib/auth-utils';
import { PageHeader } from '@/components/shared';
import { PrincipalDashboardWithQuery } from './dashboard-with-query';
import { DashboardSkeleton } from './dashboard-skeleton';

export default async function PrincipalDashboardPage() {
  await requireRole('PRINCIPAL');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Principal Dashboard"
        description="Comprehensive overview of your institution's academic performance"
      />
      <Suspense fallback={<DashboardSkeleton />}>
        <PrincipalDashboardWithQuery />
      </Suspense>
    </div>
  );
}
