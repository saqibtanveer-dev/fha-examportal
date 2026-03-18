'use client';

import { Suspense } from 'react';
import { useStudentResults } from '../hooks/use-results-query';
import { ResultsTable, StudentAnalyticsChart } from './index';
import { PageHeader, EmptyState } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StudentResultsSkeleton } from './student-results-skeleton';

function StudentResultsContent() {
  const { data, isLoading, error, refetch } = useStudentResults();

  if (isLoading) return <StudentResultsSkeleton />;

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="My Results" description="View your exam results and performance" />
        <EmptyState
          title="Error loading results"
          description="There was an error loading your results. Please try again."
          action={
            <Button variant="outline" onClick={() => refetch()}>
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  if (!data || data.results.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader title="My Results" description="View your exam results and performance" />
        <EmptyState title="No results" description="You haven't completed any exams yet." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="My Results" description="View your exam results and performance" />
      <Tabs defaultValue="results">
        <TabsList>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        <TabsContent value="results" className="mt-4">
          <ResultsTable results={data.results} />
        </TabsContent>
        <TabsContent value="analytics" className="mt-4">
          <StudentAnalyticsChart
            timeline={data.analytics.timeline}
            subjectAverages={data.analytics.subjectAverages}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export function StudentResultsPageClient() {
  return (
    <Suspense fallback={<StudentResultsSkeleton />}>
      <StudentResultsContent />
    </Suspense>
  );
}
