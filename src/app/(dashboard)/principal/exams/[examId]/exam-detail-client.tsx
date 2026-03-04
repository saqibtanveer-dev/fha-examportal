'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, BarChart3, Clock, FileText, TrendingUp, Award, Target } from 'lucide-react';
import { ROUTES } from '@/lib/constants';
import type { ExamDetailedAnalytics } from '@/modules/results/result-queries';
import { ExamAnalyticsSection } from './exam-analytics-section';

type ExamInfo = {
  id: string;
  title: string;
  description: string | null;
  type: string;
  status: string;
  totalMarks: number;
  passingMarks: number;
  duration: number;
  instructions: string | null;
  shuffleQuestions: boolean;
  allowReview: boolean;
  maxAttempts: number;
  scheduledStartAt: string | null;
  scheduledEndAt: string | null;
  createdAt: string;
  updatedAt: string;
  subject: { id: string; name: string; code: string };
  createdBy: { id: string; firstName: string; lastName: string };
  _count: { examQuestions: number; examResults: number };
  examClassAssignments: {
    class: { id: string; name: string };
    section: { id: string; name: string } | null;
  }[];
};

type Props = {
  exam: ExamInfo;
  analytics: ExamDetailedAnalytics | null;
};

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  PUBLISHED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  ACTIVE: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  COMPLETED: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  ARCHIVED: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
};

const typeLabels: Record<string, string> = {
  QUIZ: 'Quiz',
  MIDTERM: 'Midterm',
  FINAL: 'Final',
  PRACTICE: 'Practice',
  CUSTOM: 'Custom',
};

export function ExamDetailClient({ exam, analytics }: Props) {
  const router = useRouter();

  const formatDate = (iso: string | null) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(ROUTES.PRINCIPAL.EXAMS)}
            className="mt-0.5 shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{exam.title}</h1>
            <p className="text-muted-foreground text-sm">
              {exam.subject.name} ({exam.subject.code}) · Created by{' '}
              {exam.createdBy.firstName} {exam.createdBy.lastName}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={statusColors[exam.status] ?? ''} variant="secondary">
            {exam.status}
          </Badge>
          <Badge variant="outline">{typeLabels[exam.type] ?? exam.type}</Badge>
        </div>
      </div>

      {/* Exam Info Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <InfoCard icon={FileText} label="Questions" value={exam._count.examQuestions} />
        <InfoCard icon={Users} label="Attempts" value={exam._count.examResults} />
        <InfoCard icon={Target} label="Total Marks" value={Number(exam.totalMarks)} />
        <InfoCard icon={Award} label="Passing" value={Number(exam.passingMarks)} />
        <InfoCard icon={Clock} label="Duration" value={`${exam.duration}m`} />
        <InfoCard icon={TrendingUp} label="Max Attempts" value={exam.maxAttempts} />
      </div>

      {/* Exam Configuration + Scheduling */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <ConfigRow label="Shuffle Questions" value={exam.shuffleQuestions ? 'Yes' : 'No'} />
              <ConfigRow label="Allow Review" value={exam.allowReview ? 'Yes' : 'No'} />
              <ConfigRow label="Scheduled Start" value={formatDate(exam.scheduledStartAt)} />
              <ConfigRow label="Scheduled End" value={formatDate(exam.scheduledEndAt)} />
              <ConfigRow label="Created" value={formatDate(exam.createdAt)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Assigned Classes</CardTitle>
            <CardDescription>
              {exam.examClassAssignments.length} class assignment{exam.examClassAssignments.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {exam.examClassAssignments.length === 0 ? (
              <p className="text-muted-foreground text-sm">No class assignments</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {exam.examClassAssignments.map((a, i) => (
                  <Badge key={i} variant="outline" className="text-sm">
                    {a.class.name}
                    {a.section && ` - ${a.section.name}`}
                  </Badge>
                ))}
              </div>
            )}
            {exam.description && (
              <div className="mt-4 border-t pt-3">
                <p className="text-muted-foreground text-xs font-medium uppercase">Description</p>
                <p className="mt-1 text-sm">{exam.description}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Analytics Section */}
      {analytics ? (
        <ExamAnalyticsSection analytics={analytics} />
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <BarChart3 className="text-muted-foreground mx-auto mb-3 h-12 w-12" />
            <h3 className="text-lg font-semibold">No Analytics Available</h3>
            <p className="text-muted-foreground text-sm">
              Analytics will appear once students submit their exams.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/* ---------- helpers ---------- */

function InfoCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-4 text-center">
        <Icon className="text-muted-foreground mb-1 h-5 w-5" />
        <p className="text-muted-foreground text-xs">{label}</p>
        <p className="text-lg font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}

function ConfigRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}