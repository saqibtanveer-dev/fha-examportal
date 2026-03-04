import { Suspense } from 'react';
import { PrincipalDiaryClient } from './diary-page-client';
import { SkeletonPage } from '@/components/shared';

export default function PrincipalDiaryPage() {
  return (
    <Suspense fallback={<SkeletonPage />}>
      <PrincipalDiaryClient />
    </Suspense>
  );
}
