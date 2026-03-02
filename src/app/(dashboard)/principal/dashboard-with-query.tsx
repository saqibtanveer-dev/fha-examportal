'use client';

import {
  useDashboardStats,
  useRecentActivity,
  usePerformanceTrends,
  useGradeDistribution,
} from '@/modules/principal/hooks/use-principal-queries';
import { DashboardSkeleton } from './dashboard-skeleton';
import {
  StatCardsGrid,
  AlertCards,
  PerformanceTrendChart,
  GradeDistributionChart,
  RecentExamsList,
  RecentResultsList,
  RecentSubmissionsList,
} from './dashboard-sections';

export function PrincipalDashboardWithQuery() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: recentActivity, isLoading: activityLoading } = useRecentActivity();
  const { data: trends, isLoading: trendsLoading } = usePerformanceTrends();
  const { data: gradeDistribution, isLoading: gradesLoading } = useGradeDistribution();

  const isLoading = statsLoading || activityLoading || trendsLoading || gradesLoading;

  if (isLoading || !stats || !recentActivity || !trends || !gradeDistribution) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      <StatCardsGrid stats={stats} />
      <AlertCards stats={stats} />

      <div className="grid gap-4 md:grid-cols-2">
        <PerformanceTrendChart trends={trends} />
        <GradeDistributionChart gradeDistribution={gradeDistribution} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <RecentExamsList exams={recentActivity.recentExams} />
        <RecentResultsList results={recentActivity.recentResults} />
        <RecentSubmissionsList sessions={recentActivity.recentSessions} />
      </div>
    </div>
  );
}

