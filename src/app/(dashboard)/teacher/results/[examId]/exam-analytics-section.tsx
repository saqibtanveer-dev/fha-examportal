'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useExamAnalytics } from '@/modules/results/hooks/use-results-query';
import { ExamDetailedAnalyticsDashboard } from '@/modules/results/components';
import type { ExamDetailedAnalytics } from '@/modules/results/result-queries';

type Props = { examId: string };

export function ExamAnalyticsSection({ examId }: Props) {
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);
  const { data, isLoading, isError, refetch, isFetching } = useExamAnalytics(
    analyticsEnabled ? examId : '',
  );

  const analytics = data as ExamDetailedAnalytics | undefined;

  if (!analyticsEnabled) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Detailed Analytics</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Load detailed question/time/integrity analytics on demand for faster initial page render.
          </p>
          <Button onClick={() => setAnalyticsEnabled(true)}>Load Analytics</Button>
        </CardContent>
      </Card>
    );
  }

  if (isLoading || isFetching) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Detailed Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="h-4 w-48 animate-pulse rounded bg-muted" />
            <div className="h-28 animate-pulse rounded bg-muted" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError || !analytics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Detailed Analytics</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-destructive">
            Could not load analytics right now. You can retry without impacting results list.
          </p>
          <Button variant="outline" onClick={() => void refetch()}>
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return <ExamDetailedAnalyticsDashboard analytics={analytics} />;
}