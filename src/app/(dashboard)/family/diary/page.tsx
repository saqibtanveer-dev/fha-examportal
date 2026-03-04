import { Suspense } from 'react';
import { requireRole } from '@/lib/auth-utils';
import { FamilyDiaryClient } from '@/modules/family/components';
import { SkeletonDashboard } from '@/components/shared';

export default async function FamilyDiaryPage() {
  await requireRole('FAMILY');

  return (
    <Suspense fallback={<SkeletonDashboard />}>
      <FamilyDiaryClient />
    </Suspense>
  );
}
