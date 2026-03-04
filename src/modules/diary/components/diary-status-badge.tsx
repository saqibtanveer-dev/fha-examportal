'use client';

import { cn } from '@/utils/cn';
import { DIARY_STATUS_CONFIG } from '../diary.constants';
import type { DiaryStatus } from '@prisma/client';

type Props = {
  status: DiaryStatus;
  className?: string;
};

export function DiaryStatusBadge({ status, className }: Props) {
  const config = DIARY_STATUS_CONFIG[status];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
        config.bgColor,
        config.color,
        className,
      )}
    >
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </span>
  );
}
