'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useCampaignAnalyticsQuery } from '@/modules/admissions/hooks/use-admissions-query';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';
import { TrendingUp, Users, Target, BarChart3 } from 'lucide-react';

type Props = { campaignId: string };

type AnalyticsData = {
  funnel: Record<string, number>;
  scoreDistribution: { range: string; count: number }[];
  questionAnalytics: {
    questionId: string;
    title: string;
    type: string;
    totalAttempts: number;
    correctCount: number;
    accuracy: number;
    avgMarks: number;
    maxMarks: number;
  }[];
  summary: {
    totalGraded: number;
    avgPercentage: number;
    maxPercentage: number;
    minPercentage: number;
  };
};

const FUNNEL_STEPS = [
  { key: 'totalApplicants', label: 'Registered', color: '#6366f1' },
  { key: 'verified', label: 'Verified', color: '#8b5cf6' },
  { key: 'testCompleted', label: 'Test Done', color: '#a78bfa' },
  { key: 'graded', label: 'Graded', color: '#60a5fa' },
  { key: 'shortlisted', label: 'Shortlisted', color: '#34d399' },
  { key: 'accepted', label: 'Accepted', color: '#22c55e' },
  { key: 'enrolled', label: 'Enrolled', color: '#16a34a' },
];

const BAR_COLORS = [
  '#ef4444', '#ef4444', '#f97316', '#f97316', '#eab308',
  '#eab308', '#22c55e', '#22c55e', '#3b82f6', '#3b82f6',
];

export function AnalyticsTab({ campaignId }: Props) {
  const { data: res, isLoading } = useCampaignAnalyticsQuery(campaignId);

  if (isLoading) return <AnalyticsSkeleton />;

  const analytics = res?.success ? (res.data as AnalyticsData) : null;
  if (!analytics) return <p className="text-sm text-muted-foreground">No analytics available yet.</p>;

  const funnelData = FUNNEL_STEPS.map((step) => ({
    label: step.label,
    value: analytics.funnel[step.key] ?? 0,
    color: step.color,
  }));

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <SummaryCard icon={Users} label="Total Graded" value={analytics.summary.totalGraded} />
        <SummaryCard icon={TrendingUp} label="Average %" value={`${analytics.summary.avgPercentage}%`} />
        <SummaryCard icon={Target} label="Highest %" value={`${analytics.summary.maxPercentage}%`} />
        <SummaryCard icon={BarChart3} label="Lowest %" value={`${analytics.summary.minPercentage}%`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Funnel Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Admission Funnel</CardTitle>
            <CardDescription>Applicant progression through stages</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnelData} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" allowDecimals={false} fontSize={12} />
                  <YAxis type="category" dataKey="label" fontSize={12} width={80} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {funnelData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Score Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Score Distribution</CardTitle>
            <CardDescription>Number of applicants per score range</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.scoreDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" fontSize={11} angle={-30} textAnchor="end" height={50} />
                  <YAxis allowDecimals={false} fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {analytics.scoreDistribution.map((_, index) => (
                      <Cell key={index} fill={BAR_COLORS[index] ?? '#6366f1'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Question Analytics */}
      {analytics.questionAnalytics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Question Performance</CardTitle>
            <CardDescription>Accuracy and difficulty per question</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 pr-4">#</th>
                    <th className="pb-2 pr-4">Question</th>
                    <th className="pb-2 pr-4">Type</th>
                    <th className="pb-2 pr-4 text-center">Attempts</th>
                    <th className="pb-2 pr-4 text-center">Accuracy</th>
                    <th className="pb-2 text-center">Avg Marks</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.questionAnalytics.map((q, idx) => (
                    <tr key={q.questionId} className="border-b last:border-0">
                      <td className="py-2 pr-4 text-muted-foreground">{idx + 1}</td>
                      <td className="py-2 pr-4 max-w-xs truncate">{q.title}</td>
                      <td className="py-2 pr-4">
                        <Badge variant="outline" className="text-xs">{q.type}</Badge>
                      </td>
                      <td className="py-2 pr-4 text-center">{q.totalAttempts}</td>
                      <td className="py-2 pr-4 text-center">
                        <Badge
                          variant="outline"
                          className={
                            q.accuracy >= 70
                              ? 'border-green-300 bg-green-50 text-green-700'
                              : q.accuracy >= 40
                              ? 'border-yellow-300 bg-yellow-50 text-yellow-700'
                              : 'border-red-300 bg-red-50 text-red-700'
                          }
                        >
                          {q.accuracy}%
                        </Badge>
                      </td>
                      <td className="py-2 text-center">
                        {q.avgMarks}/{q.maxMarks}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
}) {
  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <Icon className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-xl font-bold">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-80" />
        <Skeleton className="h-80" />
      </div>
    </div>
  );
}
