import { Suspense } from 'react';
import { PrincipalTimetableClient } from './timetable-page-client';
import { SkeletonPage } from '@/components/shared';

export default function PrincipalTimetablePage() {
  return (
    <Suspense fallback={<SkeletonPage />}>
      <PrincipalTimetableClient />
    </Suspense>
  );
}
