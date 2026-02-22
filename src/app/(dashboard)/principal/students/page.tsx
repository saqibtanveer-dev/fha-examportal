import { Suspense } from 'react';
import { requireRole } from '@/lib/auth-utils';
import { PageHeader } from '@/components/shared';
import { StudentsPageClient } from './students-page-client';
import { StudentsListSkeleton } from './students-skeleton';

export default async function PrincipalStudentsPage() {
  await requireRole('PRINCIPAL');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Students"
        description="View all students, their performance, and class-wise breakdown"
      />
      <Suspense fallback={<StudentsListSkeleton />}>
        <StudentsPageClient />
      </Suspense>
    </div>
  );
}
