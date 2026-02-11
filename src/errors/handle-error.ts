import { logger } from '@/lib/logger';
import { errorResponse } from '@/utils/api-response';
import { AppError, ValidationError } from './base-error';

export function handleApiError(error: unknown) {
  if (error instanceof ValidationError) {
    return errorResponse(error.message, error.statusCode, error.details);
  }

  if (error instanceof AppError) {
    if (!error.isOperational) {
      logger.error({ err: error }, 'Non-operational error in API route');
    }
    return errorResponse(error.message, error.statusCode);
  }

  // Prisma known errors
  if (isPrismaError(error)) {
    return handlePrismaError(error);
  }

  // Unknown error
  logger.error({ err: error }, 'Unhandled error in API route');
  return errorResponse('Internal server error', 500);
}

function isPrismaError(error: unknown): error is { code: string; meta?: Record<string, unknown> } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as { code: string }).code === 'string'
  );
}

function handlePrismaError(error: { code: string; meta?: Record<string, unknown> }) {
  switch (error.code) {
    case 'P2002': {
      const target = (error.meta?.target as string[])?.join(', ') ?? 'field';
      return errorResponse(`A record with this ${target} already exists`, 409);
    }
    case 'P2025':
      return errorResponse('Record not found', 404);
    case 'P2003':
      return errorResponse('Related record not found', 400);
    default:
      logger.error({ prismaCode: error.code, meta: error.meta }, 'Unhandled Prisma error');
      return errorResponse('Database error', 500);
  }
}
