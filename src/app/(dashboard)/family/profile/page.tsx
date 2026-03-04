import { Suspense } from 'react';
import { requireRole } from '@/lib/auth-utils';
import { FamilyProfileClient } from '@/modules/family/components';
import { SkeletonDashboard } from '@/components/shared';

export default async function FamilyProfilePage() {
  await requireRole('FAMILY');

  return (
    <Suspense fallback={<SkeletonDashboard />}>
      <FamilyProfileClient />
    </Suspense>
  );
}
