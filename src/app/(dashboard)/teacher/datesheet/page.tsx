import { Suspense } from 'react';
import { TeacherDatesheetClient } from './datesheet-client';
import { SkeletonPage } from '@/components/shared';

export default function TeacherDatesheetPage() {
  return (
    <Suspense fallback={<SkeletonPage />}>
      <TeacherDatesheetClient />
    </Suspense>
  );
}
