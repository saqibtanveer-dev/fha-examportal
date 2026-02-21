'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import type { ActionResult } from '@/types/action-result';

type UseServerActionOptions<TResult = unknown> = {
  /** Toast to show on success (set to false to suppress) */
  successMessage?: string | false;
  /** Toast to show on error (set to false to suppress) */
  errorMessage?: string | false;
  /** Call router.refresh() on success to re-render RSC */
  refreshOnSuccess?: boolean;
  /** Callback after successful mutation */
  onSuccess?: (data?: TResult) => void;
  /** Callback after failed mutation */
  onError?: (error: string) => void;
};

/**
 * Reusable hook for calling server actions with:
 * - Loading state management
 * - Toast notifications
 * - Router refresh
 * - Error handling
 *
 * Usage:
 *   const { execute, isPending } = useServerAction(deleteExamAction, {
 *     successMessage: 'Exam deleted',
 *     refreshOnSuccess: true,
 *   });
 *   <Button onClick={() => execute(examId)} disabled={isPending}>Delete</Button>
 */
export function useServerAction<TArgs extends unknown[], TResult = unknown>(
  action: (...args: TArgs) => Promise<ActionResult<TResult>>,
  options: UseServerActionOptions<TResult> = {},
) {
  const {
    successMessage = 'Success',
    errorMessage,
    refreshOnSuccess = true,
    onSuccess,
    onError,
  } = options;

  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const execute = useCallback(
    async (...args: TArgs) => {
      setIsPending(true);
      try {
        const result = await action(...args);
        if (result.success) {
          if (successMessage !== false) toast.success(successMessage);
          if (refreshOnSuccess) router.refresh();
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
    [action, successMessage, errorMessage, refreshOnSuccess, router, onSuccess, onError],
  );

  return { execute, isPending };
}
