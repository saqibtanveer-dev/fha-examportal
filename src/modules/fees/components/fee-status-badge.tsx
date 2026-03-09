'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { FeeAssignmentStatus, PaymentStatus } from '@prisma/client';

const assignmentVariants: Record<string, { label: string; className: string }> = {
  PENDING: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
  PARTIAL: { label: 'Partial', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  PAID: { label: 'Paid', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  OVERDUE: { label: 'Overdue', className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
  CANCELLED: { label: 'Cancelled', className: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' },
  WAIVED: { label: 'Waived', className: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
};

const paymentVariants: Record<string, { label: string; className: string }> = {
  COMPLETED: { label: 'Completed', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  REVERSED: { label: 'Reversed', className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
};

export function FeeStatusBadge({ status }: { status: FeeAssignmentStatus }) {
  const v = assignmentVariants[status] ?? { label: status, className: '' };
  return (
    <Badge variant="outline" className={cn('border-0', v.className)}>
      {v.label}
    </Badge>
  );
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const v = paymentVariants[status] ?? { label: status, className: '' };
  return (
    <Badge variant="outline" className={cn('border-0', v.className)}>
      {v.label}
    </Badge>
  );
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatMonth(month: string): string {
  const [year, m] = month.split('-');
  const date = new Date(Number(year), Number(m) - 1);
  return date.toLocaleDateString('en-PK', { month: 'long', year: 'numeric' });
}
