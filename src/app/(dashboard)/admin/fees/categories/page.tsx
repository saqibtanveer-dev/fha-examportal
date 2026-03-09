import { Suspense } from 'react';
import { CategoriesPageClient } from './categories-page-client';
import { SkeletonTable } from '@/components/shared/skeletons';

export default function FeeCategoriesPage() {
  return (
    <Suspense fallback={<SkeletonTable />}>
      <CategoriesPageClient />
    </Suspense>
  );
}
