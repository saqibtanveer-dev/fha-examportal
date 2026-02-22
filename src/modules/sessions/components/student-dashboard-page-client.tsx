'use client';

import { Suspense } from 'react';
import { useStudentDashboardStats } from '../hooks/use-sessions-query';
import { StudentDashboardSkeleton } from './student-dashboard-skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader, EmptyState } from '@/components/shared';
import { BookOpen, CheckCircle, Clock, Trophy, FileText } from 'lucide-react';

function StudentDashboardContent() {
  const { data: stats, isLoading, error } = useStudentDashboardStats();

  if (isLoading) return <StudentDashboardSkeleton />;

  if (error) {
    return (
      <EmptyState
        title="Error loading dashboard"
        description="There was an error loading your dashboard. Please try again."
      />
    );
  }

  if (!stats) {
    return (
      <EmptyState
        title="No data available"
        description="Your dashboard data is not available at this time."
      />
    );
  }

  const statCards = [
    { label: 'New Exams', value: stats.newExams, icon: FileText, description: 'Not yet attempted' },
    { label: 'In Progress', value: stats.inProgress, icon: Clock, description: 'Started but not submitted' },
    { label: 'Completed', value: stats.completed, icon: CheckCircle, description: 'Submitted / Graded' },
    { label: 'Avg Score', value: `${stats.avgScore.toFixed(1)}%`, icon: Trophy, description: 'Overall average' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Your exam overview" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((s) => (
          <Card key={s.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{s.label}</CardTitle>
              <s.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{s.value}</div>
              <p className="text-xs text-muted-foreground">{s.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function StudentDashboardPageClient() {
  return (
    <Suspense fallback={<StudentDashboardSkeleton />}>
      <StudentDashboardContent />
    </Suspense>
  );
}
