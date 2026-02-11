/**
 * Standardized action result type for all server actions.
 * Enforces consistent response shape across the entire application.
 *
 * @example
 * // Success with data
 * return actionSuccess({ id: user.id });
 *
 * // Failure
 * return actionError('Validation failed');
 */

export type ActionResult<T = unknown> = {
  success: boolean;
  error?: string;
  data?: T;
};

/** Create a success result */
export function actionSuccess<T = unknown>(data?: T): ActionResult<T> {
  return { success: true, data };
}

/** Create an error result */
export function actionError(error: string): ActionResult<never> {
  return { success: false, error };
}
