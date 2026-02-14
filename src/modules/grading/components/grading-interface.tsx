'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/shared';
import { gradeAnswerAction } from '@/modules/grading/grading-actions';
import { approveAiGradeAction } from '@/modules/grading/ai-grading-actions';
import { toast } from 'sonner';
import { CheckCircle, ChevronLeft, ChevronRight, Brain, Shield, ShieldAlert, AlertTriangle } from 'lucide-react';

type Answer = {
  id: string;
  answer: string;
  question: { id: string; title: string; marks: number; type: string; correctAnswer: string | null };
  answerGrade: {
    id: string;
    marksAwarded: number;
    feedback: string | null;
    gradedBy: string;
    aiConfidence: number | string | null;
    isReviewed: boolean;
  } | null;
};

type AntiCheatInfo = {
  tabSwitchCount: number;
  fullscreenExits: number;
  copyPasteAttempts: number;
  isFlagged: boolean;
};

type Props = {
  sessionId: string;
  answers: Answer[];
  studentName: string;
  antiCheatInfo?: AntiCheatInfo;
};

export function GradingInterface({ sessionId, answers, studentName, antiCheatInfo }: Props) {
  const [isPending, startTransition] = useTransition();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [marks, setMarks] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<Record<string, string>>({});
  const router = useRouter();

  const current = answers[currentIndex];
  if (!current) return null;

  const ungradedAnswers = answers.filter((a) => !a.answerGrade);
  const gradedCount = answers.length - ungradedAnswers.length;

  function handleGrade(answerId: string) {
    const m = parseFloat(marks[answerId] ?? '0');
    const f = feedback[answerId] ?? '';

    startTransition(async () => {
      const result = await gradeAnswerAction(answerId, m, f);
      if (result.success) {
        toast.success('Answer graded');
        router.refresh();
      } else {
        toast.error(result.error ?? 'Failed');
      }
    });
  }

  function handleApproveAi(gradeId: string) {
    startTransition(async () => {
      const result = await approveAiGradeAction(gradeId);
      if (result.success) {
        toast.success('AI grade approved');
        router.refresh();
      } else {
        toast.error(result.error ?? 'Failed to approve');
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-lg border bg-card p-3">
        <div>
          <h2 className="font-semibold">Grading: {studentName}</h2>
          <p className="text-sm text-muted-foreground">
            {gradedCount}/{answers.length} graded
          </p>
        </div>
        <Badge variant={gradedCount === answers.length ? 'default' : 'secondary'}>
          {gradedCount === answers.length ? 'All Graded' : `${ungradedAnswers.length} remaining`}
        </Badge>
      </div>

      {/* Anti-cheat info */}
      {antiCheatInfo && (antiCheatInfo.isFlagged || antiCheatInfo.tabSwitchCount > 0 || antiCheatInfo.fullscreenExits > 0 || antiCheatInfo.copyPasteAttempts > 0) && (
        <div className={`rounded-lg border p-3 ${antiCheatInfo.isFlagged ? 'border-destructive bg-destructive/5' : 'border-yellow-300 bg-yellow-50'}`}>
          <div className="flex items-center gap-2 mb-2">
            {antiCheatInfo.isFlagged ? (
              <ShieldAlert className="h-4 w-4 text-destructive" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            )}
            <span className={`text-sm font-medium ${antiCheatInfo.isFlagged ? 'text-destructive' : 'text-yellow-700'}`}>
              {antiCheatInfo.isFlagged ? 'Session Flagged — Suspicious Activity' : 'Anti-Cheat Alerts'}
            </span>
          </div>
          <div className="flex gap-4 text-xs text-muted-foreground">
            {antiCheatInfo.tabSwitchCount > 0 && (
              <span>Tab switches: <strong>{antiCheatInfo.tabSwitchCount}</strong></span>
            )}
            {antiCheatInfo.fullscreenExits > 0 && (
              <span>Fullscreen exits: <strong>{antiCheatInfo.fullscreenExits}</strong></span>
            )}
            {antiCheatInfo.copyPasteAttempts > 0 && (
              <span>Copy/paste attempts: <strong>{antiCheatInfo.copyPasteAttempts}</strong></span>
            )}
          </div>
        </div>
      )}

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <Badge variant="outline">Q{currentIndex + 1} / {answers.length}</Badge>
            <Badge variant="secondary">{String(current.question.marks)} marks</Badge>
          </div>
          <CardTitle className="text-lg">{current.question.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md border bg-muted/50 p-3">
            <Label className="text-xs text-muted-foreground">Student Answer</Label>
            <p className="mt-1 whitespace-pre-wrap">{current.answer || 'No answer provided'}</p>
          </div>

          {current.question.correctAnswer && (
            <div className="rounded-md border border-green-200 bg-green-50 p-3">
              <Label className="text-xs text-green-700">Model Answer</Label>
              <p className="mt-1 whitespace-pre-wrap text-green-800">{current.question.correctAnswer}</p>
            </div>
          )}

          {current.answerGrade ? (
            <GradeDisplay
              grade={current.answerGrade}
              isPending={isPending}
              onApprove={() => handleApproveAi(current.answerGrade!.id)}
            />
          ) : (
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="space-y-1">
                  <Label>Marks</Label>
                  <Input
                    type="number"
                    min={0}
                    max={current.question.marks}
                    step="0.5"
                    value={marks[current.id] ?? ''}
                    onChange={(e) => setMarks((p) => ({ ...p, [current.id]: e.target.value }))}
                    className="w-24"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label>Feedback</Label>
                <Textarea
                  value={feedback[current.id] ?? ''}
                  onChange={(e) => setFeedback((p) => ({ ...p, [current.id]: e.target.value }))}
                  rows={2}
                  placeholder="Optional feedback..."
                />
              </div>
              <Button onClick={() => handleGrade(current.id)} disabled={isPending}>
                {isPending && <Spinner size="sm" className="mr-2" />}Grade Answer
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))} disabled={currentIndex === 0}>
          <ChevronLeft className="mr-1 h-4 w-4" />Prev
        </Button>
        <Button variant="outline" onClick={() => setCurrentIndex((i) => Math.min(answers.length - 1, i + 1))} disabled={currentIndex === answers.length - 1}>
          Next<ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

/* ─── Grade Display with AI indicator ─── */

function GradeDisplay({
  grade,
  isPending,
  onApprove,
}: {
  grade: NonNullable<Answer['answerGrade']>;
  isPending: boolean;
  onApprove: () => void;
}) {
  const isAi = grade.gradedBy === 'AI';
  const confidence = grade.aiConfidence != null ? Number(grade.aiConfidence) : null;

  const confidenceColor =
    confidence != null
      ? confidence >= 0.85
        ? 'text-green-600'
        : confidence >= 0.6
          ? 'text-yellow-600'
          : 'text-red-600'
      : '';

  return (
    <div className="space-y-2 rounded-md border p-3">
      <div className="flex items-center gap-2">
        {isAi ? (
          <Brain className="h-4 w-4 text-purple-500" />
        ) : (
          <CheckCircle className="h-4 w-4 text-green-600" />
        )}
        <span className="font-medium">
          {String(grade.marksAwarded)} marks
        </span>
        <Badge variant="outline" className="text-xs">
          {grade.gradedBy}
        </Badge>
        {confidence != null && (
          <span className={`text-xs ${confidenceColor}`}>
            {Math.round(confidence * 100)}% confidence
          </span>
        )}
        {isAi && grade.isReviewed && (
          <Badge variant="secondary" className="text-xs">
            <Shield className="mr-1 h-3 w-3" /> Reviewed
          </Badge>
        )}
      </div>

      {grade.feedback && (
        <p className="whitespace-pre-wrap text-sm text-muted-foreground">
          {grade.feedback}
        </p>
      )}

      {isAi && !grade.isReviewed && (
        <Button size="sm" variant="outline" onClick={onApprove} disabled={isPending}>
          {isPending ? <Spinner size="sm" className="mr-1" /> : <Shield className="mr-1 h-3.5 w-3.5" />}
          Approve AI Grade
        </Button>
      )}
    </div>
  );
}
