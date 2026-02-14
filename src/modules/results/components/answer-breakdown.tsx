'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/utils/cn';
import {
  CheckCircle2,
  XCircle,
  MinusCircle,
  MessageSquareText,
  Lightbulb,
  BookOpen,
} from 'lucide-react';
import type { AnswerDetail, AiGradeInfo } from '@/modules/results/result-queries';

// ============================================
// MCQ Answer Display
// ============================================

function McqAnswer({ answer }: { answer: AnswerDetail }) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-muted-foreground">Options:</p>
      <div className="space-y-1.5">
        {answer.mcqOptions.map((opt) => {
          const isSelected = opt.id === answer.selectedOptionId;
          const isCorrect = opt.isCorrect;

          let borderClass = 'border-border';
          let bgClass = '';
          let icon = null;

          if (isCorrect && isSelected) {
            borderClass = 'border-green-500';
            bgClass = 'bg-green-50 dark:bg-green-950/30';
            icon = <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />;
          } else if (isCorrect) {
            borderClass = 'border-green-400';
            bgClass = 'bg-green-50/50 dark:bg-green-950/20';
            icon = <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />;
          } else if (isSelected) {
            borderClass = 'border-red-500';
            bgClass = 'bg-red-50 dark:bg-red-950/30';
            icon = <XCircle className="h-4 w-4 shrink-0 text-red-600" />;
          }

          return (
            <div
              key={opt.id}
              className={cn(
                'flex items-center gap-3 rounded-lg border p-3 text-sm transition-colors',
                borderClass,
                bgClass,
              )}
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold">
                {opt.label}
              </span>
              <span className="flex-1">{opt.text}</span>
              {icon}
              {isSelected && (
                <Badge variant="outline" className="shrink-0 text-xs">
                  Your answer
                </Badge>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================
// Written Answer Display (SHORT / LONG)
// ============================================

function WrittenAnswer({ answer }: { answer: AnswerDetail }) {
  return (
    <div className="space-y-3">
      <div>
        <p className="mb-1 text-sm font-medium text-muted-foreground">Your Answer:</p>
        <div className="rounded-lg border bg-muted/50 p-3 text-sm whitespace-pre-wrap">
          {answer.answerText || (
            <span className="italic text-muted-foreground">No answer submitted</span>
          )}
        </div>
      </div>

      {answer.modelAnswer && (
        <div>
          <p className="mb-1 flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
            <BookOpen className="h-3.5 w-3.5" /> Model Answer:
          </p>
          <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-3 text-sm whitespace-pre-wrap dark:border-blue-900 dark:bg-blue-950/20">
            {answer.modelAnswer}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// Grade & Feedback Display
// ============================================

function GradeDisplay({
  answer,
  aiInfo,
}: {
  answer: AnswerDetail;
  aiInfo?: AiGradeInfo;
}) {
  if (!answer.grade) {
    return (
      <Badge variant="outline" className="text-muted-foreground">
        <MinusCircle className="mr-1 h-3 w-3" /> Not graded
      </Badge>
    );
  }

  const g = answer.grade;

  return (
    <div className="space-y-2">
      {/* Marks */}
      <div className="flex flex-wrap items-center gap-2">
        <Badge
          variant={g.isCorrect ? 'default' : g.marksAwarded > 0 ? 'secondary' : 'destructive'}
          className="text-sm"
        >
          {g.marksAwarded} / {g.maxMarks}
        </Badge>
        <span className="text-xs text-muted-foreground">
          Graded by {g.gradedBy === 'SYSTEM' ? 'Auto-grader' : g.gradedBy === 'AI' ? 'AI' : 'Teacher'}
        </span>
      </div>

      {/* Teacher/AI feedback */}
      {g.feedback && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50/50 p-3 text-sm dark:border-amber-900 dark:bg-amber-950/20">
          <MessageSquareText className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <p className="whitespace-pre-wrap">{g.feedback}</p>
        </div>
      )}

      {/* AI Confidence — TEACHER ONLY (aiInfo is only passed from teacher view) */}
      {aiInfo && aiInfo.aiConfidence != null && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>AI Confidence: {(aiInfo.aiConfidence * 100).toFixed(0)}%</span>
          {aiInfo.aiModelUsed && <span>• Model: {aiInfo.aiModelUsed}</span>}
          {aiInfo.isReviewed && (
            <Badge variant="outline" className="text-xs">Reviewed</Badge>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================
// Single Question Card
// ============================================

function QuestionCard({
  answer,
  aiInfo,
}: {
  answer: AnswerDetail;
  aiInfo?: AiGradeInfo;
}) {
  const isCorrect = answer.grade?.isCorrect ?? false;
  const isPartial =
    answer.grade && !isCorrect && answer.grade.marksAwarded > 0;
  const isWrong = answer.grade && !isCorrect && answer.grade.marksAwarded === 0;
  const notGraded = !answer.grade;

  let statusColor = 'border-l-border';
  if (isCorrect) statusColor = 'border-l-green-500';
  else if (isPartial) statusColor = 'border-l-amber-500';
  else if (isWrong) statusColor = 'border-l-red-500';
  else if (notGraded) statusColor = 'border-l-muted-foreground';

  return (
    <Card className={cn('border-l-4', statusColor)}>
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="text-xs">
                Q{answer.questionNumber}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {answer.questionType.replace('_', ' ')}
              </Badge>
            </div>
            <CardTitle className="text-base font-medium leading-snug">
              {answer.questionTitle}
            </CardTitle>
          </div>
          <div className="sm:shrink-0 sm:text-right">
            <GradeDisplay answer={answer} aiInfo={aiInfo} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Answer content based on type */}
        {answer.questionType === 'MCQ' ? (
          <McqAnswer answer={answer} />
        ) : (
          <WrittenAnswer answer={answer} />
        )}

        {/* Explanation */}
        {answer.explanation && (
          <div className="flex items-start gap-2 rounded-lg border border-indigo-200 bg-indigo-50/50 p-3 text-sm dark:border-indigo-900 dark:bg-indigo-950/20">
            <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" />
            <div>
              <p className="mb-0.5 font-medium text-indigo-700 dark:text-indigo-300">
                Explanation
              </p>
              <p className="whitespace-pre-wrap text-muted-foreground">{answer.explanation}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================
// Full Answer Breakdown (exported)
// ============================================

type Props = {
  answers: AnswerDetail[];
  /** Only provided in teacher view — maps answer ID → AI info */
  aiGradeMap?: Record<string, AiGradeInfo>;
};

export function AnswerBreakdown({ answers, aiGradeMap }: Props) {
  if (answers.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Answer review is not available for this exam.
        </CardContent>
      </Card>
    );
  }

  // Summary stats
  const total = answers.length;
  const graded = answers.filter((a) => a.grade).length;
  const correct = answers.filter((a) => a.grade?.isCorrect).length;
  const partial = answers.filter(
    (a) => a.grade && !a.grade.isCorrect && a.grade.marksAwarded > 0,
  ).length;
  const wrong = answers.filter(
    (a) => a.grade && !a.grade.isCorrect && a.grade.marksAwarded === 0,
  ).length;
  const unanswered = answers.filter(
    (a) => !a.answerText && !a.selectedOptionId,
  ).length;

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <div className="flex flex-wrap items-center gap-3">
        <Badge variant="outline" className="gap-1">
          <CheckCircle2 className="h-3 w-3 text-green-600" /> {correct} correct
        </Badge>
        {partial > 0 && (
          <Badge variant="outline" className="gap-1">
            <MinusCircle className="h-3 w-3 text-amber-600" /> {partial} partial
          </Badge>
        )}
        <Badge variant="outline" className="gap-1">
          <XCircle className="h-3 w-3 text-red-600" /> {wrong} wrong
        </Badge>
        {unanswered > 0 && (
          <Badge variant="outline" className="gap-1 text-muted-foreground">
            {unanswered} unanswered
          </Badge>
        )}
        {graded < total && (
          <Badge variant="outline" className="gap-1 text-muted-foreground">
            {total - graded} pending grading
          </Badge>
        )}
      </div>

      {/* Question cards */}
      <div className="space-y-4">
        {answers.map((answer) => (
          <QuestionCard
            key={answer.id}
            answer={answer}
            aiInfo={aiGradeMap?.[answer.id]}
          />
        ))}
      </div>
    </div>
  );
}
