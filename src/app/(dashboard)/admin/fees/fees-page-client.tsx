'use client';

import { useFeeOverview, useClassWiseSummary, useFeeSettings } from '@/modules/fees/hooks/use-fee-admin';
import { SkeletonCardGrid } from '@/components/shared/skeletons';
import { FeesOverviewView } from './fees-overview-view';
import { AlertCircle } from 'lucide-react';

export function FeesPageClient() {
  const { data: overview, isLoading: overviewLoading, isError: overviewError } = useFeeOverview();
  const { data: classSummary, isLoading: classLoading, isError: classError } = useClassWiseSummary();
  const { data: settings } = useFeeSettings();

  if (overviewLoading || classLoading) {
    return <SkeletonCardGrid count={4} />;
  }

  if (overviewError || classError) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-destructive/50 bg-destructive/5 p-8 text-center">
        <AlertCircle className="h-8 w-8 text-destructive" />
        <p className="text-sm font-medium text-destructive">Failed to load fee data</p>
        <p className="text-xs text-muted-foreground">
          Check that fee tables are migrated and the database is reachable.
        </p>
      </div>
    );
  }

  return (
    <FeesOverviewView
      overview={overview ?? null}
      classSummary={classSummary ?? []}
      settings={settings ?? null}
    />
  );
}
