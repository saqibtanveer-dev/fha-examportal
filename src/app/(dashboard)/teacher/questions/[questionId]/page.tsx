import { notFound } from 'next/navigation';
import { requireRole } from '@/lib/auth-utils';
import { getQuestionById } from '@/modules/questions/question-queries';
import { serialize } from '@/utils/serialize';
import { PageHeader } from '@/components/shared';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDateTime } from '@/utils/format';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  BookOpen,
  User,
  Tag,
  FileText,
} from 'lucide-react';

type Props = {
  params: Promise<{ questionId: string }>;
};

const difficultyVariant: Record<string, string> = {
  EASY: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  MEDIUM: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  HARD: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

const typeLabel: Record<string, string> = {
  MCQ: 'Multiple Choice',
  SHORT_ANSWER: 'Short Answer',
  LONG_ANSWER: 'Long Answer',
};

export default async function QuestionDetailPage({ params }: Props) {
  await requireRole('TEACHER', 'ADMIN');
  const { questionId } = await params;

  const question = await getQuestionById(questionId);
  if (!question) notFound();

  const q = serialize(question);

  return (
    <div className="space-y-6">
      <PageHeader
        title={q.title}
        description={`${typeLabel[q.type] ?? q.type} · ${q.difficulty}`}
        breadcrumbs={[
          { label: 'Questions', href: '/teacher/questions' },
          { label: q.title },
        ]}
      />

      {/* Overview Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <InfoCard
          icon={<Award className="h-4 w-4 text-muted-foreground" />}
          label="Marks"
          value={String(q.marks)}
        />
        <InfoCard
          icon={<Clock className="h-4 w-4 text-muted-foreground" />}
          label="Expected Time"
          value={q.expectedTime ? `${q.expectedTime} min` : 'Not set'}
        />
        <InfoCard
          icon={<BookOpen className="h-4 w-4 text-muted-foreground" />}
          label="Subject"
          value={`${q.subject.name} (${q.subject.code})`}
        />
        <InfoCard
          icon={<FileText className="h-4 w-4 text-muted-foreground" />}
          label="Used in Exams"
          value={String(q._count.examQuestions)}
        />
      </div>

      {/* Badges Row */}
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline">{typeLabel[q.type] ?? q.type}</Badge>
        <Badge variant="outline" className={difficultyVariant[q.difficulty]}>
          {q.difficulty}
        </Badge>
        {!q.isActive && <Badge variant="destructive">Inactive</Badge>}
      </div>

      {/* Description / Body */}
      {q.description && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm">{q.description}</p>
          </CardContent>
        </Card>
      )}

      {/* MCQ Options */}
      {q.type === 'MCQ' && q.mcqOptions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {q.mcqOptions.map((opt) => (
              <div
                key={opt.id}
                className={`flex items-center gap-3 rounded-md border px-4 py-2 text-sm ${
                  opt.isCorrect
                    ? 'border-green-500 bg-green-50 dark:bg-green-950'
                    : ''
                }`}
              >
                {opt.isCorrect ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 shrink-0 text-muted-foreground" />
                )}
                <span className="font-medium">{opt.label}.</span>
                <span>{opt.text}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Model Answer / Explanation */}
      {(q.modelAnswer || q.explanation) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Answer &amp; Explanation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {q.modelAnswer && (
              <div>
                <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
                  Model Answer
                </p>
                <p className="whitespace-pre-wrap text-sm">{q.modelAnswer}</p>
              </div>
            )}
            {q.explanation && (
              <div>
                <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
                  Explanation
                </p>
                <p className="whitespace-pre-wrap text-sm">{q.explanation}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tags */}
      {q.questionTags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Tag className="h-4 w-4" /> Tags
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {q.questionTags.map((qt) => (
              <Badge key={qt.id} variant="secondary">
                {qt.tag.name}
              </Badge>
            ))}
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
                {q.createdBy.firstName} {q.createdBy.lastName}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Created at</dt>
              <dd className="font-medium">{formatDateTime(q.createdAt)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Updated at</dt>
              <dd className="font-medium">{formatDateTime(q.updatedAt)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Usage Count</dt>
              <dd className="font-medium">{q.usageCount}</dd>
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
