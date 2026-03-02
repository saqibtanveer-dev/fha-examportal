'use client';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/utils/cn';

export const CHART_COLORS = {
  primary: 'hsl(var(--primary))',
  green: '#22c55e',
  red: '#ef4444',
  amber: '#f59e0b',
  blue: '#3b82f6',
  purple: '#8b5cf6',
  indigo: '#6366f1',
  teal: '#14b8a6',
  gray: '#6b7280',
};

export const PIE_COLORS = [CHART_COLORS.green, CHART_COLORS.red];
export const OPTION_COLORS = ['#3b82f6', '#f59e0b', '#8b5cf6', '#14b8a6', '#ec4899', '#f97316'];

export function KpiCard({
  icon,
  label,
  value,
  subtext,
  variant = 'default',
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtext?: string;
  variant?: 'default' | 'success' | 'danger' | 'warning';
}) {
  const borderMap = {
    default: '',
    success: 'border-l-green-500',
    danger: 'border-l-red-500',
    warning: 'border-l-amber-500',
  };

  return (
    <Card className={cn('border-l-4', borderMap[variant])}>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs text-muted-foreground">{label}</p>
          <p className="text-lg font-bold leading-tight">{value}</p>
          {subtext && <p className="truncate text-xs text-muted-foreground">{subtext}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

export function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
