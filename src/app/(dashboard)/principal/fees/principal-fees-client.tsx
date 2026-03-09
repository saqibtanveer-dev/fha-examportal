'use client';

import { useFeeOverview, useClassWiseSummary, useDefaulterList } from '@/modules/fees/hooks/use-fee-admin';
import { PrincipalFeesView } from './principal-fees-view';
import { Skeleton } from '@/components/ui/skeleton';

export function PrincipalFeesClient() {
  const overview = useFeeOverview();
  const classWise = useClassWiseSummary();
  const defaulters = useDefaulterList();

  if (overview.isLoading || classWise.isLoading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <PrincipalFeesView
      overview={overview.data ?? null}
      classWise={classWise.data ?? []}
      defaulters={defaulters.data ?? []}
    />
  );
}
