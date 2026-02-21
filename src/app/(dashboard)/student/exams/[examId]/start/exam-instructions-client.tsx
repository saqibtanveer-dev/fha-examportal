'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/shared';
import { startSessionAction } from '@/modules/sessions/session-actions';
import { toast } from 'sonner';
import {
  Clock, FileText, Award, ShieldAlert, Play, ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';

type Exam = {
  id: string;
  title: string;
  description: string | null;
  instructions: string | null;
  duration: number;
  totalMarks: string | number;
  passingMarks: string | number;
  maxAttempts: number;
  shuffleQuestions: boolean;
  type: string;
  subject: { name: string; code: string };
  _count: { examQuestions: number };
};

type Props = { exam: Exam };

export function ExamInstructionsClient({ exam }: Props) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleStart() {
    startTransition(async () => {
      const result = await startSessionAction(exam.id);
      if (result.success && result.data) {
        const data = result.data as { sessionId: string };
        router.push(`/student/exams/sessions/${data.sessionId}`);
      } else {
        toast.error(result.error ?? 'Failed to start exam');
      }
    });
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-8">
      <div className="text-center">
        <Badge variant="outline" className="mb-2">{exam.subject.code}</Badge>
        <h1 className="text-2xl font-bold">{exam.title}</h1>
        <p className="text-muted-foreground">{exam.type} Examination</p>
      </div>

      {/* Exam Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Exam Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <InfoRow icon={<Clock className="h-4 w-4" />} label="Duration" value={`${exam.duration} minutes`} />
            <InfoRow icon={<FileText className="h-4 w-4" />} label="Questions" value={String(exam._count.examQuestions)} />
            <InfoRow icon={<Award className="h-4 w-4" />} label="Total Marks" value={String(exam.totalMarks)} />
            <InfoRow icon={<Award className="h-4 w-4" />} label="Passing Marks" value={String(exam.passingMarks)} />
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {exam.instructions ? (
            <p className="whitespace-pre-wrap wrap-break-word">{exam.instructions}</p>
          ) : (
            <ul className="list-inside list-disc space-y-1 text-muted-foreground">
              <li>Read each question carefully before answering.</li>
              <li>You have <strong>{exam.duration} minutes</strong> to complete the exam.</li>
              <li>The exam will auto-submit when time runs out.</li>
              <li>You can navigate between questions and flag them for review.</li>
              <li>Ensure a stable internet connection throughout the exam.</li>
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Anti-cheat Warning */}
      <Card className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950">
        <CardContent className="flex items-start gap-3 pt-6">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <div className="text-sm">
            <p className="font-semibold text-amber-800 dark:text-amber-200">Proctoring Enabled</p>
            <p className="text-amber-700 dark:text-amber-300">
              This exam monitors tab switches, copy/paste attempts, and fullscreen exits.
              The exam will run in fullscreen mode. Suspicious activity will be flagged.
            </p>
          </div>
        </CardContent>
      </Card>

      {exam.description && (
        <p className="text-center text-sm text-muted-foreground">{exam.description}</p>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Link href="/student/exams">
          <Button variant="outline">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back
          </Button>
        </Link>
        <Button size="lg" onClick={handleStart} disabled={isPending}>
          {isPending ? <Spinner size="sm" className="mr-2" /> : <Play className="mr-2 h-4 w-4" />}
          Start Exam
        </Button>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground">{icon}</span>
      <span className="text-sm text-muted-foreground">{label}:</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}
