'use client';

import { RouteError } from '@/components/shared';

export default function TeachersError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <RouteError error={error} reset={reset} />;
}
