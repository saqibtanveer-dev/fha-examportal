'use client';

import { memo, useCallback, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp, MessageSquare } from 'lucide-react';
import type { DeepSerialize } from '@/utils/serialize';
import type { WrittenExamQuestion } from '@/modules/written-exams/written-exam-queries';

type Question = DeepSerialize<WrittenExamQuestion>;

type Props = {
  index: number;
  question: Question;
  marks: number | null;
  feedback: string;
  onChange: (examQuestionId: string, marks: number | null, feedback?: string) => void;
  disabled: boolean;
};

export const QuestionMarkInput = memo(function QuestionMarkInput({
  index,
  question,
  marks,
  feedback,
  onChange,
  disabled,
}: Props) {
  const [showFeedback, setShowFeedback] = useState(!!feedback);

  const handleMarksChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      if (val === '') {
        onChange(question.examQuestionId, null);
        return;
      }
      const num = parseFloat(val);
      if (isNaN(num) || num < 0 || num > question.marks) return;
      onChange(question.examQuestionId, num);
    },
    [question.examQuestionId, question.marks, onChange],
  );

  const handleFeedbackChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange(question.examQuestionId, marks, e.target.value);
    },
    [question.examQuestionId, marks, onChange],
  );

  const isFilled = marks !== null;
  const isFullMarks = marks === question.marks;

  return (
    <div
      className={cn(
        'rounded-lg border transition-colors',
        isFilled && isFullMarks && 'border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/30',
        isFilled && !isFullMarks && 'border-border bg-background',
        !isFilled && 'border-dashed border-muted-foreground/30',
      )}
    >
      {/* Question row */}
      <div className="flex items-center gap-3 p-3 sm:p-4">
        {/* Question number badge */}
        <span
          className={cn(
            'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold',
            isFilled
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground',
          )}
        >
          {index}
        </span>

        {/* Question title */}
        <p className="min-w-0 flex-1 text-sm font-medium leading-snug line-clamp-2">
          {question.question.title}
        </p>

        {/* Marks input + max display */}
        <div className="flex shrink-0 items-center gap-1.5">
          <Input
            type="number"
            inputMode="decimal"
            min={0}
            max={question.marks}
            step="any"
            value={marks ?? ''}
            onChange={handleMarksChange}
            disabled={disabled}
            className="h-9 w-16 text-center tabular-nums sm:w-20"
            placeholder="—"
          />
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            / {question.marks}
          </span>
        </div>
      </div>

      {/* Feedback toggle + area */}
      {!disabled && (
        <div className="border-t border-dashed px-3 sm:px-4">
          <button
            type="button"
            onClick={() => setShowFeedback((v) => !v)}
            className="flex w-full items-center gap-1.5 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <MessageSquare className="h-3 w-3" />
            <span>{feedback ? 'Edit feedback' : 'Add feedback'}</span>
            {showFeedback ? <ChevronUp className="ml-auto h-3 w-3" /> : <ChevronDown className="ml-auto h-3 w-3" />}
          </button>
          {showFeedback && (
            <Textarea
              value={feedback}
              onChange={handleFeedbackChange}
              placeholder="Optional feedback for this question..."
              className="mb-3 min-h-16 text-sm"
              rows={2}
            />
          )}
        </div>
      )}

      {/* Read-only feedback display when finalized */}
      {disabled && feedback && (
        <div className="border-t border-dashed px-3 py-2 sm:px-4">
          <p className="text-xs text-muted-foreground">
            <MessageSquare className="mr-1 inline h-3 w-3" />
            {feedback}
          </p>
        </div>
      )}
    </div>
  );
});
