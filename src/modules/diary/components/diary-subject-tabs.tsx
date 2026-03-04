'use client';

import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { getSubjectColor } from '../diary.constants';

type Subject = { id: string; name: string; code: string };

type Props = {
  subjects: Subject[];
  selectedSubjectId?: string;
  onSelect: (subjectId: string | undefined) => void;
  className?: string;
};

export function DiarySubjectTabs({ subjects, selectedSubjectId, onSelect, className }: Props) {
  if (subjects.length === 0) return null;

  return (
    <div className={className}>
      {/* Mobile: dropdown */}
      <div className="sm:hidden">
        <Select
          value={selectedSubjectId ?? 'all'}
          onValueChange={(v) => onSelect(v === 'all' ? undefined : v)}
        >
          <SelectTrigger className="h-9">
            <SelectValue placeholder="All Subjects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            {subjects.map((s) => (
              <SelectItem key={s.id} value={s.id}>{s.name} ({s.code})</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Desktop: horizontal tabs */}
      <div className="hidden sm:flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => onSelect(undefined)}
          className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
            !selectedSubjectId
              ? 'bg-foreground text-background'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          All
        </button>
        {subjects.map((s, idx) => (
          <button
            key={s.id}
            type="button"
            onClick={() => onSelect(s.id)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              selectedSubjectId === s.id
                ? getSubjectColor(idx)
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {s.code}
          </button>
        ))}
      </div>
    </div>
  );
}
