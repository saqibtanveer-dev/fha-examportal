'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Users, BarChart3, CheckCircle2, XCircle, AlertTriangle, Shield, TrendingUp, Target,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import type { ExamDetailedAnalytics } from '@/modules/results/result-queries';
import { ExamQuestionAnalytics } from './exam-question-analytics';

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

type Props = { analytics: ExamDetailedAnalytics };

export function ExamAnalyticsSection({ analytics }: Props) {
  return (
    <div className="space-y-6">
      {/* Overall Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Total Students" value={analytics.totalStudents} icon={Users} />
        <StatCard label="Passed" value={analytics.passed} icon={CheckCircle2} color="text-green-600" />
        <StatCard label="Failed" value={analytics.failed} icon={XCircle} color="text-red-600" />
        <StatCard
          label="Pass Rate"
          value={`${Math.round(analytics.passRate)}%`}
          icon={TrendingUp}
          color={analytics.passRate >= 50 ? 'text-green-600' : 'text-red-600'}
        />
        <StatCard label="Average" value={`${Math.round(analytics.avgPercentage * 10) / 10}%`} icon={BarChart3} />
        <StatCard label="Median" value={`${Math.round(analytics.medianPercentage * 10) / 10}%`} icon={Target} />
      </div>

      {/* Statistical Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Statistical Summary</CardTitle>
          <CardDescription>Distribution metrics and quartile analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
            <div>
              <p className="text-muted-foreground">Std Deviation</p>
              <p className="text-lg font-bold">{Math.round(analytics.stdDeviation * 100) / 100}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Min Score</p>
              <p className="text-lg font-bold">{Math.round(analytics.minPercentage * 10) / 10}%</p>
            </div>
            <div>
              <p className="text-muted-foreground">Max Score</p>
              <p className="text-lg font-bold">{Math.round(analytics.maxPercentage * 10) / 10}%</p>
            </div>
            <div>
              <p className="text-muted-foreground">IQR (Q1–Q3)</p>
              <p className="text-lg font-bold">
                {Math.round(analytics.q1Percentage)}% – {Math.round(analytics.q3Percentage)}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Score Distribution</CardTitle>
            <CardDescription>Student count by percentage range</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={analytics.scoreDistribution}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="range" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Students" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Grade Distribution</CardTitle>
            <CardDescription>Breakdown by grade</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.gradeDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={analytics.gradeDistribution}
                    dataKey="count"
                    nameKey="grade"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={((entry: any) => `${entry.grade}: ${entry.count}`) as any}
                  >
                    {analytics.gradeDistribution.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground py-12 text-center text-sm">No grade data</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Time Analytics */}
      {analytics.avgCompletionTime !== null && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Time Analytics</CardTitle>
              <CardDescription>Completion time statistics (in minutes)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <p className="text-muted-foreground">Fastest</p>
                  <p className="text-xl font-bold text-green-600">
                    {analytics.fastestTime !== null ? `${Math.round(analytics.fastestTime)}m` : '—'}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground">Average</p>
                  <p className="text-xl font-bold">{Math.round(analytics.avgCompletionTime)}m</p>
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground">Slowest</p>
                  <p className="text-xl font-bold text-red-600">
                    {analytics.slowestTime !== null ? `${Math.round(analytics.slowestTime)}m` : '—'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {analytics.timeDistribution.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Time Distribution</CardTitle>
                <CardDescription>Student count by completion time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={analytics.timeDistribution}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="range" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Students" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Anti-Cheat Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-4 w-4" />
            Anti-Cheat Summary
          </CardTitle>
          <CardDescription>Integrity monitoring statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
            <div className="text-center">
              <p className="text-muted-foreground">Flagged Sessions</p>
              <p className={`text-2xl font-bold ${analytics.flaggedCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {analytics.flaggedCount}
              </p>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground">Avg Tab Switches</p>
              <p className={`text-2xl font-bold ${analytics.avgTabSwitches > 3 ? 'text-yellow-600' : ''}`}>
                {Math.round(analytics.avgTabSwitches * 10) / 10}
              </p>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground">Copy/Paste Attempts</p>
              <p className={`text-2xl font-bold ${analytics.totalCopyPasteAttempts > 0 ? 'text-yellow-600' : ''}`}>
                {analytics.totalCopyPasteAttempts}
              </p>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground">Fullscreen Exits</p>
              <p className={`text-2xl font-bold ${analytics.totalFullscreenExits > 3 ? 'text-yellow-600' : ''}`}>
                {analytics.totalFullscreenExits}
              </p>
            </div>
          </div>
          {analytics.flaggedCount > 0 && (
            <div className="mt-4 flex items-center gap-2 rounded-md border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-700 dark:text-red-400">
                {analytics.flaggedCount} session{analytics.flaggedCount > 1 ? 's' : ''} flagged for
                suspicious activity. Review recommended.
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Per-Question Analytics */}
      <ExamQuestionAnalytics questions={analytics.questions} />
    </div>
  );
}

function StatCard({
  label, value, icon: Icon, color,
}: {
  label: string; value: string | number; icon: React.ElementType; color?: string;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-4 text-center">
        <Icon className={`mb-1 h-5 w-5 ${color ?? 'text-muted-foreground'}`} />
        <p className="text-muted-foreground text-xs">{label}</p>
        <p className={`text-lg font-bold ${color ?? ''}`}>{value}</p>
      </CardContent>
    </Card>
  );
}
