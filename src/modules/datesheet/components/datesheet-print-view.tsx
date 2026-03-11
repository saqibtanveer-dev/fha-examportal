'use client';

import { forwardRef } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatExamDate, formatTimeRange, groupEntriesByDate } from '../datesheet.utils';
import type { DeepSerialize } from '@/utils/serialize';
import type { DatesheetEntryWithRelations, DatesheetWithMeta } from '../datesheet.types';

type SerializedEntry = DeepSerialize<DatesheetEntryWithRelations>;
type SerializedDatesheet = DeepSerialize<DatesheetWithMeta>;

type Props = {
  datesheet: SerializedDatesheet;
  entries: SerializedEntry[];
  schoolName?: string;
};

export const DatesheetPrintView = forwardRef<HTMLDivElement, Props>(
  ({ datesheet, entries, schoolName = 'School' }, ref) => {
    const grouped = groupEntriesByDate(entries);

    return (
      <div ref={ref} className="print-view p-8 bg-white text-black">
        <style>{`
          @media print {
            .print-view { padding: 0; }
            .no-print { display: none !important; }
          }
        `}</style>

        <div className="text-center mb-6">
          <h1 className="text-xl font-bold">{schoolName}</h1>
          <h2 className="text-lg font-semibold mt-1">{datesheet.title}</h2>
          {datesheet.description && <p className="text-sm text-gray-600 mt-1">{datesheet.description}</p>}
          <p className="text-sm text-gray-500 mt-1">
            Session: {datesheet.academicSession.name} | Type: {datesheet.examType}
          </p>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="border text-center">Date</TableHead>
              <TableHead className="border text-center">Subject</TableHead>
              <TableHead className="border text-center">Class</TableHead>
              <TableHead className="border text-center">Time</TableHead>
              <TableHead className="border text-center">Room</TableHead>
              <TableHead className="border text-center">Total Marks</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {grouped.map(({ date, entries: dayEntries }) =>
              dayEntries.map((entry, i) => (
                <TableRow key={entry.id}>
                  {i === 0 && (
                    <TableCell rowSpan={dayEntries.length} className="border font-medium text-center align-top">
                      {formatExamDate(date)}
                    </TableCell>
                  )}
                  <TableCell className="border">{entry.subject.name}</TableCell>
                  <TableCell className="border">
                    {entry.class.name} ({entry.section.name})
                  </TableCell>
                  <TableCell className="border whitespace-nowrap">{formatTimeRange(entry.startTime, entry.endTime)}</TableCell>
                  <TableCell className="border">{entry.room || '—'}</TableCell>
                  <TableCell className="border text-center">{entry.totalMarks ?? '—'}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {entries.some((e) => e.instructions) && (
          <div className="mt-6 text-sm">
            <h3 className="font-semibold mb-1">Instructions:</h3>
            <ul className="list-disc pl-5 space-y-0.5">
              {entries
                .filter((e) => e.instructions)
                .map((e) => <li key={e.id}>{e.instructions}</li>)}
            </ul>
          </div>
        )}
      </div>
    );
  }
);

DatesheetPrintView.displayName = 'DatesheetPrintView';
