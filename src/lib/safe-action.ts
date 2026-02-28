import { logger } from '@/lib/logger';
import { AppError, ValidationError } from '@/errors/base-error';
import type { ActionResult } from '@/types/action-result';
import { actionError } from '@/types/action-result';

/**
 * Wraps a server action with consistent error handling.
 * Catches Prisma errors, AppErrors, and unexpected exceptions,
 * returning a safe ActionResult instead of throwing.
 *
 * Usage:
 *   export const createUserAction = safeAction(async (input: CreateUserInput) => {
 *     // ... your logic
 *     return { success: true, data: { id: user.id } };
 *   });
 *
 * Or wrap existing functions inline:
 *   return safeAction(async () => { ... })();
 */
export function safeAction<TArgs extends unknown[], TResult = unknown>(
  action: (...args: TArgs) => Promise<ActionResult<TResult>>,
): (...args: TArgs) => Promise<ActionResult<TResult>> {
  return async (...args: TArgs): Promise<ActionResult<TResult>> => {
    try {
      return await action(...args);
    } catch (error: unknown) {
      // NEXT_REDIRECT / NEXT_NOT_FOUND — re-throw so Next.js handles them
      if (isNextRedirect(error)) throw error;

      if (error instanceof ValidationError) {
        return actionError(error.message) as ActionResult<TResult>;
      }

      if (error instanceof AppError) {
        if (!error.isOperational) {
          logger.error({ err: error }, 'Non-operational error in server action');
        }
        return actionError(error.message) as ActionResult<TResult>;
      }

      if (isPrismaError(error)) {
        return handlePrismaError(error) as ActionResult<TResult>;
      }

      // Unknown / unexpected error — log full details, return safe message
      logger.error({ err: error }, 'Unhandled error in server action');
      return actionError('An unexpected error occurred. Please try again.') as ActionResult<TResult>;
    }
  };
}

/** Detect NEXT_REDIRECT and NEXT_NOT_FOUND errors that Next.js uses internally */
function isNextRedirect(error: unknown): boolean {
  if (typeof error === 'object' && error !== null && 'digest' in error) {
    const digest = (error as { digest: string }).digest;
    return digest.startsWith('NEXT_REDIRECT') || digest.startsWith('NEXT_NOT_FOUND');
  }
  return false;
}

function isPrismaError(error: unknown): error is { code: string; meta?: Record<string, unknown> } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as { code: string }).code === 'string'
  );
}

function handlePrismaError(error: { code: string; meta?: Record<string, unknown> }): ActionResult<never> {
  switch (error.code) {
    case 'P2002': {
      const target = (error.meta?.target as string[])?.join(', ') ?? 'field';
      const msg =
        process.env.NODE_ENV === 'development'
          ? `A record with this ${target} already exists`
          : 'A record with this value already exists';
      return actionError(msg);
    }
    case 'P2025':
      return actionError('Record not found');
    case 'P2003':
      return actionError('Cannot perform this action because related records exist');
    case 'P2014':
      return actionError('This change would violate a required relation');
    default:
      logger.error({ prismaCode: error.code, meta: error.meta }, 'Unhandled Prisma error in server action');
      return actionError('A database error occurred. Please try again.');
  }
}
