import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Spinner } from '@/components/shared';
import { Trash2, Plus } from 'lucide-react';

export type ExamQuestion = {
  id: string;
  sortOrder: number;
  marks: string | number;
  question: {
    id: string;
    title: string;
    type: string;
    difficulty: string;
  };
};

export type AvailableQuestion = {
  id: string;
  title: string;
  type: string;
  difficulty: string;
  marks: string | number;
};

export type LoadingKey = `${'add' | 'remove'}:${string}`;

// ── Exam Questions Table ──────────────────────────────────────
export function ExamQuestionsTable({
  questions,
  isDraft,
  onRemove,
  loadingKeys,
  isAnyLoading,
}: {
  questions: ExamQuestion[];
  isDraft: boolean;
  onRemove: (id: string) => void;
  loadingKeys: Set<LoadingKey>;
  isAnyLoading: boolean;
}) {
  return (
    <>
      {/* ── Mobile Card View ── */}
      <div className="space-y-2 md:hidden">
        {questions.map((eq) => {
          const isRemoving = loadingKeys.has(`remove:${eq.question.id}`);
          return (
            <div key={eq.id} className={`rounded-lg border bg-card p-3 space-y-1.5 ${isRemoving ? 'opacity-50' : ''}`}>
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium line-clamp-2 flex-1">
                  {eq.sortOrder}. {eq.question.title}
                </p>
                {isDraft && (
                  <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" disabled={isRemoving || isAnyLoading} onClick={() => onRemove(eq.question.id)}>
                    {isRemoving ? <Spinner size="sm" /> : <Trash2 className="h-4 w-4 text-destructive" />}
                  </Button>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="outline" className="text-[10px]">{eq.question.type.replace('_', ' ')}</Badge>
                <Badge variant="outline" className="text-[10px]">{eq.question.difficulty}</Badge>
                <Badge variant="secondary" className="text-[10px] font-mono">{Number(eq.marks)}m</Badge>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Desktop Table View ── */}
      <div className="hidden md:block overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">#</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Difficulty</TableHead>
            <TableHead className="text-right">Marks</TableHead>
            {isDraft && <TableHead className="w-16" />}
          </TableRow>
        </TableHeader>
        <TableBody>
          {questions.map((eq) => {
            const isRemoving = loadingKeys.has(`remove:${eq.question.id}`);
            return (
              <TableRow key={eq.id} className={isRemoving ? 'opacity-50' : ''}>
                <TableCell className="font-medium">{eq.sortOrder}</TableCell>
                <TableCell className="max-w-xs">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="line-clamp-2 break-words text-sm">
                        {eq.question.title}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-sm">
                      <p className="whitespace-pre-wrap break-words">
                        {eq.question.title}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {eq.question.type.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{eq.question.difficulty}</Badge>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {Number(eq.marks)}
                </TableCell>
                {isDraft && (
                  <TableCell>
                    <Button
                      size="icon"
                      variant="ghost"
                      disabled={isRemoving || isAnyLoading}
                      onClick={() => onRemove(eq.question.id)}
                    >
                      {isRemoving ? (
                        <Spinner size="sm" />
                      ) : (
                        <Trash2 className="h-4 w-4 text-destructive" />
                      )}
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      </div>
    </>
  );
}

// ── Question Picker List ──────────────────────────────────────
export function QuestionPickerList({
  questions,
  onAdd,
  loadingKeys,
  isAnyLoading,
}: {
  questions: AvailableQuestion[];
  onAdd: (id: string) => void;
  loadingKeys: Set<LoadingKey>;
  isAnyLoading: boolean;
}) {
  if (questions.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-muted-foreground">
        No available questions match your search.
      </p>
    );
  }

  return (
    <div className="max-h-96 space-y-2 overflow-y-auto">
      {questions.map((q) => {
        const isAdding = loadingKeys.has(`add:${q.id}`);
        return (
          <div
            key={q.id}
            className="flex items-center justify-between gap-3 rounded-md border p-3"
          >
            <div className="min-w-0 flex-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <p className="line-clamp-2 break-words text-sm font-medium">
                    {q.title}
                  </p>
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-sm">
                  <p className="whitespace-pre-wrap break-words">{q.title}</p>
                </TooltipContent>
              </Tooltip>
              <div className="mt-1 flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {q.type.replace('_', ' ')}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {q.difficulty}
                </Badge>
                <Badge variant="secondary" className="text-xs font-semibold">
                  {Number(q.marks)}m
                </Badge>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              disabled={isAdding || isAnyLoading}
              onClick={() => onAdd(q.id)}
            >
              {isAdding ? <Spinner size="sm" /> : <Plus className="h-4 w-4" />}
            </Button>
          </div>
        );
      })}
    </div>
  );
}
