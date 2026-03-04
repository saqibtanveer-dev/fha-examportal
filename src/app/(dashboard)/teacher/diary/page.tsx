import { Suspense } from 'react';
import { TeacherDiaryClient } from './diary-page-client';
import { SkeletonPage } from '@/components/shared';

export default function TeacherDiaryPage() {
  return (
    <Suspense fallback={<SkeletonPage />}>
      <TeacherDiaryClient />
    </Suspense>
  );
}
