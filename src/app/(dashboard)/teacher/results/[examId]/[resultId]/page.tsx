export const dynamic = 'force-dynamic';

import { notFound, redirect } from 'next/navigation';
import { requireRole } from '@/lib/auth-utils';
import { getTeacherResultDetail } from '@/modules/results/result-queries';
import { AnswerBreakdown } from '@/modules/results/components';
import { PageHeader } from '@/components/shared';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { prisma } from '@/lib/prisma';
import { formatDateTime, formatDuration, formatPercentage, formatMarks } from '@/utils/format';
import {
  Award,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Target,
  FileText,
  ShieldAlert,
  User,
  AlertTriangle,
} from 'lucide-react';

type Props = {
  params: Promise<{ examId: string; resultId: string }>;
};

export default async function TeacherResultDetailPage({ params }: Props) {
  const session = await requireRole('TEACHER', 'ADMIN');
  const { examId, resultId } = await params;

  // Verify teacher ownership of this exam
  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    select: { createdById: true },
  });
  if (!exam) redirect('/teacher/results');
  if (session.user.role === 'TEACHER' && exam.createdById !== session.user.id) {
    redirect('/teacher/results');
  }

  const result = await getTeacherResultDetail(resultId);
  if (!result) notFound();

  const durationTaken =
    result.session.startedAt && result.session.submittedAt
      ? Math.round(
          (new Date(result.session.submittedAt).getTime() -
            new Date(result.session.startedAt).getTime()) /
            60000,
        )
      : null;

  const studentName = `${result.student.firstName} ${result.student.lastName}`;

  const hasAntiCheatViolations =
    result.session.tabSwitchCount > 0 ||
    result.session.fullscreenExits > 0 ||
    result.session.copyPasteAttempts > 0 ||
    result.session.isFlagged;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${studentName}'s Result`}
        description={`${result.examTitle} — ${result.subjectName} (${result.subjectCode})`}
        breadcrumbs={[
          { label: 'Results', href: '/teacher/results' },
          { label: result.examTitle, href: `/teacher/results/${examId}` },
          { label: studentName },
        ]}
      />

      {/* Student Info + Pass/Fail */}
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="gap-1 text-sm">
          <User className="h-3.5 w-3.5" />
          {studentName}
        </Badge>
        {result.isPassed ? (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Passed
          </Badge>
        ) : (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            <XCircle className="mr-1 h-3.5 w-3.5" /> Failed
          </Badge>
        )}
        {result.grade && <Badge variant="secondary">Grade: {result.grade}</Badge>}
        {result.rank && <Badge variant="outline">Rank #{result.rank}</Badge>}
        <Badge variant="outline" className="text-xs">
          Attempt #{result.session.attemptNumber}
        </Badge>
        {result.session.isFlagged && (
          <Badge variant="destructive" className="gap-1">
            <AlertTriangle className="h-3 w-3" /> Flagged
          </Badge>
        )}
      </div>

      {/* Score Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <InfoCard
          icon={<Award className="h-4 w-4 text-muted-foreground" />}
          label="Score"
          value={formatMarks(result.obtainedMarks, result.totalMarks)}
        />
        <InfoCard
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
          label="Percentage"
          value={formatPercentage(result.percentage)}
        />
        <InfoCard
          icon={<Target className="h-4 w-4 text-muted-foreground" />}
          label="Passing Marks"
          value={String(result.passingMarks)}
        />
        <InfoCard
          icon={<Clock className="h-4 w-4 text-muted-foreground" />}
          label="Time Taken"
          value={durationTaken !== null ? formatDuration(durationTaken) : 'N/A'}
        />
      </div>

      {/* Session Details */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Session Details</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <dt className="text-muted-foreground">Status</dt>
              <dd className="font-medium">{result.session.status}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Exam Duration</dt>
              <dd className="font-medium">{formatDuration(result.duration)}</dd>
            </div>
            {result.session.startedAt && (
              <div>
                <dt className="text-muted-foreground">Started at</dt>
                <dd className="font-medium">{formatDateTime(result.session.startedAt)}</dd>
              </div>
            )}
            {result.session.submittedAt && (
              <div>
                <dt className="text-muted-foreground">Submitted at</dt>
                <dd className="font-medium">{formatDateTime(result.session.submittedAt)}</dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      {/* Anti-Cheat Monitoring — Teacher Only */}
      {hasAntiCheatViolations && (
        <Card className="border-amber-200 dark:border-amber-900">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base text-amber-700 dark:text-amber-400">
              <ShieldAlert className="h-4 w-4" />
              Anti-Cheat Violations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <dt className="text-muted-foreground">Tab Switches</dt>
                <dd className="font-medium">
                  {result.session.tabSwitchCount > 0 ? (
                    <span className="text-amber-700 dark:text-amber-400">
                      {result.session.tabSwitchCount}
                    </span>
                  ) : (
                    '0'
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Fullscreen Exits</dt>
                <dd className="font-medium">
                  {result.session.fullscreenExits > 0 ? (
                    <span className="text-amber-700 dark:text-amber-400">
                      {result.session.fullscreenExits}
                    </span>
                  ) : (
                    '0'
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Copy/Paste Attempts</dt>
                <dd className="font-medium">
                  {result.session.copyPasteAttempts > 0 ? (
                    <span className="text-amber-700 dark:text-amber-400">
                      {result.session.copyPasteAttempts}
                    </span>
                  ) : (
                    '0'
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Flagged</dt>
                <dd className="font-medium">
                  {result.session.isFlagged ? (
                    <Badge variant="destructive" className="text-xs">Yes</Badge>
                  ) : (
                    'No'
                  )}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      )}

      {/* Question-by-Question Breakdown */}
      <Separator />
      <div className="space-y-2">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <FileText className="h-5 w-5" /> Answer Breakdown
        </h2>
        <p className="text-sm text-muted-foreground">
          Detailed view of each question, student&apos;s answer, grading, and AI confidence.
        </p>
      </div>

      {result.answers.length > 0 ? (
        <AnswerBreakdown answers={result.answers} aiGradeMap={result.aiGradeMap} />
      ) : (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No answers recorded for this exam session.
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        {icon}
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-sm font-semibold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
