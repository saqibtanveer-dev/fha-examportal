'use client';

import { RouteError } from '@/components/shared';

export default function Error(props: { error: Error; reset: () => void }) {
  return <RouteError {...props} />;
}
