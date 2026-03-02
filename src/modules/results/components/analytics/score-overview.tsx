'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
  Legend,
} from 'recharts';
import { Users, CheckCircle2, XCircle, TrendingUp } from 'lucide-react';
import type { ExamDetailedAnalytics } from '@/modules/results/result-queries';
import { KpiCard, StatRow, CHART_COLORS, PIE_COLORS } from './analytics-shared';

export function ScoreOverview({ data }: { data: ExamDetailedAnalytics }) {
  const passFailData = [
    { name: 'Passed', value: data.passed },
    { name: 'Failed', value: data.failed },
  ];

  return (
    <div className="space-y-4">
      {/* KPI Grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard icon={<Users className="h-4 w-4 text-muted-foreground" />} label="Total Students" value={String(data.totalStudents)} variant="default" />
        <KpiCard icon={<CheckCircle2 className="h-4 w-4 text-green-600" />} label="Passed" value={String(data.passed)} subtext={`${data.passRate.toFixed(1)}% pass rate`} variant="success" />
        <KpiCard icon={<XCircle className="h-4 w-4 text-red-600" />} label="Failed" value={String(data.failed)} variant="danger" />
        <KpiCard icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />} label="Average" value={`${data.avgPercentage.toFixed(1)}%`} subtext={`Median: ${data.medianPercentage.toFixed(1)}%`} variant="default" />
      </div>

      {/* Statistical Summary + Charts */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Statistical Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2 text-sm">
              <StatRow label="Mean" value={`${data.avgPercentage.toFixed(1)}%`} />
              <StatRow label="Median" value={`${data.medianPercentage.toFixed(1)}%`} />
              <StatRow label="Std. Deviation" value={`${data.stdDeviation.toFixed(1)}%`} />
              <StatRow label="Q1 (25th)" value={`${data.q1Percentage.toFixed(1)}%`} />
              <StatRow label="Q3 (75th)" value={`${data.q3Percentage.toFixed(1)}%`} />
              <StatRow label="IQR" value={`${(data.q3Percentage - data.q1Percentage).toFixed(1)}%`} />
              <StatRow label="Range" value={`${data.minPercentage.toFixed(1)}% – ${data.maxPercentage.toFixed(1)}%`} />
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Score Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.scoreDistribution}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="range" fontSize={11} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis allowDecimals={false} fontSize={11} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} labelStyle={{ color: 'hsl(var(--foreground))' }} />
                  <Bar dataKey="count" fill={CHART_COLORS.primary} radius={[4, 4, 0, 0]} name="Students" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Pass / Fail Ratio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={passFailData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                    {passFailData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grade Distribution */}
      {data.gradeDistribution.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Grade Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.gradeDistribution}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="grade" fontSize={12} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis allowDecimals={false} fontSize={12} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} labelStyle={{ color: 'hsl(var(--foreground))' }} />
                  <Bar dataKey="count" fill={CHART_COLORS.indigo} radius={[4, 4, 0, 0]} name="Students" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
