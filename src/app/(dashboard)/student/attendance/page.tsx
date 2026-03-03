import { Suspense } from 'react';
import { StudentAttendanceClient } from './attendance-page-client';
import { SkeletonPage } from '@/components/shared';

export default function StudentAttendancePage() {
  return (
    <Suspense fallback={<SkeletonPage />}>
      <StudentAttendanceClient />
    </Suspense>
  );
}
