'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Clock,
  ArrowUp,
  ArrowDown,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import type { ExamDetailedAnalytics } from '@/modules/results/result-queries';
import { KpiCard, CHART_COLORS } from './analytics-shared';

// ─── Time Analytics ──────────────────────────────────────────────────

export function TimeAnalytics({ data }: { data: ExamDetailedAnalytics }) {
  if (data.avgCompletionTime == null) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No time data available for this exam.
        </CardContent>
      </Card>
    );
  }

  const questionTimeData = data.questions
    .filter((q) => q.avgTimeSpent != null)
    .map((q) => ({
      name: `Q${q.questionNumber}`,
      seconds: Number(q.avgTimeSpent!.toFixed(0)),
      minutes: Number((q.avgTimeSpent! / 60).toFixed(1)),
    }));

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <KpiCard icon={<Clock className="h-4 w-4 text-blue-600" />} label="Average Time" value={`${data.avgCompletionTime.toFixed(1)} min`} variant="default" />
        <KpiCard icon={<ArrowDown className="h-4 w-4 text-green-600" />} label="Fastest" value={`${data.fastestTime!.toFixed(1)} min`} variant="success" />
        <KpiCard icon={<ArrowUp className="h-4 w-4 text-red-600" />} label="Slowest" value={`${data.slowestTime!.toFixed(1)} min`} variant="danger" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {data.timeDistribution.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Completion Time Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.timeDistribution}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="range" fontSize={11} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis allowDecimals={false} fontSize={11} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                      labelStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Bar dataKey="count" fill={CHART_COLORS.blue} radius={[4, 4, 0, 0]} name="Students" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {questionTimeData.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Avg. Time per Question</CardTitle>
              <CardDescription>Average seconds spent on each question</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={questionTimeData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="name" fontSize={11} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis allowDecimals={false} fontSize={11} tick={{ fill: 'hsl(var(--muted-foreground))' }} unit="s" />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                      labelStyle={{ color: 'hsl(var(--foreground))' }}
                      formatter={((value: number) => [`${value}s`, 'Avg. Time']) as never}
                    />
                    <Bar dataKey="seconds" fill={CHART_COLORS.teal} radius={[4, 4, 0, 0]} name="Avg. Time" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// ─── Anti-Cheat Summary ──────────────────────────────────────────────

export function AntiCheatSummary({ data }: { data: ExamDetailedAnalytics }) {
  const hasAnyViolations =
    data.flaggedCount > 0 ||
    data.avgTabSwitches > 0 ||
    data.totalCopyPasteAttempts > 0 ||
    data.totalFullscreenExits > 0;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          icon={<ShieldAlert className="h-4 w-4 text-amber-600" />}
          label="Flagged Sessions"
          value={String(data.flaggedCount)}
          subtext={`of ${data.totalStudents} total`}
          variant={data.flaggedCount > 0 ? 'warning' : 'default'}
        />
        <KpiCard
          icon={<AlertTriangle className="h-4 w-4 text-amber-600" />}
          label="Avg. Tab Switches"
          value={data.avgTabSwitches.toFixed(1)}
          variant={data.avgTabSwitches > 2 ? 'warning' : 'default'}
        />
        <KpiCard
          icon={<AlertTriangle className="h-4 w-4 text-red-600" />}
          label="Copy/Paste Attempts"
          value={String(data.totalCopyPasteAttempts)}
          subtext="across all sessions"
          variant={data.totalCopyPasteAttempts > 0 ? 'danger' : 'default'}
        />
        <KpiCard
          icon={<AlertTriangle className="h-4 w-4 text-amber-600" />}
          label="Fullscreen Exits"
          value={String(data.totalFullscreenExits)}
          subtext="across all sessions"
          variant={data.totalFullscreenExits > 0 ? 'warning' : 'default'}
        />
      </div>

      {!hasAnyViolations && (
        <Card>
          <CardContent className="flex items-center justify-center gap-2 py-6 text-sm text-green-600">
            <CheckCircle2 className="h-4 w-4" />
            No anti-cheat violations detected for this exam.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
