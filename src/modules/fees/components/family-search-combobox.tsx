'use client';

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover';
import { Search, X, ChevronsUpDown } from 'lucide-react';
import { Spinner } from '@/components/shared';
import { searchFamiliesAction } from '@/modules/fees/fee-search-actions';
import type { SearchableFamily } from '@/modules/fees/fee-search-actions';

type Props = {
  value: string;
  onSelect: (family: SearchableFamily) => void;
  onClear: () => void;
  disabled?: boolean;
  selectedLabel?: string;
};

export function FamilySearchCombobox({
  value, onSelect, onClear, disabled, selectedLabel,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchableFamily[]>([]);
  const [searching, setSearching] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  const doSearch = useCallback(async (term: string) => {
    if (term.length < 2) { setResults([]); return; }
    setSearching(true);
    try {
      const result = await searchFamiliesAction(term);
      setResults(('data' in result && result.data) ? result.data : []);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  function handleQueryChange(q: string) {
    setQuery(q);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => doSearch(q), 300);
  }

  function handleSelect(family: SearchableFamily) {
    onSelect(family);
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
          Search family by parent name...
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <div className="flex items-center border-b px-3">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <Input
            placeholder="Type parent name..."
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            className="border-0 shadow-none focus-visible:ring-0"
          />
        </div>
        <div className="max-h-60 overflow-y-auto">
          {searching && (
            <div className="flex items-center justify-center py-4">
              <Spinner size="sm" />
            </div>
          )}
          {!searching && query.length >= 2 && results.length === 0 && (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No families found
            </p>
          )}
          {!searching && query.length < 2 && (
            <p className="py-4 text-center text-sm text-muted-foreground">
              Type at least 2 characters
            </p>
          )}
          {results.map((f) => (
            <button
              key={f.familyProfileId}
              type="button"
              className="flex w-full flex-col gap-0.5 px-3 py-2 text-left text-sm hover:bg-accent"
              onClick={() => handleSelect(f)}
            >
              <span className="font-medium">{f.parentName}</span>
              <span className="text-xs text-muted-foreground">
                {f.relationship} &middot; {f.childrenCount} child(ren): {f.childrenNames}
              </span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
