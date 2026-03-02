import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Send } from 'lucide-react';
import type { Question, AnswerState } from './test-taking-types';

type Props = {
  question: Question;
  questionIndex: number;
  totalQuestions: number;
  answer: AnswerState[string] | undefined;
  onUpdateAnswer: (
    cqId: string,
    update: Partial<{ selectedOptionId: string; answerText: string }>,
  ) => void;
  onPrev: () => void;
  onNext: () => void;
  onSubmit: () => void;
};

export function QuestionContent({
  question,
  questionIndex,
  totalQuestions,
  answer,
  onUpdateAnswer,
  onPrev,
  onNext,
  onSubmit,
}: Props) {
  const isFirst = questionIndex === 0;
  const isLast = questionIndex === totalQuestions - 1;

  return (
    <div className="flex-1 p-4 md:p-6">
      <div className="mx-auto max-w-2xl">
        {/* Question header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline">Q{questionIndex + 1}</Badge>
            {question.sectionLabel && (
              <Badge variant="secondary">{question.sectionLabel}</Badge>
            )}
            <span className="text-sm text-muted-foreground">
              {question.marks} marks
            </span>
          </div>
          {question.isRequired && (
            <span className="text-xs text-red-500">Required</span>
          )}
        </div>

        {/* Question text */}
        <Card className="mb-6">
          <CardContent className="py-4">
            <p className="text-base font-medium leading-relaxed whitespace-pre-wrap">
              {question.title}
            </p>
            {question.description && (
              <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">
                {question.description}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Answer area */}
        {question.type === 'MCQ' && question.options.length > 0 ? (
          <McqOptions
            options={question.options}
            selectedId={answer?.selectedOptionId}
            onSelect={(id) =>
              onUpdateAnswer(question.campaignQuestionId, { selectedOptionId: id })
            }
          />
        ) : (
          <Textarea
            placeholder="Type your answer here..."
            rows={6}
            value={answer?.answerText ?? ''}
            onChange={(e) =>
              onUpdateAnswer(question.campaignQuestionId, {
                answerText: e.target.value,
              })
            }
          />
        )}

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-between">
          <Button variant="outline" onClick={onPrev} disabled={isFirst}>
            <ChevronLeft className="mr-1 h-4 w-4" />
            Previous
          </Button>

          <span className="text-sm text-muted-foreground md:hidden">
            {questionIndex + 1} / {totalQuestions}
          </span>

          {!isLast ? (
            <Button onClick={onNext}>
              Next
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button variant="destructive" onClick={onSubmit}>
              <Send className="mr-1 h-4 w-4" />
              Submit Test
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── MCQ Option List ─────────────────────────────────────────
type McqProps = {
  options: Question['options'];
  selectedId: string | undefined;
  onSelect: (id: string) => void;
};

function McqOptions({ options, selectedId, onSelect }: McqProps) {
  return (
    <RadioGroup
      value={selectedId ?? ''}
      onValueChange={onSelect}
      className="space-y-2"
    >
      {options.map((opt) => (
        <label
          key={opt.id}
          className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
            selectedId === opt.id
              ? 'border-primary bg-primary/5'
              : 'hover:border-muted-foreground/30'
          }`}
        >
          <RadioGroupItem value={opt.id} />
          <span className="text-sm">
            {opt.label && <span className="mr-2 font-medium">{opt.label}.</span>}
            {opt.text}
          </span>
        </label>
      ))}
    </RadioGroup>
  );
}
