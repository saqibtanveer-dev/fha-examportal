'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover';
import { Search, X, ChevronsUpDown } from 'lucide-react';
import { Spinner } from '@/components/shared';
import { searchStudentsForLinkingAction } from '@/modules/family/family-search-actions';
import type { SearchableStudent } from '@/modules/family/family-search-actions';

type Props = {
  value: string;
  onSelect: (student: SearchableStudent) => void;
  onClear: () => void;
  disabled?: boolean;
  selectedLabel?: string;
};

export function StudentSearchCombobox({
  value, onSelect, onClear, disabled, selectedLabel,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchableStudent[]>([]);
  const [searching, setSearching] = useState(false);

  const doSearch = useCallback(async () => {
    if (query.length < 2) { setResults([]); return; }
    setSearching(true);
    try {
      const result = await searchStudentsForLinkingAction(query);
      setResults(('data' in result && result.data) ? result.data : []);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  }, [query]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      doSearch();
    }
  }

  function handleSelect(student: SearchableStudent) {
    onSelect(student);
    setOpen(false);
    setQuery('');
    setResults([]);
  }

  if (value && selectedLabel) {
    return (
      <div className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
        <span className="flex-1 truncate">{selectedLabel}</span>
        <Button
          variant="ghost" size="icon" className="h-5 w-5"
          onClick={onClear} disabled={disabled}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline" role="combobox" aria-expanded={open}
          className="w-full justify-between font-normal text-muted-foreground"
          disabled={disabled}
        >
          Search student by name or roll...
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <div className="flex items-center border-b px-3">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <Input
            placeholder="Type name or roll number..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="border-0 shadow-none focus-visible:ring-0"
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0"
            onClick={doSearch}
            disabled={query.length < 2 || searching}
          >
            <Search className="h-3.5 w-3.5" />
          </Button>
        </div>
        <div className="max-h-60 overflow-y-auto">
          {searching && (
            <div className="flex items-center justify-center py-4">
              <Spinner size="sm" />
            </div>
          )}
          {!searching && query.length >= 2 && results.length === 0 && (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No students found
            </p>
          )}
          {!searching && query.length < 2 && (
            <p className="py-4 text-center text-sm text-muted-foreground">
              Type at least 2 characters and press Search
            </p>
          )}
          {results.map((s) => (
            <button
              key={s.studentProfileId}
              type="button"
              className="flex w-full flex-col gap-0.5 px-3 py-2 text-left text-sm hover:bg-accent"
              onClick={() => handleSelect(s)}
            >
              <span className="font-medium">{s.studentName}</span>
              <span className="text-xs text-muted-foreground">
                {s.className} &middot; {s.sectionName} &middot; Roll: {s.rollNumber}
              </span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
