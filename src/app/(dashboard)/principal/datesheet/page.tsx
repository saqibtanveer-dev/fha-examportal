import { Suspense } from 'react';
import { PrincipalDatesheetClient } from './datesheet-client';
import { SkeletonPage } from '@/components/shared';

export default function PrincipalDatesheetPage() {
  return (
    <Suspense fallback={<SkeletonPage />}>
      <PrincipalDatesheetClient />
    </Suspense>
  );
}
