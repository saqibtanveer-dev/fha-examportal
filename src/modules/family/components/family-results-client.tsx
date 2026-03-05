'use client';

// ============================================
// Family Results Page — Client Component
// Reuses shared ResultsTable + StudentAnalyticsChart
// ============================================

import { PageHeader, EmptyState } from '@/components/shared';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3 } from 'lucide-react';
import { ResultsTable, StudentAnalyticsChart } from '@/modules/results/components';
import { StudentResultsSkeleton } from '@/modules/results/components/student-results-skeleton';
import { useSelectedChild, useChildResultsWithAnalytics } from '@/modules/family/hooks';
import { ChildSelector } from './child-selector';

export function FamilyResultsClient() {
  const { children, selectedChild, selectedChildId, isLoading: childrenLoading } = useSelectedChild();
  const { data, isLoading, error } = useChildResultsWithAnalytics(selectedChildId ?? '', !!selectedChildId);

  if (childrenLoading || isLoading) return <StudentResultsSkeleton />;

  if (!selectedChild) {
    return <EmptyState icon={<BarChart3 className="h-12 w-12 text-muted-foreground" />} title="No Children" description="No students linked to your account." />;
  }

  if (error) {
    return <EmptyState icon={<BarChart3 className="h-12 w-12 text-muted-foreground" />} title="Error" description="Failed to load exam results. Please try again." />;
  }

  if (!data || data.results.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader title="Exam Results" description={`${selectedChild.studentName}'s academic performance`} />
        <div className="mb-4">
          <ChildSelector children={children} selectedChildId={selectedChildId} />
        </div>
        <EmptyState icon={<BarChart3 className="h-12 w-12 text-muted-foreground" />} title="No Results Yet" description="No exam results available." />
      </div>
    );
  }

  const detailPrefix = `/family/results/${selectedChild.studentProfileId}`;

  return (
    <div className="space-y-6">
      <PageHeader title="Exam Results" description={`${selectedChild.studentName}'s academic performance`} />
      <div>
        <ChildSelector children={children} selectedChildId={selectedChildId} />
      </div>

      <Tabs defaultValue="results">
        <TabsList>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        <TabsContent value="results" className="mt-4">
          <ResultsTable results={data.results} detailHrefPrefix={detailPrefix} />
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
