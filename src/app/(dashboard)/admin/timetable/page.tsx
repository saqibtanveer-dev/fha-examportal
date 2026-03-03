import { Suspense } from 'react';
import { TimetablePageClient } from './timetable-page-client';
import { SkeletonPage } from '@/components/shared';

export default function TimetablePage() {
  return (
    <Suspense fallback={<SkeletonPage />}>
      <TimetablePageClient />
    </Suspense>
  );
}
