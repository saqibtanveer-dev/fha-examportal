export const dynamic = 'force-dynamic';

import { requireRole } from '@/lib/auth-utils';
import { PageHeader } from '@/components/shared';
import {
  getTeacherWiseAnalytics,
  getClassWiseAnalytics,
  getSubjectWiseAnalytics,
  getPerformanceTrends,
  getGradeDistributionOverall,
  getTopPerformingStudents,
  getBottomPerformingStudents,
} from '@/modules/principal/principal-queries';
import { AnalyticsClient } from './analytics-client';

export default async function PrincipalAnalyticsPage() {
  await requireRole('PRINCIPAL');

  const [
    teacherAnalytics,
    classAnalytics,
    subjectAnalytics,
    performanceTrends,
    gradeDistribution,
    topStudents,
    bottomStudents,
  ] = await Promise.all([
    getTeacherWiseAnalytics(),
    getClassWiseAnalytics(),
    getSubjectWiseAnalytics(),
    getPerformanceTrends(),
    getGradeDistributionOverall(),
    getTopPerformingStudents(10),
    getBottomPerformingStudents(10),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Deep Analytics"
        description="Comprehensive school-wide performance insights with teacher, class, and subject breakdowns"
      />
      <AnalyticsClient
        teacherAnalytics={teacherAnalytics}
        classAnalytics={classAnalytics}
        subjectAnalytics={subjectAnalytics}
        performanceTrends={performanceTrends.map((t) => ({
          ...t,
          month: t.month,
        }))}
        gradeDistribution={gradeDistribution}
        topStudents={topStudents}
        bottomStudents={bottomStudents}
      />
    </div>
  );
}
