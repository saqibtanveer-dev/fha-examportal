import { Suspense } from 'react';
import { StudentFeesClient } from './student-fees-client';
import { SkeletonTable } from '@/components/shared/skeletons';

export default function StudentFeesPage() {
  return (
    <Suspense fallback={<SkeletonTable />}>
      <StudentFeesClient />
    </Suspense>
  );
}
