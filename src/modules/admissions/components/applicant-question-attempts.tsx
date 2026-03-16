'use client';

import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

type Attempt = {
  id: string;
  selectedOptionId?: string | null;
  answerText?: string | null;
  isMarkedForReview: boolean;
  answeredAt?: string | null;
  timeSpent?: number | null;
  campaignQuestion: {
    sectionLabel?: string | null;
    marks: number;
    question: {
      title: string;
      mcqOptions: Array<{
        id: string;
        label: string;
        text: string;
        isCorrect: boolean;
      }>;
    };
  };
  grade?: {
    marksAwarded: number;
    maxMarks: number;
    negativeMarks?: number;
  } | null;
};

type Props = {
  attempts: Attempt[];
};

export function ApplicantQuestionAttempts({ attempts }: Props) {
  if (attempts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium">Question-by-Question Review</h4>
      <div className="max-h-90 space-y-3 overflow-y-auto pr-1">
        {attempts.map((attempt, idx) => {
          const options = attempt.campaignQuestion.question.mcqOptions;
          const selected = options.find((opt) => opt.id === attempt.selectedOptionId) ?? null;
          const correct = options.find((opt) => opt.isCorrect) ?? null;
          const marksAwarded = Number(attempt.grade?.marksAwarded ?? 0);
          const maxMarks = Number(attempt.grade?.maxMarks ?? attempt.campaignQuestion.marks);
          const negativeMarks = Number(attempt.grade?.negativeMarks ?? 0);
          const isCorrect = !!selected && !!correct && selected.id === correct.id;

          return (
            <div key={attempt.id} className="rounded-md border p-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                  Q{idx + 1}
                </span>
                {attempt.campaignQuestion.sectionLabel && (
                  <Badge variant="outline" className="text-[10px]">
                    {attempt.campaignQuestion.sectionLabel}
                  </Badge>
                )}
                <Badge variant="outline" className="text-[10px]">
                  {marksAwarded}/{maxMarks}
                </Badge>
                {negativeMarks > 0 && (
                  <Badge variant="outline" className="border-red-200 bg-red-50 text-[10px] text-red-700">
                    -{negativeMarks}
                  </Badge>
                )}
                {attempt.isMarkedForReview && (
                  <Badge variant="outline" className="border-amber-200 bg-amber-50 text-[10px] text-amber-700">
                    Marked for review
                  </Badge>
                )}
              </div>

              <p className="mt-2 text-sm font-medium leading-snug">
                {attempt.campaignQuestion.question.title}
              </p>

              <Separator className="my-2" />

              <div className="space-y-1 text-xs">
                <div>
                  <span className="text-muted-foreground">Selected:</span>{' '}
                  {selected ? (
                    <span className={isCorrect ? 'text-green-700' : 'text-red-700'}>
                      {selected.label}. {selected.text}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Not answered</span>
                  )}
                </div>
                <div>
                  <span className="text-muted-foreground">Correct:</span>{' '}
                  {correct ? `${correct.label}. ${correct.text}` : 'N/A'}
                </div>
                {attempt.answerText && (
                  <div>
                    <span className="text-muted-foreground">Written answer:</span>{' '}
                    {attempt.answerText}
                  </div>
                )}
                {attempt.timeSpent !== null && attempt.timeSpent !== undefined && (
                  <div>
                    <span className="text-muted-foreground">Time spent:</span>{' '}
                    {Math.floor(attempt.timeSpent / 60)}m {attempt.timeSpent % 60}s
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
