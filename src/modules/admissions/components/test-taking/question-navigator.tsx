import type { Question, AnswerState } from './test-taking-types';

type Props = {
  questions: Question[];
  answers: AnswerState;
  currentIndex: number;
  onSelect: (index: number) => void;
};

export function QuestionNavigator({
  questions,
  answers,
  currentIndex,
  onSelect,
}: Props) {
  return (
    <div className="hidden w-60 shrink-0 border-r bg-muted/30 p-3 md:block">
      <p className="mb-2 text-xs font-medium text-muted-foreground">Questions</p>
      <div className="grid grid-cols-5 gap-1.5">
        {questions.map((q, i) => {
          const a = answers[q.campaignQuestionId];
          const isAnswered = !!(a?.selectedOptionId || a?.answerText);
          const isCurrent = i === currentIndex;
          return (
            <button
              key={q.campaignQuestionId}
              onClick={() => onSelect(i)}
              className={`flex h-8 w-8 items-center justify-center rounded-md text-xs font-medium transition-colors ${
                isCurrent
                  ? 'bg-primary text-primary-foreground'
                  : isAnswered
                    ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                    : 'bg-white hover:bg-muted dark:bg-gray-900'
              }`}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
      <Legend />
    </div>
  );
}

function Legend() {
  return (
    <div className="mt-4 space-y-1 text-xs text-muted-foreground">
      <div className="flex items-center gap-2">
        <div className="h-3 w-3 rounded-sm bg-green-100" /> Answered
      </div>
      <div className="flex items-center gap-2">
        <div className="h-3 w-3 rounded-sm border bg-white" /> Not answered
      </div>
      <div className="flex items-center gap-2">
        <div className="h-3 w-3 rounded-sm bg-primary" /> Current
      </div>
    </div>
  );
}
