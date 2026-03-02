'use client';

import {
  StatCardsGrid,
  AlertCards,
  PerformanceTrendChart,
  GradeDistributionChart,
  RecentExamsList,
  RecentResultsList,
  RecentSubmissionsList,
  type DashboardStats,
  type RecentActivity,
  type Trend,
  type GradeItem,
} from './dashboard-sections';

type Props = {
  stats: DashboardStats;
  recentActivity: RecentActivity;
  trends: Trend[];
  gradeDistribution: GradeItem[];
};

export function PrincipalDashboardClient({
  stats,
  recentActivity,
  trends,
  gradeDistribution,
}: Props) {
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

