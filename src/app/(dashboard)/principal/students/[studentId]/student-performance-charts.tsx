'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';

type Props = {
  timeline: { date: string; percentage: number; exam: string; subject: string }[];
  subjectPerformance: { subject: string; exams: number; avgPercentage: number; passRate: number }[];
};

export function StudentPerformanceCharts({ timeline, subjectPerformance }: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Performance Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Performance Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            {timeline.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeline}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="exam" fontSize={10} angle={-20} textAnchor="end" />
                  <YAxis domain={[0, 100]} fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid hsl(var(--border))',
                      backgroundColor: 'hsl(var(--card))',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="percentage"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    name="Score %"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                No exam data yet
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Subject Performance Radar / Bar */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Subject Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            {subjectPerformance.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                {subjectPerformance.length >= 3 ? (
                  <RadarChart data={subjectPerformance}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" fontSize={11} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} fontSize={10} />
                    <Radar
                      name="Avg Score"
                      dataKey="avgPercentage"
                      stroke="hsl(var(--chart-1))"
                      fill="hsl(var(--chart-1))"
                      fillOpacity={0.3}
                    />
                  </RadarChart>
                ) : (
                  <BarChart data={subjectPerformance}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="subject" fontSize={12} />
                    <YAxis domain={[0, 100]} fontSize={12} />
                    <Tooltip />
                    <Bar
                      dataKey="avgPercentage"
                      fill="hsl(var(--chart-1))"
                      radius={[4, 4, 0, 0]}
                      name="Avg %"
                    />
                  </BarChart>
                )}
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                No subject data yet
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
