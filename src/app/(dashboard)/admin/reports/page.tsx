import { PageHeader } from '@/components/shared';
import { requireRole } from '@/lib/auth-utils';
import { ReportsPageClient } from '@/modules/results/components/reports-page-client';
import {
  getSystemOverview,
  getDepartmentPerformance,
  getSubjectPerformance,
  getRecentExamSummaries,
  getGradeDistribution,
} from '@/modules/results/report-queries';

export const metadata = { title: 'Reports & Analytics' };

export default async function AdminReportsPage() {
  await requireRole('ADMIN');

  const [overview, departments, subjects, recentExams, gradeDistribution] =
    await Promise.all([
      getSystemOverview(),
      getDepartmentPerformance(),
      getSubjectPerformance(),
      getRecentExamSummaries(),
      getGradeDistribution(),
    ]);

  return (
    <>
      <PageHeader
        title="Reports & Analytics"
        description="System-wide performance metrics and insights"
      />
      <ReportsPageClient
        overview={overview}
        departments={departments}
        subjects={subjects}
        recentExams={recentExams}
        gradeDistribution={gradeDistribution}
      />
    </>
  );
}
