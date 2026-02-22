import { Suspense } from 'react';
import { ClassesPageClient } from './classes-page-client';
import { ClassesListSkeleton } from './classes-skeleton';

export default function ClassesPage() {
  return (
    <Suspense fallback={<ClassesListSkeleton />}>
      <ClassesPageClient />
    </Suspense>
  );
}
