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
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Clock, Send } from 'lucide-react';
import type { SessionWithDetails } from '@/modules/sessions/session-queries';

type Props = { session: SessionWithDetails };

export function ExamTakingView({ session }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, { answer: string; optionId?: string | null }>>({});
  const [timeLeft, setTimeLeft] = useState(session.exam.duration * 60);

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

  // Timer
  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

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

  function handleSubmit() {
    startTransition(async () => {
      const result = await submitSessionAction(session.id);
      if (result.success) {
        toast.success('Exam submitted!');
        router.push('/student/exams');
      } else {
        toast.error(result.error ?? 'Failed');
      }
    });
  }

  if (!current) return null;

  const q = current.question;
  const currentAnswer = answers[current.id];

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between rounded-lg border bg-card p-3">
        <div>
          <h2 className="font-semibold">{session.exam.title}</h2>
          <p className="text-sm text-muted-foreground">
            {answeredCount}/{totalQuestions} answered
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-1 font-mono text-sm ${timeLeft < 300 ? 'text-destructive font-bold' : ''}`}>
            <Clock className="h-4 w-4" />{formatTime(timeLeft)}
          </div>
          <Button variant="destructive" size="sm" onClick={handleSubmit} disabled={isPending}>
            <Send className="mr-1 h-3.5 w-3.5" />Submit
          </Button>
        </div>
      </div>

      <Progress value={(answeredCount / totalQuestions) * 100} />

      {/* Question Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <Badge variant="outline">Q{currentIndex + 1} / {totalQuestions}</Badge>
            <Badge variant="secondary">{String(current.marks)} marks</Badge>
          </div>
          <CardTitle className="text-lg">{q.title}</CardTitle>
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
                <label key={opt.id} className="flex items-center gap-3 rounded-md border p-3 cursor-pointer hover:bg-accent">
                  <RadioGroupItem value={opt.id} />
                  <span>{opt.text}</span>
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
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))} disabled={currentIndex === 0}>
          <ChevronLeft className="mr-1 h-4 w-4" />Prev
        </Button>
        <div className="flex gap-1 overflow-hidden">
          {questions.map((eq, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`h-7 w-7 rounded text-xs font-medium transition-colors ${
                i === currentIndex ? 'bg-primary text-primary-foreground' :
                answers[eq.id] ? 'bg-green-100 text-green-800' : 'bg-muted'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
        <Button variant="outline" onClick={() => setCurrentIndex((i) => Math.min(totalQuestions - 1, i + 1))} disabled={currentIndex === totalQuestions - 1}>
          Next<ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
