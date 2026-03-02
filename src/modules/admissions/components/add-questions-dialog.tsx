'use client';

import { useState, useMemo, useTransition } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Spinner } from '@/components/shared';
import { Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { fetchQuestionsForPickerAction } from '@/modules/questions/question-fetch-actions';
import { addQuestionsToCampaignAction } from '../admission-actions';
import { useInvalidateCache } from '@/lib/cache-utils';

type PickerQuestion = {
  id: string;
  title: string;
  type: string;
  difficulty: string;
  marks: number;
  class: { id: string; name: string } | null;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignId: string;
  existingQuestionIds: string[];
};

export function AddQuestionsToCampaignDialog({
  open,
  onOpenChange,
  campaignId,
  existingQuestionIds,
}: Props) {
  const invalidate = useInvalidateCache();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Map<string, PickerQuestion>>(new Map());

  const { data: rawQuestions, isLoading } = useQuery({
    queryKey: queryKeys.questions.picker(undefined),
    queryFn: () => fetchQuestionsForPickerAction(),
    enabled: open,
  });

  const questions = useMemo(() => {
    const all = (rawQuestions as PickerQuestion[] | undefined) ?? [];
    return all.filter((q) => !existingQuestionIds.includes(q.id));
  }, [rawQuestions, existingQuestionIds]);

  const filtered = useMemo(() => {
    if (!search.trim()) return questions;
    const term = search.toLowerCase();
    return questions.filter(
      (q) =>
        q.title.toLowerCase().includes(term) ||
        q.type.toLowerCase().includes(term) ||
        q.difficulty.toLowerCase().includes(term),
    );
  }, [questions, search]);

  function toggleSelect(q: PickerQuestion) {
    setSelected((prev) => {
      const next = new Map(prev);
      if (next.has(q.id)) {
        next.delete(q.id);
      } else {
        next.set(q.id, q);
      }
      return next;
    });
  }

  function toggleSelectAll() {
    if (selected.size === filtered.length) {
      setSelected(new Map());
    } else {
      setSelected(new Map(filtered.map((q) => [q.id, q])));
    }
  }

  function handleAdd() {
    if (selected.size === 0) return;
    startTransition(async () => {
      const questionsPayload = Array.from(selected.values()).map((q, i) => ({
        questionId: q.id,
        sortOrder: existingQuestionIds.length + i + 1,
        marks: q.marks,
        isRequired: true,
      }));

      const result = await addQuestionsToCampaignAction({
        campaignId,
        questions: questionsPayload,
      });

      if (result.success) {
        toast.success(`${selected.size} question(s) added`);
        invalidate.campaigns();
        setSelected(new Map());
        setSearch('');
        onOpenChange(false);
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleClose(open: boolean) {
    if (!open) {
      setSelected(new Map());
      setSearch('');
    }
    onOpenChange(open);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Questions to Campaign</DialogTitle>
          <DialogDescription>
            Select questions from the question bank. Already-added questions are excluded.
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by title, type, or difficulty..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            {questions.length === 0
              ? 'No questions in question bank. Create questions first.'
              : 'No questions match your search.'}
          </p>
        ) : (
          <QuestionPickerList
            questions={filtered}
            selected={selected}
            onToggle={toggleSelect}
            onToggleAll={toggleSelectAll}
          />
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleAdd} disabled={isPending || selected.size === 0}>
            {isPending ? <Spinner className="mr-2" /> : null}
            Add {selected.size > 0 ? `(${selected.size})` : ''} Questions
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Extracted list component for clarity ──────────────────────────

type ListProps = {
  questions: PickerQuestion[];
  selected: Map<string, PickerQuestion>;
  onToggle: (q: PickerQuestion) => void;
  onToggleAll: () => void;
};

function QuestionPickerList({ questions, selected, onToggle, onToggleAll }: ListProps) {
  const allSelected = selected.size === questions.length && questions.length > 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 px-1">
        <Checkbox checked={allSelected} onCheckedChange={onToggleAll} />
        <span className="text-xs text-muted-foreground">
          Select all ({questions.length})
        </span>
        {selected.size > 0 && (
          <Badge variant="secondary" className="ml-auto text-xs">
            {selected.size} selected
          </Badge>
        )}
      </div>

      <ScrollArea className="h-[320px] rounded-md border">
        <div className="space-y-1 p-2">
          {questions.map((q) => (
            <QuestionPickerRow
              key={q.id}
              question={q}
              isSelected={selected.has(q.id)}
              onToggle={() => onToggle(q)}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

// ─── Single row component ──────────────────────────────────────────

const DIFFICULTY_COLORS: Record<string, string> = {
  EASY: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  MEDIUM: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  HARD: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

function QuestionPickerRow({
  question,
  isSelected,
  onToggle,
}: {
  question: PickerQuestion;
  isSelected: boolean;
  onToggle: () => void;
}) {
  return (
    <label
      className={`flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 transition-colors hover:bg-muted/50 ${
        isSelected ? 'bg-muted' : ''
      }`}
    >
      <Checkbox checked={isSelected} onCheckedChange={onToggle} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{question.title}</p>
        <div className="mt-0.5 flex items-center gap-2">
          <Badge variant="outline" className="text-[10px]">
            {question.type}
          </Badge>
          <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${DIFFICULTY_COLORS[question.difficulty] ?? ''}`}>
            {question.difficulty}
          </span>
          {question.class && (
            <span className="text-[10px] text-muted-foreground">{question.class.name}</span>
          )}
        </div>
      </div>
      <span className="shrink-0 text-xs text-muted-foreground">{question.marks}m</span>
    </label>
  );
}
