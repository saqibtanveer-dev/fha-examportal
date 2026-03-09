import { Suspense } from 'react';
import { FeesPageClient } from './fees-page-client';
import { SkeletonCardGrid } from '@/components/shared/skeletons';

export default function FeesPage() {
  return (
    <Suspense fallback={<SkeletonCardGrid count={4} />}>
      <FeesPageClient />
    </Suspense>
  );
}
