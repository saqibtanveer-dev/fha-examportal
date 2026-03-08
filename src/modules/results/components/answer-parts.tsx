'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/utils/cn';
import { CheckCircle2, XCircle, BookOpen } from 'lucide-react';
import type { AnswerDetail } from '@/modules/results/result-queries';

export function McqAnswer({ answer }: { answer: AnswerDetail }) {
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
                'flex items-start gap-3 rounded-lg border p-3 text-sm transition-colors',
                borderClass,
                bgClass,
              )}
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold mt-0.5">
                {opt.label}
              </span>
              <span className="min-w-0 flex-1 wrap-break-word">{opt.text}</span>
              <div className="flex shrink-0 items-center gap-2">
                {icon}
                {isSelected && (
                  <Badge variant="outline" className="shrink-0 text-xs">
                    Your answer
                  </Badge>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function WrittenAnswer({ answer }: { answer: AnswerDetail }) {
  return (
    <div className="space-y-3">
      <div>
        <p className="mb-1 text-sm font-medium text-muted-foreground">Your Answer:</p>
        <div className="rounded-lg border bg-muted/50 p-3 text-sm whitespace-pre-wrap wrap-break-word overflow-hidden">
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
          <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-3 text-sm whitespace-pre-wrap wrap-break-word overflow-hidden dark:border-blue-900 dark:bg-blue-950/20">
            {answer.modelAnswer}
          </div>
        </div>
      )}
    </div>
  );
}
