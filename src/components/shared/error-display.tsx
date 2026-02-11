'use client';

import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';

type ErrorDisplayProps = {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
};

export function ErrorDisplay({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  onRetry,
  className,
}: ErrorDisplayProps) {
  return (
    <div className={cn('flex min-h-75 flex-col items-center justify-center gap-4', className)}>
      <AlertTriangle className="h-12 w-12 text-destructive" />
      <div className="text-center">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{message}</p>
      </div>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      )}
    </div>
  );
}
