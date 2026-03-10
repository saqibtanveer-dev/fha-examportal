'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Trophy, Medal } from 'lucide-react';
import { ApplicantStatusBadge } from './campaign-status-badge';

/**
 * MeritListTable — Data comes from getMeritList() which returns ApplicantResult[]
 * with included `applicant` relation. Result fields (rank, percentage, etc.) are
 * at root level; applicant data is nested under `.applicant`.
 */

type MeritEntry = {
  id: string;
  rank: number | null;
  obtainedMarks: number;
  totalMarks: number;
  percentage: number;
  isPassed: boolean;
  grade: string | null;
  applicant: {
    id: string;
    applicationNumber: string;
    firstName: string;
    lastName: string;
    email: string;
    status: string;
    scholarship?: { tier: string; isAccepted: boolean | null } | null;
    decisions?: { decision: string }[];
  };
};

type Props = {
  entries: MeritEntry[];
};

const tierColors: Record<string, string> = {
  FULL_100: 'text-yellow-500',
  SEVENTY_FIVE: 'text-amber-500',
  HALF_50: 'text-orange-500',
  QUARTER_25: 'text-blue-500',
  NONE: 'text-muted-foreground',
};

const tierLabels: Record<string, string> = {
  FULL_100: '100%',
  SEVENTY_FIVE: '75%',
  HALF_50: '50%',
  QUARTER_25: '25%',
  NONE: 'None',
};

export function MeritListTable({ entries }: Props) {
  return (
    <>
      {/* ── Mobile Card View ── */}
      <div className="space-y-2 md:hidden">
        {entries.map((e) => (
          <div key={e.id} className={`rounded-lg border bg-card p-3 space-y-1.5 ${!e.isPassed ? 'opacity-60' : ''}`}>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                {e.rank != null && e.rank <= 3 && (
                  <Trophy className={`h-4 w-4 shrink-0 ${e.rank === 1 ? 'text-yellow-500' : e.rank === 2 ? 'text-gray-400' : 'text-amber-700'}`} />
                )}
                <p className="text-sm font-medium truncate">{e.applicant.firstName} {e.applicant.lastName}</p>
              </div>
              <span className="font-mono font-bold text-sm shrink-0">#{e.rank ?? '—'}</span>
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span className={e.isPassed ? 'text-green-600 font-medium' : 'text-red-600'}>
                {Number(e.obtainedMarks)}/{Number(e.totalMarks)} ({Number(e.percentage).toFixed(1)}%)
              </span>
              <ApplicantStatusBadge status={e.applicant.status} />
              {e.applicant.scholarship && (
                <span className="flex items-center gap-0.5">
                  <Medal className={`h-3 w-3 ${tierColors[e.applicant.scholarship.tier] ?? ''}`} />
                  {tierLabels[e.applicant.scholarship.tier] ?? e.applicant.scholarship.tier}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ── Desktop Table View ── */}
      <div className="hidden md:block overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-18">Rank</TableHead>
            <TableHead>Name</TableHead>
            <TableHead className="hidden sm:table-cell">Application #</TableHead>
            <TableHead>Score</TableHead>
            <TableHead className="hidden md:table-cell">%</TableHead>
            <TableHead className="hidden md:table-cell">Grade</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden lg:table-cell">Scholarship</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((e) => (
            <TableRow key={e.id} className={!e.isPassed ? 'opacity-60' : ''}>
              <TableCell>
                <div className="flex items-center gap-1">
                  {e.rank != null && e.rank <= 3 ? (
                    <Trophy className={`h-4 w-4 ${e.rank === 1 ? 'text-yellow-500' : e.rank === 2 ? 'text-gray-400' : 'text-amber-700'}`} />
                  ) : null}
                  <span className="font-mono font-bold">#{e.rank ?? '—'}</span>
                </div>
              </TableCell>
              <TableCell className="font-medium">
                {e.applicant.firstName} {e.applicant.lastName}
              </TableCell>
              <TableCell className="hidden sm:table-cell font-mono text-xs">
                {e.applicant.applicationNumber ?? '—'}
              </TableCell>
              <TableCell>
                <span className={e.isPassed ? 'text-green-600 font-medium' : 'text-red-600'}>
                  {Number(e.obtainedMarks)}/{Number(e.totalMarks)}
                </span>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {Number(e.percentage).toFixed(1)}%
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {e.grade ?? '—'}
              </TableCell>
              <TableCell>
                <ApplicantStatusBadge status={e.applicant.status} />
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                {e.applicant.scholarship ? (
                  <div className="flex items-center gap-1">
                    <Medal className={`h-4 w-4 ${tierColors[e.applicant.scholarship.tier] ?? ''}`} />
                    <span className="text-sm">{tierLabels[e.applicant.scholarship.tier] ?? e.applicant.scholarship.tier}</span>
                  </div>
                ) : (
                  <span className="text-muted-foreground text-xs">—</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </div>
    </>
  );
}
