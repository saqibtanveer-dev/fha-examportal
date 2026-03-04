import { Suspense } from 'react';
import { StudentDiaryClient } from './diary-page-client';
import { SkeletonPage } from '@/components/shared';

export default function StudentDiaryPage() {
  return (
    <Suspense fallback={<SkeletonPage />}>
      <StudentDiaryClient />
    </Suspense>
  );
}
