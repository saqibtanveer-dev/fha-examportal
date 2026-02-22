import { Suspense } from 'react';
import { DepartmentsPageClient } from './departments-page-client';
import { DepartmentsListSkeleton } from './departments-skeleton';

export default function DepartmentsPage() {
  return (
    <Suspense fallback={<DepartmentsListSkeleton />}>
      <DepartmentsPageClient />
    </Suspense>
  );
}
