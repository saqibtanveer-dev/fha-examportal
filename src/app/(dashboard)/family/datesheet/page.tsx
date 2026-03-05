import { Suspense } from 'react';
import { FamilyDatesheetClient } from './datesheet-client';
import { SkeletonPage } from '@/components/shared';

export default function FamilyDatesheetPage() {
  return (
    <Suspense fallback={<SkeletonPage />}>
      <FamilyDatesheetClient />
    </Suspense>
  );
}
