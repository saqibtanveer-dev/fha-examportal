import { Suspense } from 'react';
import { requireRole } from '@/lib/auth-utils';
import { StudentDashboardPageClient, StudentDashboardSkeleton } from '@/modules/sessions/components';

export default async function StudentDashboard() {
  // Auth check only - no data fetching
  await requireRole('STUDENT');

  return (
    <Suspense fallback={<StudentDashboardSkeleton />}>
      <StudentDashboardPageClient />
    </Suspense>
  );
}
