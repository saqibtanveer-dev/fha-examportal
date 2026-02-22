import { Suspense } from 'react';
import { requireRole } from '@/lib/auth-utils';
import { StudentExamsPageClient } from './student-exams-page-client';
import { StudentExamsSkeleton } from './student-exams-skeleton';

export default async function StudentExamsPage() {
  await requireRole('STUDENT');

  return (
    <Suspense fallback={<StudentExamsSkeleton />}>
      <StudentExamsPageClient />
    </Suspense>
  );
}
