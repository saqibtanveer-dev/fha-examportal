import { Suspense } from 'react';
import { requireRole } from '@/lib/auth-utils';
import { TeacherResultsClient } from './teacher-results-client';
import { ResultsSkeleton } from './results-skeleton';

export default async function TeacherResultsPage() {
  await requireRole('TEACHER', 'ADMIN');
  return (
    <Suspense fallback={<ResultsSkeleton />}>
      <TeacherResultsClient />
    </Suspense>
  );
}
