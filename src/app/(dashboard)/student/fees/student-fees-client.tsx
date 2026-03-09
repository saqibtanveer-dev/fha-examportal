'use client';

import { useMyFees } from '@/modules/fees/hooks/use-fee-data';
import { SkeletonTable } from '@/components/shared/skeletons';
import { StudentFeesView } from './student-fees-view';

export function StudentFeesClient() {
  const { data: fees, isLoading } = useMyFees();

  if (isLoading || !fees) {
    return <SkeletonTable />;
  }

  return <StudentFeesView fees={fees} />;
}
