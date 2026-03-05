import { Suspense } from 'react';
import { requireRole } from '@/lib/auth-utils';
import { FamilyExamsClient } from '@/modules/family/components';
import { SkeletonDashboard } from '@/components/shared';

export default async function FamilyExamsPage() {
  await requireRole('FAMILY');

  return (
    <Suspense fallback={<SkeletonDashboard />}>
      <FamilyExamsClient />
    </Suspense>
  );
}
