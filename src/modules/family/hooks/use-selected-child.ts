'use client';

// ============================================
// Family Module — Child Selection Hook
// ============================================

import { useSearchParams } from 'next/navigation';
import { CHILD_SELECTOR_PARAM } from '../family.constants';
import { useLinkedChildren } from './use-family-queries';

/**
 * Hook that reads the selected child from URL search params.
 * Falls back to first child if none selected.
 */
export function useSelectedChild() {
  const searchParams = useSearchParams();
  const { data, isLoading } = useLinkedChildren();

  const childIdParam = searchParams.get(CHILD_SELECTOR_PARAM);
  const children = data?.success ? data.data ?? [] : [];

  // Find selected child or fall back to first
  const selectedChild = childIdParam
    ? children.find((c) => c.studentProfileId === childIdParam) ?? children[0] ?? null
    : children[0] ?? null;

  return {
    children,
    selectedChild,
    selectedChildId: selectedChild?.studentProfileId ?? null,
    isLoading,
    hasChildren: children.length > 0,
    childCount: children.length,
  };
}
