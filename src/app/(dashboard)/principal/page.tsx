export const dynamic = 'force-dynamic';

import { requireRole } from '@/lib/auth-utils';
import { PageHeader } from '@/components/shared';
import {
  getPrincipalDashboardStats,
  getRecentActivity,
} from '@/modules/principal/principal-queries';
import {
  getPerformanceTrends,
  getGradeDistributionOverall,
} from '@/modules/principal/principal-queries';
import { PrincipalDashboardClient } from './dashboard-client';

export default async function PrincipalDashboardPage() {
  await requireRole('PRINCIPAL');

  const [stats, recentActivity, trends, gradeDistribution] = await Promise.all([
    getPrincipalDashboardStats(),
    getRecentActivity(),
    getPerformanceTrends(),
    getGradeDistributionOverall(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Principal Dashboard"
        description="Comprehensive overview of your institution's academic performance"
      />
      <PrincipalDashboardClient
        stats={stats}
        recentActivity={{
          recentExams: recentActivity.recentExams.map((e) => ({
            ...e,
            createdAt: e.createdAt.toISOString(),
          })),
          recentResults: recentActivity.recentResults.map((r) => ({
            ...r,
            percentage: Number(r.percentage),
            createdAt: r.createdAt.toISOString(),
          })),
          recentSessions: recentActivity.recentSessions.map((s) => ({
            ...s,
            submittedAt: s.submittedAt?.toISOString() ?? null,
          })),
        }}
        trends={trends}
        gradeDistribution={gradeDistribution}
      />
    </div>
  );
}
