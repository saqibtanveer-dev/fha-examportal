import { Suspense } from 'react';
import { TeacherTimetableClient } from './timetable-page-client';
import { SkeletonPage } from '@/components/shared';

export default function TeacherTimetablePage() {
  return (
    <Suspense fallback={<SkeletonPage />}>
      <TeacherTimetableClient />
    </Suspense>
  );
}
