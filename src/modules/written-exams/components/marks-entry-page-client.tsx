'use client';

import { useState, useEffect } from 'react';
import { useWrittenExamMarkEntry, useInitializeWrittenSessions } from '@/modules/written-exams/hooks/use-written-exam-query';
import { PageHeader, Spinner } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Users, CheckCircle2, Clock, UserX, AlertCircle,
  RefreshCcw, ClipboardList, Table2, Lock,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import type { ComponentProps } from 'react';
import { PerStudentView } from './per-student-view';
import type { SpreadsheetView as _SV } from './spreadsheet-view';

const SpreadsheetView = dynamic<ComponentProps<typeof _SV>>(
  () => import('./spreadsheet-view').then(m => ({ default: m.SpreadsheetView })),
  { ssr: false, loading: () => <div className="flex items-center justify-center py-12"><Spinner size="lg" /><span className="ml-2 text-sm text-muted-foreground">Loading spreadsheet...</span></div> },
);
import { FinalizeDialog } from './finalize-dialog';
import { ExcelActions } from './excel-actions';

type Props = { examId: string };

export function MarksEntryPageClient({ examId }: Props) {
  const { data, isLoading, error, refetch } = useWrittenExamMarkEntry(examId);
  const { mutate: initializeSessions, isPending: isInitializing } = useInitializeWrittenSessions(examId);
  const [activeView, setActiveView] = useState<'student' | 'spreadsheet'>('student');
  const [showFinalize, setShowFinalize] = useState(false);

  const needsInit = !!data && data.sessions.length === 0 && !isInitializing;
  useEffect(() => {
    if (needsInit) initializeSessions();
  }, [needsInit, initializeSessions]);

  if (isLoading) {
    return (
      <div className="space-y-6 p-4 sm:p-6">
        <div className="space-y-2">
          <div className="h-5 w-48 animate-pulse rounded bg-muted" />
          <div className="h-8 w-72 animate-pulse rounded bg-muted" />
        </div>
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg border bg-muted/50" />
          ))}
        </div>
        <div className="h-64 animate-pulse rounded-lg border bg-muted/50" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-4">
        <div className="rounded-full bg-destructive/10 p-4">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <div className="text-center">
          <p className="font-medium">Failed to load exam data</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Check your connection and try again.
          </p>
        </div>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCcw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  const { exam, questions, sessions, stats } = data;
  const progressPercent =
    stats.totalStudents > 0
      ? Math.round((stats.completedCount / stats.totalStudents) * 100)
      : 0;
  const isFinalized = exam.status === 'COMPLETED';

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title={exam.title}
        description={`${exam.subject.name} · Written Exam · ${questions.length} Questions · ${exam.totalMarks} Total Marks`}
        breadcrumbs={[
          { label: 'Exams', href: '/teacher/exams' },
          { label: exam.title, href: `/teacher/exams/${examId}` },
          { label: 'Enter Marks' },
        ]}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
        <StatCard icon={Users} label="Total" value={stats.totalStudents} />
        <StatCard icon={CheckCircle2} label="Completed" value={stats.completedCount} color="text-green-600 dark:text-green-400" />
        <StatCard icon={Clock} label="Remaining" value={stats.inProgressCount + stats.pendingCount} color="text-amber-600 dark:text-amber-400" />
        <StatCard icon={UserX} label="Absent" value={stats.absentCount} color="text-red-600 dark:text-red-400" />
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Mark Entry Progress</span>
          <span className="font-medium tabular-nums">{progressPercent}%</span>
        </div>
        <Progress value={progressPercent} className="h-2" />
      </div>

      {/* View Toggle + Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={activeView} onValueChange={(v) => setActiveView(v as 'student' | 'spreadsheet')}>
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="student" className="flex-1 gap-1.5 sm:flex-initial">
              <ClipboardList className="h-4 w-4" />
              <span className="hidden xs:inline">Per Student</span>
              <span className="xs:hidden">Student</span>
            </TabsTrigger>
            <TabsTrigger value="spreadsheet" className="flex-1 gap-1.5 sm:flex-initial">
              <Table2 className="h-4 w-4" />
              <span>Spreadsheet</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex flex-wrap items-center gap-2">
          {sessions.length > 0 && (
            <ExcelActions examId={examId} data={data} isFinalized={isFinalized} />
          )}
          {sessions.length === 0 && (
            <Button
              size="sm"
              onClick={() => initializeSessions()}
              disabled={isInitializing}
              className="flex-1 sm:flex-initial"
            >
              {isInitializing && <Spinner size="sm" className="mr-2" />}
              Initialize Sessions
            </Button>
          )}
          {isFinalized && (
            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
              <Lock className="mr-1 h-3 w-3" />
              Finalized
            </Badge>
          )}
          {sessions.length > 0 && (
            <Button
              size="sm"
              onClick={() => setShowFinalize(true)}
              disabled={stats.completedCount === 0 && stats.absentCount === 0}
              className="flex-1 sm:flex-initial"
            >
              {isFinalized ? 'Re-finalize' : 'Finalize Results'}
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      {sessions.length === 0 ? (
        <Card>
          <CardContent className="flex min-h-40 flex-col items-center justify-center gap-3 py-12 text-center">
            {isInitializing ? (
              <>
                <Spinner size="lg" />
                <p className="text-sm text-muted-foreground">Creating student sessions...</p>
              </>
            ) : (
              <>
                <Users className="h-10 w-10 text-muted-foreground/50" />
                <div>
                  <p className="font-medium">No student sessions</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Make sure classes are assigned and students are enrolled.
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      ) : activeView === 'student' ? (
        <PerStudentView examId={examId} questions={questions} sessions={sessions} isFinalized={isFinalized} />
      ) : (
        <SpreadsheetView examId={examId} questions={questions} sessions={sessions} isFinalized={isFinalized} />
      )}

      <FinalizeDialog
        open={showFinalize}
        onOpenChange={setShowFinalize}
        examId={examId}
        isRefinalize={isFinalized}
        stats={stats}
      />
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  color?: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-3 sm:p-4">
        <div className={`rounded-lg bg-muted p-2 ${color ?? 'text-foreground'}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="text-lg font-bold tabular-nums sm:text-2xl">{value}</p>
          <p className="truncate text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
