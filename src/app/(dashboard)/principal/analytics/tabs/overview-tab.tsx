'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Users, GraduationCap, BookOpen, TrendingUp, Award } from 'lucide-react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';
import type {
  TeacherAnalytics,
  ClassAnalytics,
  SubjectAnalytics,
  PerformanceTrend,
  GradeDistItem,
  StudentPerformance,
} from '../analytics-types';
import { CHART_COLORS, formatMonth } from '../analytics-types';

type Props = {
  teacherAnalytics: TeacherAnalytics[];
  classAnalytics: ClassAnalytics[];
  subjectAnalytics: SubjectAnalytics[];
  performanceTrends: PerformanceTrend[];
  gradeDistribution: GradeDistItem[];
  topStudents: StudentPerformance[];
};

export function OverviewTab({
  teacherAnalytics,
  classAnalytics,
  subjectAnalytics,
  performanceTrends,
  gradeDistribution,
  topStudents,
}: Props) {
  return (
    <div className="space-y-6">
      {/* Performance Trends */}
      {performanceTrends.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Performance Trends
            </CardTitle>
            <CardDescription>Monthly average percentage and pass rate across all exams</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={performanceTrends.map((t) => ({ ...t, monthLabel: formatMonth(t.month) }))}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="monthLabel" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value: any) => `${Math.round(Number(value) * 10) / 10}%`}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Legend />
                <Area type="monotone" dataKey="avgPercentage" name="Avg %" stroke="#3b82f6" fill="#3b82f680" strokeWidth={2} />
                <Area type="monotone" dataKey="passRate" name="Pass Rate %" stroke="#10b981" fill="#10b98140" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Grade Distribution + Quick Stats */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {gradeDistribution.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Grade Distribution</CardTitle>
              <CardDescription>Overall grade breakdown across all results</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={gradeDistribution}
                    dataKey="count"
                    nameKey="grade"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={((entry: any) => `${entry.grade}: ${entry.count}`) as any}
                  >
                    {gradeDistribution.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-2 gap-3">
          <SummaryCard
            icon={Users}
            label="Active Teachers"
            value={teacherAnalytics.length}
            subtext={`${teacherAnalytics.reduce((s, t) => s + t.examsCreated, 0)} exams created`}
          />
          <SummaryCard
            icon={GraduationCap}
            label="Classes"
            value={classAnalytics.length}
            subtext={`${classAnalytics.reduce((s, c) => s + c.totalStudents, 0)} students`}
          />
          <SummaryCard
            icon={BookOpen}
            label="Subjects"
            value={subjectAnalytics.length}
            subtext={`${subjectAnalytics.reduce((s, sub) => s + sub.totalExams, 0)} exams`}
          />
          <SummaryCard
            icon={Award}
            label="Top Avg"
            value={topStudents.length > 0 ? `${topStudents[0]!.avgPercentage}%` : '—'}
            subtext={topStudents.length > 0 ? topStudents[0]!.studentName : 'No data'}
          />
        </div>
      </div>

      {/* Subject Radar Chart */}
      {subjectAnalytics.length >= 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Subject Performance Radar</CardTitle>
            <CardDescription>Average percentage and pass rate by subject</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <RadarChart data={subjectAnalytics.filter((s) => s.totalResults > 0).slice(0, 8)}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subjectName" tick={{ fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Radar name="Avg %" dataKey="avgPercentage" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                <Radar name="Pass Rate %" dataKey="passRate" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                <Legend />
                <Tooltip formatter={(v: any) => `${Math.round(Number(v) * 10) / 10}%`} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  subtext,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  subtext: string;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-5 text-center">
        <Icon className="text-muted-foreground mb-2 h-6 w-6" />
        <p className="text-muted-foreground text-xs">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-muted-foreground mt-1 text-xs">{subtext}</p>
      </CardContent>
    </Card>
  );
}
