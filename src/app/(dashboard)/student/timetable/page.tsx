import { Suspense } from 'react';
import { StudentTimetableClient } from './timetable-page-client';
import { SkeletonPage } from '@/components/shared';

export default function StudentTimetablePage() {
  return (
    <Suspense fallback={<SkeletonPage />}>
      <StudentTimetableClient />
    </Suspense>
  );
}
