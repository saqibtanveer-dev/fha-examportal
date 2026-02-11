'use client';

import { cn } from '@/lib/utils';

type SkeletonCardProps = {
  count?: number;
  className?: string;
};

/** Grid of skeleton cards for loading states */
export function SkeletonCardGrid({ count = 6, className }: SkeletonCardProps) {
  return (
    <div className={cn('grid gap-4 sm:grid-cols-2 lg:grid-cols-3', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-lg border bg-card p-6 space-y-3">
          <div className="h-5 w-2/3 animate-pulse rounded bg-muted" />
          <div className="h-4 w-full animate-pulse rounded bg-muted" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}

/** Skeleton table for loading states */
export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-md border">
      <div className="border-b p-4">
        <div className="flex gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-4 flex-1 animate-pulse rounded bg-muted" />
          ))}
        </div>
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 border-b p-4 last:border-0">
          {Array.from({ length: 5 }).map((_, j) => (
            <div key={j} className="h-4 flex-1 animate-pulse rounded bg-muted" />
          ))}
        </div>
      ))}
    </div>
  );
}

/** Skeleton dashboard stats */
export function SkeletonDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border bg-card p-6 space-y-2">
            <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
            <div className="h-8 w-2/3 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border bg-card p-6 h-64 animate-pulse bg-muted/30" />
        <div className="rounded-lg border bg-card p-6 h-64 animate-pulse bg-muted/30" />
      </div>
    </div>
  );
}

/** Skeleton for page with header and content */
export function SkeletonPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-48 animate-pulse rounded bg-muted" />
          <div className="h-4 w-64 animate-pulse rounded bg-muted" />
        </div>
        <div className="h-9 w-28 animate-pulse rounded bg-muted" />
      </div>
      <SkeletonTable />
    </div>
  );
}
