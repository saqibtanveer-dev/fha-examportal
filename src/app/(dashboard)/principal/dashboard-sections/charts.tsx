'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import type { Trend, GradeItem } from './stats-and-alerts';

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  '#8b5cf6',
  '#ec4899',
];

const TOOLTIP_STYLE = {
  borderRadius: '8px',
  border: '1px solid hsl(var(--border))',
  backgroundColor: 'hsl(var(--card))',
};

// ============================================
// Performance Trend Chart
// ============================================

export function PerformanceTrendChart({ trends }: { trends: Trend[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Performance Trend</CardTitle>
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
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Area type="monotone" dataKey="avgPercentage" stroke="hsl(var(--chart-1))" fill="url(#gradAvg)" strokeWidth={2} name="Avg Score %" />
                <Area type="monotone" dataKey="passRate" stroke="hsl(var(--chart-2))" fill="url(#gradPass)" strokeWidth={2} name="Pass Rate %" />
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
  );
}

// ============================================
// Grade Distribution Chart
// ============================================

export function GradeDistributionChart({ gradeDistribution }: { gradeDistribution: GradeItem[] }) {
  return (
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
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
  );
}
