import { Suspense } from 'react';
import { GeneratePageClient } from './generate-page-client';
import { SkeletonCardGrid } from '@/components/shared/skeletons';

export default function GenerateFeesPage() {
  return (
    <Suspense fallback={<SkeletonCardGrid count={3} />}>
      <GeneratePageClient />
    </Suspense>
  );
}
