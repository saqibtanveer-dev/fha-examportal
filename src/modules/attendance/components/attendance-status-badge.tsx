'use client';

import { cn } from '@/utils/cn';
import { ATTENDANCE_STATUS_CONFIG } from '../attendance.constants';
import type { AttendanceStatus } from '@prisma/client';

type Props = {
  status: AttendanceStatus;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
};

export function AttendanceStatusBadge({ status, size = 'md', showLabel = true, className }: Props) {
  const config = ATTENDANCE_STATUS_CONFIG[status];

  const sizeClasses = {
    sm: 'h-5 px-1.5 text-[10px]',
    md: 'h-6 px-2 text-xs',
    lg: 'h-7 px-3 text-sm',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium',
        config.bgColor,
        config.color,
        sizeClasses[size],
        className,
      )}
    >
      <span>{config.icon}</span>
      {showLabel && <span>{config.shortLabel}</span>}
    </span>
  );
}
