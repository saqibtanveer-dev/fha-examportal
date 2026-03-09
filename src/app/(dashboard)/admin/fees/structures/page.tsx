import { Suspense } from 'react';
import { StructuresPageClient } from './structures-page-client';
import { SkeletonTable } from '@/components/shared/skeletons';

export default function FeeStructuresPage() {
  return (
    <Suspense fallback={<SkeletonTable />}>
      <StructuresPageClient />
    </Suspense>
  );
}
