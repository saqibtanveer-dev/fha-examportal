import { Suspense } from 'react';
import { requireRole } from '@/lib/auth-utils';
import { FamilyResultsClient } from '@/modules/family/components';
import { SkeletonDashboard } from '@/components/shared';

export default async function FamilyExamsPage() {
  await requireRole('FAMILY');

  return (
    <Suspense fallback={<SkeletonDashboard />}>
      <FamilyResultsClient />
    </Suspense>
  );
}
