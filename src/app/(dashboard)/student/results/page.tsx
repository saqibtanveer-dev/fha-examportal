import { auth } from '@/lib/auth';
import { getResultsByStudent, getStudentAnalytics } from '@/modules/results/result-queries';
import { ResultsTable, StudentAnalyticsChart } from '@/modules/results/components';
import { PageHeader, EmptyState } from '@/components/shared';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { serialize } from '@/utils/serialize';

export default async function StudentResultsPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [results, analytics] = await Promise.all([
    getResultsByStudent(userId),
    getStudentAnalytics(userId),
  ]);

  const safeResults = serialize(results);

  return (
    <div className="space-y-6">
      <PageHeader title="My Results" description="View your exam results and performance" />

      {safeResults.length === 0 ? (
        <EmptyState title="No results" description="You haven't completed any exams yet." />
      ) : (
        <Tabs defaultValue="results">
          <TabsList>
            <TabsTrigger value="results">Results</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          <TabsContent value="results" className="mt-4">
            <ResultsTable results={safeResults} />
          </TabsContent>
          <TabsContent value="analytics" className="mt-4">
            <StudentAnalyticsChart
              timeline={analytics.timeline}
              subjectAverages={analytics.subjectAverages}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
