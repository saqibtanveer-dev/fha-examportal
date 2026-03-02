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

// ============================================
// Shared Types
// ============================================

export type DashboardStats = {
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

export type RecentActivity = {
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

export type Trend = {
  month: string;
  avgPercentage: number;
  passRate: number;
  totalExams: number;
};

export type GradeItem = {
  grade: string;
  count: number;
};

// ============================================
// Constants
// ============================================

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  '#8b5cf6',
  '#ec4899',
];

const STATUS_COLOR: Record<string, string> = {
  DRAFT: 'secondary',
  PUBLISHED: 'default',
  ACTIVE: 'default',
  COMPLETED: 'default',
  ARCHIVED: 'secondary',
};

// ============================================
// Stat Cards Grid
// ============================================

export function StatCardsGrid({ stats }: { stats: DashboardStats }) {
  const statCards = [
    { title: 'Total Teachers', value: stats.totalTeachers, icon: UserCheck, href: ROUTES.PRINCIPAL.TEACHERS, color: 'text-blue-500' },
    { title: 'Total Students', value: stats.totalStudents, icon: Users, href: ROUTES.PRINCIPAL.STUDENTS, color: 'text-green-500' },
    { title: 'Classes', value: stats.totalClasses, icon: GraduationCap, href: ROUTES.PRINCIPAL.CLASSES, color: 'text-purple-500' },
    { title: 'Subjects', value: stats.totalSubjects, icon: BookOpen, color: 'text-orange-500' },
    { title: 'Total Exams', value: stats.totalExams, icon: ClipboardList, href: ROUTES.PRINCIPAL.EXAMS, color: 'text-indigo-500' },
    { title: 'Active Exams', value: stats.activeExams, icon: Clock, href: ROUTES.PRINCIPAL.EXAMS, color: 'text-amber-500' },
    { title: 'Avg. Score', value: `${stats.overallAvgPercentage}%`, icon: BarChart3, href: ROUTES.PRINCIPAL.ANALYTICS, color: 'text-cyan-500' },
    { title: 'Pass Rate', value: `${stats.overallPassRate}%`, icon: TrendingUp, href: ROUTES.PRINCIPAL.ANALYTICS, color: 'text-emerald-500' },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
      {statCards.map((card) => {
        const content = (
          <Card key={card.title} className={card.href ? 'cursor-pointer transition-shadow hover:shadow-md' : ''}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-medium text-muted-foreground sm:text-sm">{card.title}</CardTitle>
              <card.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold sm:text-2xl md:text-3xl">{card.value}</p>
            </CardContent>
          </Card>
        );
        return card.href ? (
          <Link key={card.title} href={card.href}>{content}</Link>
        ) : (
          <div key={card.title}>{content}</div>
        );
      })}
    </div>
  );
}

// ============================================
// Alert Cards
// ============================================

export function AlertCards({ stats }: { stats: DashboardStats }) {
  if (stats.pendingGrading <= 0 && stats.activeExams <= 0) return null;

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {stats.pendingGrading > 0 && (
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950">
          <CardContent className="flex items-center gap-3 py-4">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                {stats.pendingGrading} exams pending grading
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-400">Awaiting teacher review</p>
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
              <p className="text-xs text-blue-600 dark:text-blue-400">Students are taking exams now</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
