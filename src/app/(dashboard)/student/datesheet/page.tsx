import { Suspense } from 'react';
import { StudentDatesheetClient } from './datesheet-client';
import { SkeletonPage } from '@/components/shared';

export default function StudentDatesheetPage() {
  return (
    <Suspense fallback={<SkeletonPage />}>
      <StudentDatesheetClient />
    </Suspense>
  );
}
