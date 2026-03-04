import { Suspense } from 'react';
import { PrincipalAttendanceClient } from './attendance-page-client';
import { SkeletonPage } from '@/components/shared';

export default function PrincipalAttendancePage() {
  return (
    <Suspense fallback={<SkeletonPage />}>
      <PrincipalAttendanceClient />
    </Suspense>
  );
}
