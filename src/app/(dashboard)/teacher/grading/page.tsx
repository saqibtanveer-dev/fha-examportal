import { Suspense } from 'react';
import { requireRole } from '@/lib/auth-utils';
import { GradingPageClient } from './grading-page-client';
import { GradingSkeleton } from './grading-skeleton';

export default async function GradingPage() {
  await requireRole('TEACHER', 'ADMIN');
  return (
    <Suspense fallback={<GradingSkeleton />}>
      <GradingPageClient />
    </Suspense>
  );
}
