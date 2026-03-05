'use client';

import { Badge } from '@/components/ui/badge';
import { DATESHEET_STATUS_LABELS, DATESHEET_STATUS_VARIANTS } from '../datesheet.constants';
import type { DatesheetStatus } from '@prisma/client';

type Props = { status: DatesheetStatus };

export function DatesheetStatusBadge({ status }: Props) {
  return (
    <Badge variant={DATESHEET_STATUS_VARIANTS[status]}>
      {DATESHEET_STATUS_LABELS[status]}
    </Badge>
  );
}
