import { Suspense } from 'react';
import { DatesheetListClient } from './datesheet-list-client';
import { SkeletonPage } from '@/components/shared';

export default function AdminDatesheetPage() {
  return (
    <Suspense fallback={<SkeletonPage />}>
      <DatesheetListClient />
    </Suspense>
  );
}
