import { Suspense } from 'react';
import { DiscountsPageClient } from './discounts-page-client';
import { SkeletonCardGrid } from '@/components/shared/skeletons';

export default function StudentDiscountsPage() {
  return (
    <Suspense fallback={<SkeletonCardGrid count={4} />}>
      <DiscountsPageClient />
    </Suspense>
  );
}
