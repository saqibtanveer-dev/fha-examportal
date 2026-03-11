'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatExamDate, formatTimeRange, groupEntriesByDate } from '../datesheet.utils';
import type { DeepSerialize } from '@/utils/serialize';
import type { DatesheetEntryWithRelations } from '../datesheet.types';

type SerializedEntry = DeepSerialize<DatesheetEntryWithRelations>;

type Props = {
  title: string;
  entries: SerializedEntry[];
  className?: string;
};

export function DatesheetClassView({ title, entries, className }: Props) {
  const grouped = groupEntriesByDate(entries);

  if (entries.length === 0) {
    return (
      <Card className={className}>
        <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">No entries available.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Section</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Room</TableHead>
              <TableHead>Total Marks</TableHead>
              <TableHead>Invigilators</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {grouped.map(({ date, entries: dayEntries }) =>
              dayEntries.map((entry, i) => (
                <TableRow key={entry.id}>
                  {i === 0 && (
                    <TableCell rowSpan={dayEntries.length} className="font-medium align-top">
                      {formatExamDate(date)}
                    </TableCell>
                  )}
                  <TableCell>{entry.subject.name}</TableCell>
                  <TableCell>{entry.section.name}</TableCell>
                  <TableCell className="whitespace-nowrap">{formatTimeRange(entry.startTime, entry.endTime)}</TableCell>
                  <TableCell>{entry.room || '—'}</TableCell>
                  <TableCell>{entry.totalMarks ?? '—'}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {entry.duties.map((d) => (
                        <Badge key={d.id} variant="secondary" className="text-xs">
                          {d.teacherProfile.user.firstName} {d.teacherProfile.user.lastName}
                        </Badge>
                      ))}
                      {entry.duties.length === 0 && <span className="text-muted-foreground text-xs">—</span>}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
