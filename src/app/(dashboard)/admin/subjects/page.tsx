import { Suspense } from 'react';
import { SubjectsPageClient } from './subjects-page-client';
import { SubjectsListSkeleton } from './subjects-skeleton';

export default function SubjectsPage() {
  return (
    <Suspense fallback={<SubjectsListSkeleton />}>
      <SubjectsPageClient />
    </Suspense>
  );
}
