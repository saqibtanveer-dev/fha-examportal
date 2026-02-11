export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(entity: string, identifier?: string) {
    const message = identifier
      ? `${entity} with identifier "${identifier}" not found`
      : `${entity} not found`;
    super(message, 404);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'You do not have permission to perform this action') {
    super(message, 403);
  }
}

export class ValidationError extends AppError {
  public readonly details: unknown;

  constructor(message = 'Validation failed', details?: unknown) {
    super(message, 422);
    this.details = details;
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409);
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad request') {
    super(message, 400);
  }
}
