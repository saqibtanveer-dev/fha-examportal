import { Suspense } from 'react';
import { requireRole } from '@/lib/auth-utils';
import { PageHeader } from '@/components/shared';
import { TeachersPageClient } from './teachers-page-client';
import { TeachersListSkeleton } from './teachers-skeleton';

export default async function PrincipalTeachersPage() {
  await requireRole('PRINCIPAL');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Teachers"
        description="Monitor all teachers, their exams, and performance"
      />
      <Suspense fallback={<TeachersListSkeleton />}>
        <TeachersPageClient />
      </Suspense>
    </div>
  );
}
