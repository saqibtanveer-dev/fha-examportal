import { Suspense } from 'react';
import { FamilyFeesClient } from './family-fees-client';
import { SkeletonTable } from '@/components/shared/skeletons';

export default function FamilyFeesPage() {
  return (
    <Suspense fallback={<SkeletonTable />}>
      <FamilyFeesClient />
    </Suspense>
  );
}
