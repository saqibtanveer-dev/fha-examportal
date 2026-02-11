'use client';

import { FileX } from 'lucide-react';
import { cn } from '@/utils/cn';

type EmptyStateProps = {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
};

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('flex min-h-75 flex-col items-center justify-center gap-4', className)}>
      {icon ?? <FileX className="h-12 w-12 text-muted-foreground" />}
      <div className="text-center">
        <h3 className="text-lg font-semibold">{title}</h3>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
