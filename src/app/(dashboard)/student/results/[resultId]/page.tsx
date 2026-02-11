import { notFound } from 'next/navigation';
import { requireRole } from '@/lib/auth-utils';
import { getStudentResultDetail } from '@/modules/results/result-queries';
import { serialize } from '@/utils/serialize';
import { PageHeader } from '@/components/shared';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDateTime, formatDuration, formatPercentage, formatMarks } from '@/utils/format';
import { Award, Clock, CheckCircle2, XCircle, TrendingUp } from 'lucide-react';

type Props = {
  params: Promise<{ resultId: string }>;
};

export default async function StudentResultDetailPage({ params }: Props) {
  const session = await requireRole('STUDENT');
  const { resultId } = await params;

  const result = await getStudentResultDetail(resultId, session.user.id);
  if (!result) notFound();

  const r = serialize(result);

  const durationTaken =
    r.session.startedAt && r.session.submittedAt
      ? Math.round(
          (new Date(r.session.submittedAt).getTime() -
            new Date(r.session.startedAt).getTime()) /
            60000,
        )
      : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title={r.exam.title}
        description="Exam Result"
        breadcrumbs={[
          { label: 'Results', href: '/student/results' },
          { label: r.exam.title },
        ]}
      />

      {/* Pass / Fail Badge */}
      <div className="flex items-center gap-2">
        {r.isPassed ? (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Passed
          </Badge>
        ) : (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            <XCircle className="mr-1 h-3.5 w-3.5" /> Failed
          </Badge>
        )}
        {r.grade && <Badge variant="secondary">Grade: {r.grade}</Badge>}
        {r.rank && <Badge variant="outline">Rank #{r.rank}</Badge>}
      </div>

      {/* Score Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <InfoCard
          icon={<Award className="h-4 w-4 text-muted-foreground" />}
          label="Score"
          value={formatMarks(r.obtainedMarks, r.totalMarks)}
        />
        <InfoCard
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
          label="Percentage"
          value={formatPercentage(r.percentage)}
        />
        <InfoCard
          icon={<Award className="h-4 w-4 text-muted-foreground" />}
          label="Passing Marks"
          value={String(r.exam.passingMarks)}
        />
        <InfoCard
          icon={<Clock className="h-4 w-4 text-muted-foreground" />}
          label="Time Taken"
          value={durationTaken !== null ? formatDuration(durationTaken) : 'N/A'}
        />
      </div>

      {/* Session Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Session Details</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Status</dt>
              <dd className="font-medium">{r.session.status}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Exam Duration</dt>
              <dd className="font-medium">{formatDuration(r.exam.duration)}</dd>
            </div>
            {r.session.startedAt && (
              <div>
                <dt className="text-muted-foreground">Started at</dt>
                <dd className="font-medium">{formatDateTime(r.session.startedAt)}</dd>
              </div>
            )}
            {r.session.submittedAt && (
              <div>
                <dt className="text-muted-foreground">Submitted at</dt>
                <dd className="font-medium">{formatDateTime(r.session.submittedAt)}</dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>
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
