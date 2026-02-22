import { Suspense } from 'react';
import { requireRole } from '@/lib/auth-utils';
import { PageHeader } from '@/components/shared';
import { ClassesPageClient } from './classes-page-client';
import { ClassesListSkeleton } from './classes-skeleton';

export default async function PrincipalClassesPage() {
  await requireRole('PRINCIPAL');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Classes"
        description="Class-wise overview with student counts and performance metrics"
      />
      <Suspense fallback={<ClassesListSkeleton />}>
        <ClassesPageClient />
      </Suspense>
    </div>
  );
}
