'use client';

import { cn } from '@/utils/cn';
import { Spinner } from './spinner';

type PageLoaderProps = {
  message?: string;
  className?: string;
};

export function PageLoader({ message = 'Loading...', className }: PageLoaderProps) {
  return (
    <div className={cn('flex min-h-100 flex-col items-center justify-center gap-3', className)}>
      <Spinner size="lg" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
