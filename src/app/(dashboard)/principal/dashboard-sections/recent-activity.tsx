'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants';
import { Badge } from '@/components/ui/badge';
import type { RecentActivity } from './stats-and-alerts';

const STATUS_COLOR: Record<string, string> = {
  DRAFT: 'secondary',
  PUBLISHED: 'default',
  ACTIVE: 'default',
  COMPLETED: 'default',
  ARCHIVED: 'secondary',
};

// ============================================
// Recent Exams List
// ============================================

export function RecentExamsList({ exams }: { exams: RecentActivity['recentExams'] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium">Recent Exams</CardTitle>
        <Link href={ROUTES.PRINCIPAL.EXAMS} className="text-xs text-primary hover:underline">
          View All
        </Link>
      </CardHeader>
      <CardContent className="space-y-3">
        {exams.length > 0 ? (
          exams.slice(0, 5).map((exam) => (
            <Link
              key={exam.id}
              href={`/principal/exams/${exam.id}`}
              className="block rounded-lg border p-3 transition-colors hover:bg-accent"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{exam.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {exam.subject.code} &bull; by {exam.createdBy.firstName} {exam.createdBy.lastName}
                  </p>
                </div>
                <Badge
                  variant={(STATUS_COLOR[exam.status] as 'default' | 'secondary') ?? 'secondary'}
                  className="shrink-0 text-[10px]"
                >
                  {exam.status}
                </Badge>
              </div>
            </Link>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No exams yet</p>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================
// Recent Results List
// ============================================

export function RecentResultsList({ results }: { results: RecentActivity['recentResults'] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Recent Results</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {results.length > 0 ? (
          results.slice(0, 5).map((result) => (
            <div key={result.id} className="flex items-center gap-3 rounded-lg border p-3">
              <div className="shrink-0">
                {result.isPassed ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {result.student.firstName} {result.student.lastName}
                </p>
                <p className="truncate text-xs text-muted-foreground">{result.exam.title}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-bold">{Number(result.percentage)}%</p>
                {result.grade && <p className="text-xs text-muted-foreground">{result.grade}</p>}
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No results yet</p>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================
// Recent Submissions List
// ============================================

export function RecentSubmissionsList({ sessions }: { sessions: RecentActivity['recentSessions'] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Recent Submissions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {sessions.length > 0 ? (
          sessions.slice(0, 5).map((session) => (
            <div key={session.id} className="rounded-lg border p-3">
              <p className="truncate text-sm font-medium">
                {session.student.firstName} {session.student.lastName}
              </p>
              <p className="truncate text-xs text-muted-foreground">{session.exam.title}</p>
              {session.submittedAt && (
                <p className="mt-1 text-[10px] text-muted-foreground">
                  {new Date(session.submittedAt).toLocaleString()}
                </p>
              )}
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No submissions yet</p>
        )}
      </CardContent>
    </Card>
  );
}
