import { ChevronRight, Home } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/utils/cn';

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

type PageHeaderProps = {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  className?: string;
};

export function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground sm:text-sm">
          <Link href="/" className="hover:text-foreground">
            <Home className="h-4 w-4" />
          </Link>
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1 min-w-0">
              <ChevronRight className="h-3 w-3 shrink-0" />
              {crumb.href ? (
                <Link href={crumb.href} className="truncate hover:text-foreground">
                  {crumb.label}
                </Link>
              ) : (
                <span className="truncate text-foreground">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-lg font-bold tracking-tight sm:text-xl md:text-2xl">{title}</h1>
          {description && (
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex w-full shrink-0 flex-wrap items-center gap-2 sm:w-auto">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
