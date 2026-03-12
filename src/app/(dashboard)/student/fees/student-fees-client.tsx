'use client';

import { useMyFees, useMyCreditBalance } from '@/modules/fees/hooks/use-fee-data';
import { SkeletonTable } from '@/components/shared/skeletons';
import { StudentFeesView } from './student-fees-view';

export function StudentFeesClient() {
  const { data: fees, isLoading } = useMyFees();
  const { data: creditBalance } = useMyCreditBalance();

  if (isLoading || !fees) {
    return <SkeletonTable />;
  }

  return <StudentFeesView fees={fees} creditBalance={creditBalance ?? 0} />;
}
