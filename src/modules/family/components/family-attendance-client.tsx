'use client';

// ============================================
// Family Attendance Page — Client Component
// ============================================

import { PageHeader } from '@/components/shared';
import { EmptyState } from '@/components/shared';
import { SkeletonDashboard } from '@/components/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CalendarCheck, AlertTriangle } from 'lucide-react';
import { useSelectedChild, useChildAttendanceSummary } from '@/modules/family/hooks';
import { ChildSelector } from './child-selector';
import { ATTENDANCE_ALERT_THRESHOLD } from '@/modules/family/family.constants';

export function FamilyAttendanceClient() {
  const { children, selectedChild, selectedChildId, isLoading: childrenLoading } = useSelectedChild();
  const { data, isLoading } = useChildAttendanceSummary(selectedChildId ?? '', !!selectedChildId);

  if (childrenLoading || isLoading) return <SkeletonDashboard />;

  if (!selectedChild) {
    return (
      <EmptyState
        icon={<CalendarCheck className="h-12 w-12 text-muted-foreground" />}
        title="No Children"
        description="No students are linked to your account."
      />
    );
  }

  const summary = data?.success ? data.data : null;
  const isLow = summary ? summary.daily.percentage < ATTENDANCE_ALERT_THRESHOLD : false;

  return (
    <div>
      <PageHeader title="Attendance" description={`${selectedChild.studentName}'s attendance record`} />
      <div className="mb-4 flex items-center justify-between">
        <ChildSelector children={children} selectedChildId={selectedChildId} />
      </div>

      {summary ? (
        <div className="space-y-4">
          {/* Overall Stats */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <AttendanceStatCard label="Total Days" value={summary.daily.totalDays} />
            <AttendanceStatCard label="Present" value={summary.daily.present} variant="success" />
            <AttendanceStatCard label="Absent" value={summary.daily.absent} variant="destructive" />
            <AttendanceStatCard label="Late" value={summary.daily.late} variant="warning" />
          </div>

          {/* Percentage Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Overall Attendance</CardTitle>
                {isLow && (
                  <Badge variant="destructive" className="gap-1">
                    <AlertTriangle className="h-3 w-3" /> Below {ATTENDANCE_ALERT_THRESHOLD}%
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Progress value={summary.daily.percentage} className="flex-1" />
                <span className={`text-2xl font-bold ${isLow ? 'text-destructive' : 'text-green-600'}`}>
                  {summary.daily.percentage}%
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Breakdown */}
          {summary.monthly.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Monthly Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {summary.monthly.map((m) => (
                    <div key={m.month} className="flex items-center justify-between rounded-md border p-2 text-sm">
                      <span className="font-medium">{m.month}</span>
                      <div className="flex gap-3">
                        <span className="text-green-600">Present: {m.present}</span>
                        <span className="text-destructive">Absent: {m.absent}</span>
                        <span className="text-muted-foreground">Total: {m.total}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <EmptyState icon={<CalendarCheck className="h-12 w-12 text-muted-foreground" />} title="No Attendance Data" description="No attendance records found." />
      )}
    </div>
  );
}

// ── Local Helper ──

function AttendanceStatCard({ label, value, variant }: { label: string; value: number; variant?: string }) {
  const colorMap: Record<string, string> = {
    success: 'text-green-600',
    destructive: 'text-destructive',
    warning: 'text-amber-600',
  };

  return (
    <Card>
      <CardContent className="pt-4">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className={`text-2xl font-bold ${variant ? colorMap[variant] ?? '' : ''}`}>{value}</p>
      </CardContent>
    </Card>
  );
}
