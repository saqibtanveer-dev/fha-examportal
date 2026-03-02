'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Spinner } from '@/components/shared';
import { Clock, Send, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTestSession } from './test-taking/use-test-session';
import { TestSubmittedView } from './test-taking/test-submitted-view';
import { QuestionNavigator } from './test-taking/question-navigator';
import { QuestionContent } from './test-taking/question-content';
import { SubmitConfirmDialog } from './test-taking/submit-confirm-dialog';
import type { TestTakingProps } from './test-taking/test-taking-types';

export function TestTakingInterface({ accessToken, campaignName, onAuthError }: TestTakingProps) {
  const {
    isPending,
    questions,
    answers,
    currentIndex,
    setCurrentIndex,
    remainingSeconds,
    isStarting,
    startError,
    isSubmitted,
    showSubmitConfirm,
    setShowSubmitConfirm,
    applicationNumber,
    updateAnswer,
    handleSubmitTest,
    formatTime,
  } = useTestSession(accessToken);

  if (isStarting) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Spinner />
          <p className="mt-4 text-muted-foreground">Loading test...</p>
        </div>
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
            {onAuthError && (
              <Button onClick={onAuthError} variant="outline">
                Try a different PIN
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isSubmitted) return <TestSubmittedView applicationNumber={applicationNumber} />;

  const currentQuestion = questions[currentIndex];
  if (!currentQuestion) return null;

  const answeredCount = Object.keys(answers).filter(
    (cqId) => answers[cqId]?.selectedOptionId || answers[cqId]?.answerText,
  ).length;
  const progressPercent = (answeredCount / questions.length) * 100;
  const isTimeLow = remainingSeconds !== null && remainingSeconds < 300;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Top bar */}
      <div className="sticky top-0 z-50 flex items-center justify-between border-b bg-white px-4 py-2 dark:bg-gray-950">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">{campaignName}</span>
          <Badge variant="outline">
            {answeredCount}/{questions.length} answered
          </Badge>
        </div>
        <div className="flex items-center gap-3">
          {remainingSeconds !== null && (
            <div
              className={`flex items-center gap-1 rounded-md px-3 py-1 text-sm font-mono font-bold ${
                isTimeLow ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-muted'
              }`}
            >
              <Clock className="h-4 w-4" />
              {formatTime(remainingSeconds)}
            </div>
          )}
          <Button
            size="sm"
            variant="destructive"
            onClick={() => setShowSubmitConfirm(true)}
          >
            <Send className="mr-1 h-3 w-3" />
            Submit
          </Button>
        </div>
      </div>

      <Progress value={progressPercent} className="h-1 rounded-none" />

      <div className="flex flex-1">
        <QuestionNavigator
          questions={questions}
          answers={answers}
          currentIndex={currentIndex}
          onSelect={setCurrentIndex}
        />
        <QuestionContent
          question={currentQuestion}
          questionIndex={currentIndex}
          totalQuestions={questions.length}
          answer={answers[currentQuestion.campaignQuestionId]}
          onUpdateAnswer={updateAnswer}
          onPrev={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          onNext={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))}
          onSubmit={() => setShowSubmitConfirm(true)}
        />
      </div>

      <SubmitConfirmDialog
        open={showSubmitConfirm}
        onOpenChange={setShowSubmitConfirm}
        answeredCount={answeredCount}
        totalQuestions={questions.length}
        isPending={isPending}
        onConfirm={handleSubmitTest}
      />
    </div>
  );
}
