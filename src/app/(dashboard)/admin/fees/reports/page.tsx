import { Suspense } from 'react';
import { ReportsPageClient } from './reports-page-client';
import { SkeletonCardGrid } from '@/components/shared/skeletons';

export default function FeeReportsPage() {
  return (
    <Suspense fallback={<SkeletonCardGrid count={4} />}>
      <ReportsPageClient />
    </Suspense>
  );
}
