'use client';

import { RouteError } from '@/components/shared';

export default function PrincipalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <RouteError error={error} reset={reset} />;
}
