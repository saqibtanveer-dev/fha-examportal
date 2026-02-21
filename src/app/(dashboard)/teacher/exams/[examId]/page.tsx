import { notFound } from 'next/navigation';
import { requireRole } from '@/lib/auth-utils';
import { getExamDetail } from '@/modules/exams/exam-queries';
import { getQuestionsForPicker } from '@/modules/questions/question-queries';
import { serialize } from '@/utils/serialize';
import { PageHeader } from '@/components/shared';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDateTime, formatDuration } from '@/utils/format';
import { Clock, Users, FileText, Award, CalendarDays, User } from 'lucide-react';
import { ExamQuestionManager } from '@/modules/exams/components/exam-question-manager';

type Props = {
  params: Promise<{ examId: string }>;
};

const statusVariant: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  PUBLISHED: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  ACTIVE: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  COMPLETED: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  ARCHIVED: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
};

export default async function ExamDetailPage({ params }: Props) {
  await requireRole('TEACHER', 'ADMIN');
  const { examId } = await params;

  const exam = await getExamDetail(examId);
  if (!exam) notFound();

  const availableQuestions = await getQuestionsForPicker(exam.subjectId);
  const e = serialize(exam);
  const aq = serialize(availableQuestions);

  return (
    <div className="space-y-6">
      <PageHeader
        title={e.title}
        description={`${e.type} · ${e.status}`}
        breadcrumbs={[
          { label: 'Exams', href: '/teacher/exams' },
          { label: e.title },
        ]}
      />

      {/* Status & Type Badges */}
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className={statusVariant[e.status]}>
          {e.status}
        </Badge>
        <Badge variant="outline">{e.type}</Badge>
        {e.shuffleQuestions && <Badge variant="secondary">Shuffled</Badge>}
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <InfoCard
          icon={<Clock className="h-4 w-4 text-muted-foreground" />}
          label="Duration"
          value={formatDuration(e.duration)}
        />
        <InfoCard
          icon={<Award className="h-4 w-4 text-muted-foreground" />}
          label="Total / Passing"
          value={`${e.totalMarks} / ${e.passingMarks}`}
        />
        <InfoCard
          icon={<FileText className="h-4 w-4 text-muted-foreground" />}
          label="Questions"
          value={String(e.examQuestions.length)}
        />
        <InfoCard
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          label="Sessions"
          value={String(e._count.examSessions)}
        />
      </div>

      {/* Schedule */}
      {(e.scheduledStartAt || e.scheduledEndAt) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarDays className="h-4 w-4" /> Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              {e.scheduledStartAt && (
                <div>
                  <dt className="text-muted-foreground">Start</dt>
                  <dd className="font-medium">{formatDateTime(e.scheduledStartAt)}</dd>
                </div>
              )}
              {e.scheduledEndAt && (
                <div>
                  <dt className="text-muted-foreground">End</dt>
                  <dd className="font-medium">{formatDateTime(e.scheduledEndAt)}</dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>
      )}

      {/* Description & Instructions */}
      {(e.description || e.instructions) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Description &amp; Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {e.description && (
              <p className="whitespace-pre-wrap wrap-break-word text-sm">{e.description}</p>
            )}
            {e.instructions && (
              <div>
                <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
                  Instructions
                </p>
                <p className="whitespace-pre-wrap wrap-break-word text-sm">{e.instructions}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Questions Manager */}
      <ExamQuestionManager
        examId={examId}
        examStatus={e.status}
        examQuestions={e.examQuestions}
        availableQuestions={aq}
      />

      {/* Assigned Classes */}
      {e.examClassAssignments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Assigned Classes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {e.examClassAssignments.map((a) => (
                <Badge key={a.id} variant="secondary">
                  {a.class.name}
                  {a.section ? ` – ${a.section.name}` : ''}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Details</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Created by</dt>
              <dd className="flex items-center gap-1 font-medium">
                <User className="h-3.5 w-3.5" />
                {e.createdBy.firstName} {e.createdBy.lastName}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Max Attempts</dt>
              <dd className="font-medium">{e.maxAttempts}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Show Results</dt>
              <dd className="font-medium">{e.showResultAfter.replace('_', ' ')}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Allow Review</dt>
              <dd className="font-medium">{e.allowReview ? 'Yes' : 'No'}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Created at</dt>
              <dd className="font-medium">{formatDateTime(e.createdAt)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Updated at</dt>
              <dd className="font-medium">{formatDateTime(e.updatedAt)}</dd>
            </div>
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
