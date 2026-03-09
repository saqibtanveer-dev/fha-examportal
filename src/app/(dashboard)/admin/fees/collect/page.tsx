import { Suspense } from 'react';
import { CollectPageClient } from './collect-page-client';
import { SkeletonCardGrid } from '@/components/shared/skeletons';

export default function CollectPaymentPage() {
  return (
    <Suspense fallback={<SkeletonCardGrid count={4} />}>
      <CollectPageClient />
    </Suspense>
  );
}
