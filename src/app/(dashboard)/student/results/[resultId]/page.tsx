export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { requireRole } from '@/lib/auth-utils';
import { getStudentResultDetail } from '@/modules/results/result-queries';
import { AnswerBreakdown } from '@/modules/results/components';
import { PageHeader } from '@/components/shared';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatDateTime, formatDuration, formatPercentage, formatMarks } from '@/utils/format';
import { Award, Clock, CheckCircle2, XCircle, TrendingUp, Target, FileText } from 'lucide-react';

type Props = {
  params: Promise<{ resultId: string }>;
};

export default async function StudentResultDetailPage({ params }: Props) {
  const session = await requireRole('STUDENT');
  const { resultId } = await params;

  const result = await getStudentResultDetail(resultId, session.user.id);
  if (!result) notFound();

  const durationTaken =
    result.session.startedAt && result.session.submittedAt
      ? Math.round(
          (new Date(result.session.submittedAt).getTime() -
            new Date(result.session.startedAt).getTime()) /
            60000,
        )
      : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title={result.examTitle}
        description={`${result.subjectName} (${result.subjectCode})`}
        breadcrumbs={[
          { label: 'Results', href: '/student/results' },
          { label: result.examTitle },
        ]}
      />

      {/* Pass / Fail + Grade + Rank badges */}
      <div className="flex flex-wrap items-center gap-2">
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

      {/* Session Info */}
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

      {/* Question-by-Question Breakdown */}
      {result.answers.length > 0 ? (
        <>
          <Separator />
          <div className="space-y-2">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <FileText className="h-5 w-5" /> Answer Breakdown
            </h2>
            <p className="text-sm text-muted-foreground">
              Detailed view of each question, your answer, and the correct answer.
            </p>
          </div>
          <AnswerBreakdown answers={result.answers} />
        </>
      ) : (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            {result.allowReview
              ? 'No answers recorded for this exam session.'
              : 'Answer review is not enabled for this exam.'}
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
