'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/utils/cn';

type StatusVariant = 'default' | 'success' | 'warning' | 'destructive' | 'secondary';

type StatusBadgeProps = {
  label: string;
  variant?: StatusVariant;
  className?: string;
};

const variantClasses: Record<StatusVariant, string> = {
  default: '',
  success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  destructive: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  secondary: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
};

export function StatusBadge({ label, variant = 'default', className }: StatusBadgeProps) {
  if (variant === 'default') {
    return <Badge className={className}>{label}</Badge>;
  }

  return (
    <Badge variant="outline" className={cn(variantClasses[variant], 'border-0', className)}>
      {label}
    </Badge>
  );
}
