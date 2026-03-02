'use client';

import { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Award, Clock, Loader2 } from 'lucide-react';
import type { QuestionItem } from './create-exam-types';

type Props = {
  questions: QuestionItem[];
  isLoading: boolean;
  hasSubject: boolean;
  selectedIds: string[];
  onToggle: (id: string) => void;
  totalMarks: number;
  suggestedDuration: number;
};

export function QuestionPicker({
  questions,
  isLoading,
  hasSubject,
  selectedIds,
  onToggle,
  totalMarks,
  suggestedDuration,
}: Props) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return questions;
    const s = search.toLowerCase();
    return questions.filter((q) => q.title.toLowerCase().includes(s));
  }, [questions, search]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>Questions ({selectedIds.length} selected)</Label>
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1 font-medium text-primary">
              <Award className="h-3.5 w-3.5" />
              Total: {totalMarks} marks
            </span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              ~{suggestedDuration} min
            </span>
          </div>
        )}
      </div>
      <Input
        placeholder="Search questions..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="h-8 text-sm"
      />
      <div className="max-h-48 space-y-1 overflow-y-auto rounded border p-2">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />Loading questions...
          </div>
        ) : filtered.length === 0 ? (
          <p className="p-2 text-sm text-muted-foreground">
            {hasSubject ? 'No questions for this subject' : 'Select a subject to load questions'}
          </p>
        ) : (
          filtered.map((q) => (
            <label
              key={q.id}
              className="group flex cursor-pointer items-start gap-2 rounded px-2 py-1.5 hover:bg-accent"
            >
              <Checkbox
                checked={selectedIds.includes(q.id)}
                onCheckedChange={() => onToggle(q.id)}
                className="mt-0.5 shrink-0"
              />
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="min-w-0 flex-1 break-words text-sm line-clamp-2">
                    {q.title}
                  </span>
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs">
                  <p className="whitespace-pre-wrap break-words">{q.title}</p>
                </TooltipContent>
              </Tooltip>
              <div className="flex shrink-0 items-center gap-1.5">
                <Badge variant="outline" className="px-1.5 py-0 text-[10px]">
                  {q.type.replace('_', ' ')}
                </Badge>
                <Badge variant="secondary" className="px-1.5 py-0 text-[10px] font-semibold">
                  {q.marks}m
                </Badge>
              </div>
            </label>
          ))
        )}
      </div>
    </div>
  );
}
