'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Spinner } from '@/components/shared';
import { Clock, Send, AlertCircle, ShieldAlert, ChevronLeft, ChevronRight, Flag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useTestSession } from './test-taking/use-test-session';
import { TestSubmittedView } from './test-taking/test-submitted-view';
import type { TestTakingProps } from './test-taking/test-taking-types';

export function TestTakingInterface({ accessToken, campaignName, onAuthError }: TestTakingProps) {
  const {
    isPending, questions, answers, currentIndex, setCurrentIndex,
    remainingSeconds, isStarting, startError, isSubmitted,
    applicationNumber, markedForReview, violationWarning,
    updateAnswer, toggleReview, handleSubmitTest, formatTime,
  } = useTestSession(accessToken);

  if (isStarting) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center"><Spinner /><p className="mt-4 text-muted-foreground">Loading test...</p></div>
      </div>
    );
  }

  if (startError) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="max-w-md text-center">
          <CardHeader>
            <AlertCircle className="mx-auto mb-2 h-12 w-12 text-destructive" />
            <CardTitle>Unable to Start Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">{startError}</p>
            {onAuthError && <Button onClick={onAuthError} variant="outline">Try a different PIN</Button>}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isSubmitted) return <TestSubmittedView applicationNumber={applicationNumber} />;

  const current = questions[currentIndex];
  if (!current) return null;

  const answeredCount = Object.keys(answers).filter(
    (cqId) => answers[cqId]?.selectedOptionId || answers[cqId]?.answerText,
  ).length;
  const totalQuestions = questions.length;
  const isTimeLow = remainingSeconds !== null && remainingSeconds < 300;
  const currentAnswer = answers[current.campaignQuestionId];

  return (
    <div className="mx-auto max-w-3xl space-y-4 px-1 py-4">
      {/* Header — mirrors exam */}
      <div className="flex flex-col gap-2 rounded-lg border bg-card p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="truncate font-semibold">{campaignName}</h2>
          <p className="text-sm text-muted-foreground">{answeredCount}/{totalQuestions} answered</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {remainingSeconds !== null && (
            <div className={`flex items-center gap-1 font-mono text-sm ${isTimeLow ? 'text-destructive font-bold' : ''}`}>
              <Clock className="h-4 w-4" />{formatTime(remainingSeconds)}
            </div>
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" disabled={isPending}>
                <Send className="mr-1 h-3.5 w-3.5" />Submit
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Submit Test?</AlertDialogTitle>
                <AlertDialogDescription>
                  You answered {answeredCount} of {totalQuestions} questions.
                  {markedForReview.size > 0 && ` ${markedForReview.size} marked for review.`}
                  {' '}This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Continue Test</AlertDialogCancel>
                <AlertDialogAction onClick={handleSubmitTest}>Submit Now</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Anti-cheat warning */}
      {violationWarning && (
        <div className="flex items-center gap-2 rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <ShieldAlert className="h-4 w-4 shrink-0" />{violationWarning}
        </div>
      )}

      <Progress value={(answeredCount / totalQuestions) * 100} />

      {/* Question Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline">Q{currentIndex + 1} / {totalQuestions}</Badge>
              {markedForReview.has(current.campaignQuestionId) && (
                <Badge variant="secondary" className="bg-amber-100 text-amber-800">Flagged</Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost" size="sm"
                onClick={() => toggleReview(current.campaignQuestionId)}
                className={markedForReview.has(current.campaignQuestionId) ? 'text-amber-600' : ''}
              >
                <Flag className="mr-1 h-3.5 w-3.5" />
                {markedForReview.has(current.campaignQuestionId) ? 'Unflag' : 'Flag for Review'}
              </Button>
              <Badge variant="secondary">{current.marks} marks</Badge>
            </div>
          </div>
          <CardTitle className="text-lg wrap-break-word">{current.title}</CardTitle>
          {current.description && (
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{current.description}</p>
          )}
        </CardHeader>
        <CardContent>
          {current.type === 'MCQ' && current.options.length > 0 && (
            <RadioGroup
              value={currentAnswer?.selectedOptionId ?? ''}
              onValueChange={(optId) => {
                updateAnswer(current.campaignQuestionId, { selectedOptionId: optId });
              }}
              className="space-y-2"
            >
              {current.options.map((opt) => (
                <label key={opt.id} className="flex items-start gap-3 rounded-md border p-3 cursor-pointer hover:bg-accent">
                  <RadioGroupItem value={opt.id} className="mt-0.5 shrink-0" />
                  <span className="min-w-0 wrap-break-word">{opt.text}</span>
                </label>
              ))}
            </RadioGroup>
          )}
        </CardContent>
      </Card>

      {/* Navigation — mirrors exam bottom nav */}
      <div className="flex items-center justify-between gap-2">
        <Button variant="outline" size="sm" className="shrink-0" onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))} disabled={currentIndex === 0}>
          <ChevronLeft className="mr-1 h-4 w-4" />Prev
        </Button>
        <div className="flex flex-wrap justify-center gap-1 overflow-y-auto max-h-20">
          {questions.map((q, i) => (
            <button
              key={q.campaignQuestionId}
              onClick={() => setCurrentIndex(i)}
              aria-label={`Question ${i + 1}`}
              className={`h-8 w-8 rounded text-xs font-medium transition-colors ${
                i === currentIndex ? 'bg-primary text-primary-foreground' :
                markedForReview.has(q.campaignQuestionId) ? 'bg-amber-100 text-amber-800 ring-1 ring-amber-300' :
                answers[q.campaignQuestionId]?.selectedOptionId ? 'bg-green-100 text-green-800' : 'bg-muted'
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
