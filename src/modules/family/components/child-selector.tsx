'use client';

// ============================================
// Child Selector — URL-synced child picker
// ============================================

import { useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CHILD_SELECTOR_PARAM } from '@/modules/family/family.constants';
import type { LinkedChild } from '@/modules/family/family.types';

type Props = {
  children: LinkedChild[];
  selectedChildId: string | null;
};

export function ChildSelector({ children, selectedChildId }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleChange = useCallback(
    (childId: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(CHILD_SELECTOR_PARAM, childId);
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams],
  );

  if (children.length === 0) return null;

  // Single child — show read-only label
  if (children.length === 1) {
    const child = children[0]!;
    return (
      <div className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
        <span className="font-medium">{child.studentName}</span>
        <span className="text-muted-foreground">
          {child.className} - {child.sectionName}
        </span>
      </div>
    );
  }

  return (
    <Select value={selectedChildId ?? undefined} onValueChange={handleChange}>
      <SelectTrigger className="w-[280px]">
        <SelectValue placeholder="Select a child" />
      </SelectTrigger>
      <SelectContent>
        {children.map((child) => (
          <SelectItem key={child.studentProfileId} value={child.studentProfileId}>
            <span className="font-medium">{child.studentName}</span>
            <span className="ml-2 text-muted-foreground text-xs">
              {child.className} - {child.sectionName}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
