import { Suspense } from 'react';
import { requireRole } from '@/lib/auth-utils';
import { StudentResultsPageClient } from '@/modules/results/components/student-results-page-client';
import { StudentResultsSkeleton } from '@/modules/results/components/student-results-skeleton';

export default async function StudentResultsPage() {
  // Auth check only - no data fetching
  await requireRole('STUDENT');

  return (
    <Suspense fallback={<StudentResultsSkeleton />}>
      <StudentResultsPageClient />
    </Suspense>
  );
}
