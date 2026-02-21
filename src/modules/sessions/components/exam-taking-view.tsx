'use client';

import { useState, useEffect, useCallback, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Spinner } from '@/components/shared';
import { submitAnswerAction, submitSessionAction } from '@/modules/sessions/session-actions';
import { useAntiCheat } from '@/modules/sessions/hooks/use-anti-cheat';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Flag, ChevronLeft, ChevronRight, Clock, Send, ShieldAlert } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import type { SessionWithDetails } from '@/modules/sessions/session-queries';
import type { DeepSerialize } from '@/utils/serialize';

type Props = { session: DeepSerialize<SessionWithDetails> };

export function ExamTakingView({ session }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, { answer: string; optionId?: string | null }>>({});
  const [markedForReview, setMarkedForReview] = useState<Set<string>>(new Set());
  const [timeLeft, setTimeLeft] = useState(session.exam.duration * 60);
  const [violationWarning, setViolationWarning] = useState('');

  // Anti-cheating measures
  useAntiCheat({
    sessionId: session.id,
    enabled: true,
    onViolation: (type, count) => {
      if (type === 'TAB_SWITCH') {
        setViolationWarning(`Warning: Tab switch detected (${count}). This is being recorded.`);
        toast.warning(`Tab switch detected (${count}x). Activity is monitored.`);
      } else if (type === 'COPY_PASTE') {
        toast.warning('Copy/paste is not allowed during the exam.');
      }
      setTimeout(() => setViolationWarning(''), 5000);
    },
  });

  const questions = session.exam.examQuestions;
  const current = questions[currentIndex];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;

  // Initialize from saved answers
  useEffect(() => {
    const saved: Record<string, { answer: string; optionId?: string | null }> = {};
    for (const sa of session.studentAnswers) {
      saved[sa.examQuestionId] = { answer: sa.answerText ?? '', optionId: sa.selectedOptionId };
    }
    setAnswers(saved);
  }, [session.studentAnswers]);

  // Timer - auto-submit when time runs out
  const handleSubmitRef = useCallback(() => {
    startTransition(async () => {
      const result = await submitSessionAction(session.id);
      if (result.success) {
        toast.success('Exam submitted!');
        router.push('/student/exams');
      } else {
        toast.error(result.error ?? 'Failed');
      }
    });
  }, [session.id, router]);

  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmitRef();
      return;
    }
    const interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timeLeft, handleSubmitRef]);

  const formatTime = useCallback((s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  }, []);

  function saveAnswer(examQuestionId: string, questionId: string, answer: string, optionId?: string | null) {
    setAnswers((prev) => ({ ...prev, [examQuestionId]: { answer, optionId } }));
    startTransition(async () => {
      await submitAnswerAction(session.id, questionId, answer, optionId);
    });
  }

  function toggleReview(examQuestionId: string) {
    setMarkedForReview((prev) => {
      const next = new Set(prev);
      if (next.has(examQuestionId)) next.delete(examQuestionId);
      else next.add(examQuestionId);
      return next;
    });
  }

  function handleSubmit() {
    handleSubmitRef();
  }

  if (!current) return null;

  const q = current.question;
  const currentAnswer = answers[current.id];

  return (
    <div className="mx-auto max-w-3xl space-y-4 px-1">
      {/* Header */}
      <div className="flex flex-col gap-2 rounded-lg border bg-card p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="truncate font-semibold">{session.exam.title}</h2>
          <p className="text-sm text-muted-foreground">
            {answeredCount}/{totalQuestions} answered
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className={`flex items-center gap-1 font-mono text-sm ${timeLeft < 300 ? 'text-destructive font-bold' : ''}`}>
            <Clock className="h-4 w-4" />{formatTime(timeLeft)}
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" disabled={isPending}>
                <Send className="mr-1 h-3.5 w-3.5" />Submit
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Submit Exam?</AlertDialogTitle>
                <AlertDialogDescription>
                  You answered {answeredCount} of {totalQuestions} questions.
                  {markedForReview.size > 0 && ` ${markedForReview.size} marked for review.`}
                  {' '}This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Continue Exam</AlertDialogCancel>
                <AlertDialogAction onClick={handleSubmit}>Submit Now</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Anti-cheat warning */}
      {violationWarning && (
        <div className="flex items-center gap-2 rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          {violationWarning}
        </div>
      )}

      <Progress value={(answeredCount / totalQuestions) * 100} />

      {/* Question Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline">Q{currentIndex + 1} / {totalQuestions}</Badge>
              {markedForReview.has(current.id) && (
                <Badge variant="secondary" className="bg-amber-100 text-amber-800">Flagged</Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleReview(current.id)}
                className={markedForReview.has(current.id) ? 'text-amber-600' : ''}
              >
                <Flag className="mr-1 h-3.5 w-3.5" />
                {markedForReview.has(current.id) ? 'Unflag' : 'Flag for Review'}
              </Button>
              <Badge variant="secondary">{String(current.marks)} marks</Badge>
            </div>
          </div>
          <CardTitle className="text-lg wrap-break-word">{q.title}</CardTitle>
        </CardHeader>
        <CardContent>
          {q.type === 'MCQ' && q.mcqOptions.length > 0 && (
            <RadioGroup
              value={currentAnswer?.optionId ?? ''}
              onValueChange={(optId) => {
                const opt = q.mcqOptions.find((o) => o.id === optId);
                saveAnswer(current.id, q.id, opt?.text ?? '', optId);
              }}
              className="space-y-2"
            >
              {q.mcqOptions.map((opt) => (
                <label key={opt.id} className="flex items-start gap-3 rounded-md border p-3 cursor-pointer hover:bg-accent">
                  <RadioGroupItem value={opt.id} className="mt-0.5 shrink-0" />
                  <span className="min-w-0 wrap-break-word">{opt.text}</span>
                </label>
              ))}
            </RadioGroup>
          )}
          {(q.type === 'SHORT_ANSWER' || q.type === 'LONG_ANSWER') && (
            <Textarea
              value={currentAnswer?.answer ?? ''}
              onChange={(e) => setAnswers((p) => ({ ...p, [current.id]: { answer: e.target.value } }))}
              onBlur={() => {
                if (currentAnswer?.answer) saveAnswer(current.id, q.id, currentAnswer.answer);
              }}
              rows={q.type === 'LONG_ANSWER' ? 8 : 3}
              placeholder="Type your answer..."
            />
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-2">
        <Button variant="outline" size="sm" className="shrink-0" onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))} disabled={currentIndex === 0}>
          <ChevronLeft className="mr-1 h-4 w-4" />Prev
        </Button>
        <div className="flex flex-wrap justify-center gap-1 overflow-y-auto max-h-20">
          {questions.map((eq, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              aria-label={`Question ${i + 1}`}
              className={`h-8 w-8 rounded text-xs font-medium transition-colors ${
                i === currentIndex ? 'bg-primary text-primary-foreground' :
                markedForReview.has(eq.id) ? 'bg-amber-100 text-amber-800 ring-1 ring-amber-300' :
                answers[eq.id] ? 'bg-green-100 text-green-800' : 'bg-muted'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
        <Button variant="outline" size="sm" className="shrink-0" onClick={() => setCurrentIndex((i) => Math.min(totalQuestions - 1, i + 1))} disabled={currentIndex === totalQuestions - 1}>
          Next<ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
