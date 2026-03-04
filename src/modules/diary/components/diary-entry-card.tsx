'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Send, Copy } from 'lucide-react';
import { DiaryStatusBadge } from './diary-status-badge';
import { formatDiaryDateShort, truncateText, isEditableByTeacher, getTeacherName } from '../diary.utils';
import { getSubjectColor } from '../diary.constants';
import type { DiaryEntryRecord } from '../diary.types';

type Props = {
  entry: DiaryEntryRecord;
  subjectIndex?: number;
  showTeacher?: boolean;
  showActions?: boolean;
  onEdit?: (entry: DiaryEntryRecord) => void;
  onDelete?: (entryId: string) => void;
  onPublish?: (entryId: string) => void;
  onCopy?: (entry: DiaryEntryRecord) => void;
  onClick?: (entry: DiaryEntryRecord) => void;
  className?: string;
};

export function DiaryEntryCard({
  entry,
  subjectIndex = 0,
  showTeacher = false,
  showActions = false,
  onEdit,
  onDelete,
  onPublish,
  onCopy,
  onClick,
  className,
}: Props) {
  const canEdit = isEditableByTeacher(entry.date);
  const subjectColor = getSubjectColor(subjectIndex);

  return (
    <Card
      className={`transition-shadow hover:shadow-md ${onClick ? 'cursor-pointer' : ''} ${className ?? ''}`}
      onClick={() => onClick?.(entry)}
    >
      <CardHeader className="flex flex-row items-start gap-3 space-y-0 pb-2 pt-4 px-4">
        <span className={`shrink-0 rounded-md border px-2 py-0.5 text-xs font-medium ${subjectColor}`}>
          {entry.subject.code}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold leading-tight line-clamp-1">{entry.title}</h3>
            <DiaryStatusBadge status={entry.status} />
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
            <span>{entry.subject.name}</span>
            <span>•</span>
            <span>{entry.class.name} {entry.section.name}</span>
            <span>•</span>
            <span>{formatDiaryDateShort(entry.date)}</span>
            {showTeacher && (
              <>
                <span>•</span>
                <span>{getTeacherName(entry.teacherProfile)}</span>
              </>
            )}
            {entry.isEdited && <span className="text-amber-600">(edited)</span>}
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-4 pb-3 pt-0">
        <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-3">
          {truncateText(entry.content, 200)}
        </p>

        {showActions && (
          <div className="mt-3 flex flex-wrap gap-2">
            {entry.status === 'DRAFT' && onPublish && (
              <Button
                size="sm"
                variant="default"
                onClick={(e) => { e.stopPropagation(); onPublish(entry.id); }}
              >
                <Send className="mr-1 h-3 w-3" /> Publish
              </Button>
            )}
            {canEdit && onEdit && (
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => { e.stopPropagation(); onEdit(entry); }}
              >
                <Pencil className="mr-1 h-3 w-3" /> Edit
              </Button>
            )}
            {onCopy && (
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => { e.stopPropagation(); onCopy(entry); }}
              >
                <Copy className="mr-1 h-3 w-3" /> Copy
              </Button>
            )}
            {canEdit && onDelete && (
              <Button
                size="sm"
                variant="destructive"
                onClick={(e) => { e.stopPropagation(); onDelete(entry.id); }}
              >
                <Trash2 className="mr-1 h-3 w-3" /> Delete
              </Button>
            )}
          </div>
        )}

        {entry._count.readReceipts > 0 && (
          <div className="mt-2 text-xs text-muted-foreground">
            👀 {entry._count.readReceipts} student{entry._count.readReceipts !== 1 ? 's' : ''} read
          </div>
        )}
      </CardContent>
    </Card>
  );
}
