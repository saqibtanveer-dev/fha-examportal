'use client';

import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { ActionResult } from '@/types/action-result';

type UseServerActionOptions<TResult = unknown> = {
  /** Toast to show on success (set to false to suppress) */
  successMessage?: string | false;
  /** Toast to show on error (set to false to suppress) */
  errorMessage?: string | false;
  /** Query keys to invalidate on success (replaces router.refresh) */
  invalidateKeys?: readonly unknown[][];
  /** Callback after successful mutation */
  onSuccess?: (data?: TResult) => void;
  /** Callback after failed mutation */
  onError?: (error: string) => void;
};

/**
 * Reusable hook for calling server actions with:
 * - Loading state management
 * - Toast notifications
 * - React Query cache invalidation
 * - Error handling
 *
 * Usage:
 *   const { execute, isPending } = useServerAction(deleteExamAction, {
 *     successMessage: 'Exam deleted',
 *     invalidateKeys: [queryKeys.exams.all],
 *   });
 */
export function useServerAction<TArgs extends unknown[], TResult = unknown>(
  action: (...args: TArgs) => Promise<ActionResult<TResult>>,
  options: UseServerActionOptions<TResult> = {},
) {
  const {
    successMessage = 'Success',
    errorMessage,
    invalidateKeys = [],
    onSuccess,
    onError,
  } = options;

  const [isPending, setIsPending] = useState(false);
  const queryClient = useQueryClient();

  const execute = useCallback(
    async (...args: TArgs) => {
      setIsPending(true);
      try {
        const result = await action(...args);
        if (result.success) {
          if (successMessage !== false) toast.success(successMessage);
          // Invalidate specified query keys
          await Promise.all(
            invalidateKeys.map((key) => queryClient.invalidateQueries({ queryKey: key })),
          );
          onSuccess?.(result.data as TResult | undefined);
          return result;
        } else {
          const msg = result.error ?? 'Operation failed';
          if (errorMessage !== false) toast.error(errorMessage ?? msg);
          onError?.(msg);
          return result;
        }
      } catch {
        const msg = 'An unexpected error occurred';
        if (errorMessage !== false) toast.error(msg);
        onError?.(msg);
        return { success: false, error: msg } as ActionResult<TResult>;
      } finally {
        setIsPending(false);
      }
    },
    [action, successMessage, errorMessage, invalidateKeys, queryClient, onSuccess, onError],
  );

  return { execute, isPending };
}
