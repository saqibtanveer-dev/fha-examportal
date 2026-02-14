'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Users,
  UserCheck,
  GraduationCap,
  BookOpen,
  ClipboardList,
  BarChart3,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from 'recharts';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants';
import { Badge } from '@/components/ui/badge';

type DashboardStats = {
  totalTeachers: number;
  totalStudents: number;
  totalClasses: number;
  totalSubjects: number;
  totalExams: number;
  totalResults: number;
  activeExams: number;
  pendingGrading: number;
  overallPassRate: number;
  overallAvgPercentage: number;
};

type RecentActivity = {
  recentExams: {
    id: string;
    title: string;
    status: string;
    type: string;
    createdAt: string;
    createdBy: { firstName: string; lastName: string };
    subject: { name: string; code: string };
  }[];
  recentResults: {
    id: string;
    percentage: number;
    isPassed: boolean;
    grade: string | null;
    createdAt: string;
    exam: { title: string };
    student: { firstName: string; lastName: string };
  }[];
  recentSessions: {
    id: string;
    submittedAt: string | null;
    exam: { title: string };
    student: { firstName: string; lastName: string };
  }[];
};

type Trend = {
  month: string;
  avgPercentage: number;
  passRate: number;
  totalExams: number;
};

type GradeItem = {
  grade: string;
  count: number;
};

type Props = {
  stats: DashboardStats;
  recentActivity: RecentActivity;
  trends: Trend[];
  gradeDistribution: GradeItem[];
};

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  '#8b5cf6',
  '#ec4899',
];

const statusColor: Record<string, string> = {
  DRAFT: 'secondary',
  PUBLISHED: 'default',
  ACTIVE: 'default',
  COMPLETED: 'default',
  ARCHIVED: 'secondary',
};

export function PrincipalDashboardClient({
  stats,
  recentActivity,
  trends,
  gradeDistribution,
}: Props) {
  const statCards = [
    {
      title: 'Total Teachers',
      value: stats.totalTeachers,
      icon: UserCheck,
      href: ROUTES.PRINCIPAL.TEACHERS,
      color: 'text-blue-500',
    },
    {
      title: 'Total Students',
      value: stats.totalStudents,
      icon: Users,
      href: ROUTES.PRINCIPAL.STUDENTS,
      color: 'text-green-500',
    },
    {
      title: 'Classes',
      value: stats.totalClasses,
      icon: GraduationCap,
      href: ROUTES.PRINCIPAL.CLASSES,
      color: 'text-purple-500',
    },
    {
      title: 'Subjects',
      value: stats.totalSubjects,
      icon: BookOpen,
      color: 'text-orange-500',
    },
    {
      title: 'Total Exams',
      value: stats.totalExams,
      icon: ClipboardList,
      href: ROUTES.PRINCIPAL.EXAMS,
      color: 'text-indigo-500',
    },
    {
      title: 'Active Exams',
      value: stats.activeExams,
      icon: Clock,
      href: ROUTES.PRINCIPAL.EXAMS,
      color: 'text-amber-500',
    },
    {
      title: 'Avg. Score',
      value: `${stats.overallAvgPercentage}%`,
      icon: BarChart3,
      href: ROUTES.PRINCIPAL.ANALYTICS,
      color: 'text-cyan-500',
    },
    {
      title: 'Pass Rate',
      value: `${stats.overallPassRate}%`,
      icon: TrendingUp,
      href: ROUTES.PRINCIPAL.ANALYTICS,
      color: 'text-emerald-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid - Mobile: 2 columns, Tablet: 3, Desktop: 4 */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
        {statCards.map((card) => {
          const content = (
            <Card
              key={card.title}
              className={card.href ? 'cursor-pointer transition-shadow hover:shadow-md' : ''}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-xs font-medium text-muted-foreground sm:text-sm">
                  {card.title}
                </CardTitle>
                <card.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${card.color}`} />
              </CardHeader>
              <CardContent>
                <p className="text-xl font-bold sm:text-2xl md:text-3xl">{card.value}</p>
              </CardContent>
            </Card>
          );

          return card.href ? (
            <Link key={card.title} href={card.href}>
              {content}
            </Link>
          ) : (
            <div key={card.title}>{content}</div>
          );
        })}
      </div>

      {/* Alert Cards */}
      {(stats.pendingGrading > 0 || stats.activeExams > 0) && (
        <div className="grid gap-3 sm:grid-cols-2">
          {stats.pendingGrading > 0 && (
            <Card className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950">
              <CardContent className="flex items-center gap-3 py-4">
                <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                    {stats.pendingGrading} exams pending grading
                  </p>
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    Awaiting teacher review
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
          {stats.activeExams > 0 && (
            <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
              <CardContent className="flex items-center gap-3 py-4">
                <Clock className="h-5 w-5 text-blue-600 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    {stats.activeExams} exams currently active
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    Students are taking exams now
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Charts Row 1: Performance Trend + Grade Distribution */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Performance Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Performance Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 sm:h-72">
              {trends.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trends}>
                    <defs>
                      <linearGradient id="gradAvg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gradPass" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" fontSize={11} tickLine={false} />
                    <YAxis domain={[0, 100]} fontSize={11} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '8px',
                        border: '1px solid hsl(var(--border))',
                        backgroundColor: 'hsl(var(--card))',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="avgPercentage"
                      stroke="hsl(var(--chart-1))"
                      fill="url(#gradAvg)"
                      strokeWidth={2}
                      name="Avg Score %"
                    />
                    <Area
                      type="monotone"
                      dataKey="passRate"
                      stroke="hsl(var(--chart-2))"
                      fill="url(#gradPass)"
                      strokeWidth={2}
                      name="Pass Rate %"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  No trend data available yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Grade Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Grade Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 sm:h-72">
              {gradeDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={gradeDistribution}
                      dataKey="count"
                      nameKey="grade"
                      cx="50%"
                      cy="50%"
                      outerRadius="80%"
                      label={({ grade, count }: any) => `${grade}: ${count}`}
                      labelLine={false}
                    >
                      {gradeDistribution.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  No grade data available yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Recent Exams */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Recent Exams</CardTitle>
            <Link
              href={ROUTES.PRINCIPAL.EXAMS}
              className="text-xs text-primary hover:underline"
            >
              View All
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentActivity.recentExams.length > 0 ? (
              recentActivity.recentExams.slice(0, 5).map((exam) => (
                <Link
                  key={exam.id}
                  href={`/principal/exams/${exam.id}`}
                  className="block rounded-lg border p-3 transition-colors hover:bg-accent"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{exam.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {exam.subject.code} &bull; by {exam.createdBy.firstName}{' '}
                        {exam.createdBy.lastName}
                      </p>
                    </div>
                    <Badge
                      variant={
                        (statusColor[exam.status] as 'default' | 'secondary') ?? 'secondary'
                      }
                      className="shrink-0 text-[10px]"
                    >
                      {exam.status}
                    </Badge>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No exams yet</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Results */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Recent Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentActivity.recentResults.length > 0 ? (
              recentActivity.recentResults.slice(0, 5).map((result) => (
                <div
                  key={result.id}
                  className="flex items-center gap-3 rounded-lg border p-3"
                >
                  <div className="shrink-0">
                    {result.isPassed ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {result.student.firstName} {result.student.lastName}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {result.exam.title}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold">{result.percentage}%</p>
                    {result.grade && (
                      <p className="text-xs text-muted-foreground">{result.grade}</p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No results yet</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Submissions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Recent Submissions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentActivity.recentSessions.length > 0 ? (
              recentActivity.recentSessions.slice(0, 5).map((session) => (
                <div
                  key={session.id}
                  className="rounded-lg border p-3"
                >
                  <p className="truncate text-sm font-medium">
                    {session.student.firstName} {session.student.lastName}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {session.exam.title}
                  </p>
                  {session.submittedAt && (
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      {new Date(session.submittedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No submissions yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
