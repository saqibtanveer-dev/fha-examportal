'use client';

import { AttendanceStatus } from '@prisma/client';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { ATTENDANCE_STATUSES, ATTENDANCE_STATUS_CONFIG } from '../attendance.constants';

type Props = {
  value: AttendanceStatus;
  onValueChange: (status: AttendanceStatus) => void;
  disabled?: boolean;
  className?: string;
};

export function AttendanceStatusSelect({ value, onValueChange, disabled, className }: Props) {
  return (
    <Select
      value={value}
      onValueChange={(v) => onValueChange(v as AttendanceStatus)}
      disabled={disabled}
    >
      <SelectTrigger className={className ?? 'h-8 w-28'}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {ATTENDANCE_STATUSES.map((status) => (
          <SelectItem key={status} value={status}>
            <span className="flex items-center gap-1.5">
              <span>{ATTENDANCE_STATUS_CONFIG[status].icon}</span>
              <span>{ATTENDANCE_STATUS_CONFIG[status].label}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
