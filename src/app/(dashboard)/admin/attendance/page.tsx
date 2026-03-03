import { Suspense } from 'react';
import { AttendancePageClient } from './attendance-page-client';
import { SkeletonPage } from '@/components/shared';

export default function AttendancePage() {
  return (
    <Suspense fallback={<SkeletonPage />}>
      <AttendancePageClient />
    </Suspense>
  );
}
