import { Suspense } from 'react';
import { TeacherAttendanceClient } from './attendance-page-client';
import { SkeletonPage } from '@/components/shared';

export default function TeacherAttendancePage() {
  return (
    <Suspense fallback={<SkeletonPage />}>
      <TeacherAttendanceClient />
    </Suspense>
  );
}
