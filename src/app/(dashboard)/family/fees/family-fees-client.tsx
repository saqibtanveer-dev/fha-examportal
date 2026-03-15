'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { SkeletonTable } from '@/components/shared/skeletons';
import { FamilyFeesView } from './family-fees-view';
import { fetchFamilyFeesOverviewAction } from '@/modules/fees/fee-self-service-actions';

export function FamilyFeesClient() {
  const { data, isLoading } = useQuery({
    queryKey: [...queryKeys.fees.all, 'family-overview'],
    queryFn: () => fetchFamilyFeesOverviewAction(),
  });

  if (isLoading || !data) {
    return <SkeletonTable />;
  }

  return <FamilyFeesView data={data} />;
}
