'use client';

import { ErrorDisplay } from '@/components/shared/error-display';

type RouteErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

/**
 * Reusable error boundary for route segments.
 * Usage: export { RouteError as default } from '@/components/shared/route-error';
 * Or: export default function Error(props) { return <RouteError {...props} />; }
 */
export function RouteError({ error, reset }: RouteErrorProps) {
  return (
    <ErrorDisplay
      title="Something went wrong"
      message={error.message || 'An unexpected error occurred. Please try again.'}
      onRetry={reset}
    />
  );
}

export default RouteError;
