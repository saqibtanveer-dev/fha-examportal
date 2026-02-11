'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

type ExamAnalytics = {
  total: number;
  passed: number;
  failed: number;
  avgPercentage: number;
  maxPercentage: number;
  minPercentage: number;
  distribution: Record<string, number>;
};

type Props = { analytics: ExamAnalytics };

export function ExamAnalyticsChart({ analytics }: Props) {
  const distData = Object.entries(analytics.distribution).map(([range, count]) => ({
    range,
    count,
  }));

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Score Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" fontSize={12} />
                <YAxis allowDecimals={false} fontSize={12} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Stat label="Total Students" value={String(analytics.total)} />
            <Stat label="Passed" value={String(analytics.passed)} />
            <Stat label="Failed" value={String(analytics.failed)} />
            <Stat label="Pass Rate" value={`${((analytics.passed / analytics.total) * 100).toFixed(1)}%`} />
            <Stat label="Average" value={`${analytics.avgPercentage.toFixed(1)}%`} />
            <Stat label="Highest" value={`${analytics.maxPercentage.toFixed(1)}%`} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border p-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-bold">{value}</p>
    </div>
  );
}

// Student performance timeline chart
type TimelineData = { date: string; percentage: number; exam: string };
type SubjectAvg = { subject: string; average: number; exams: number };

type StudentAnalyticsProps = {
  timeline: TimelineData[];
  subjectAverages: SubjectAvg[];
};

export function StudentAnalyticsChart({ timeline, subjectAverages }: StudentAnalyticsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Performance Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeline}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="exam" fontSize={10} angle={-20} textAnchor="end" />
                <YAxis domain={[0, 100]} fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="percentage" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Subject Averages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectAverages}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="subject" fontSize={12} />
                <YAxis domain={[0, 100]} fontSize={12} />
                <Tooltip />
                <Bar dataKey="average" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
