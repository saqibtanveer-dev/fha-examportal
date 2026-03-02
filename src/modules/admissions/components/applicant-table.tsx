'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  MoreHorizontal,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  UserPlus,
} from 'lucide-react';
import { ApplicantStatusBadge } from './campaign-status-badge';
import { makeDecisionAction, enrollApplicantAction } from '../admission-actions';
import { useInvalidateCache } from '@/lib/cache-utils';
import { Spinner } from '@/components/shared';

type ApplicantRow = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  applicationNumber: string | null;
  status: string;
  createdAt: string;
  result?: {
    obtainedMarks: number;
    totalMarks: number;
    percentage: number;
    rank: number | null;
    isPassed: boolean;
  } | null;
};

type Props = {
  applicants: ApplicantRow[];
  campaignId: string;
  onViewDetail?: (id: string) => void;
  onBulkAction?: (ids: string[], action: string) => void;
  classes?: { id: string; name: string }[];
  sections?: { id: string; name: string; classId: string }[];
};

export function ApplicantTable({
  applicants,
  campaignId,
  onViewDetail,
  onBulkAction,
  classes = [],
  sections = [],
}: Props) {
  const invalidate = useInvalidateCache();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selectedIds.size === applicants.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(applicants.map((a) => a.id)));
    }
  }

  function handleDecision(applicantId: string, decision: 'ACCEPTED' | 'REJECTED' | 'WAITLISTED') {
    startTransition(async () => {
      const result = await makeDecisionAction({ applicantId, decision });
      if (result.success) {
        toast.success(`Applicant ${decision.toLowerCase()}`);
        invalidate.afterDecision(campaignId);
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="space-y-2">
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-2 rounded-md border bg-muted/50 p-2 text-sm">
          <span className="font-medium">{selectedIds.size} selected</span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onBulkAction?.(Array.from(selectedIds), 'ACCEPTED')}
          >
            <CheckCircle className="mr-1 h-3 w-3" />Accept
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onBulkAction?.(Array.from(selectedIds), 'REJECTED')}
          >
            <XCircle className="mr-1 h-3 w-3" />Reject
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onBulkAction?.(Array.from(selectedIds), 'WAITLISTED')}
          >
            <Clock className="mr-1 h-3 w-3" />Waitlist
          </Button>
        </div>
      )}

      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <Checkbox
                  checked={selectedIds.size === applicants.length && applicants.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="hidden sm:table-cell">Application #</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Score</TableHead>
              <TableHead className="hidden lg:table-cell">Rank</TableHead>
              <TableHead className="w-[60px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {applicants.map((a) => (
              <TableRow key={a.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedIds.has(a.id)}
                    onCheckedChange={() => toggleSelect(a.id)}
                  />
                </TableCell>
                <TableCell>
                  <button
                    className="text-left font-medium hover:underline"
                    onClick={() => onViewDetail?.(a.id)}
                  >
                    {a.firstName} {a.lastName}
                  </button>
                  <p className="text-xs text-muted-foreground">{a.email}</p>
                </TableCell>
                <TableCell className="hidden sm:table-cell font-mono text-xs">
                  {a.applicationNumber ?? '—'}
                </TableCell>
                <TableCell>
                  <ApplicantStatusBadge status={a.status} />
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {a.result ? (
                    <span className={a.result.isPassed ? 'text-green-600' : 'text-red-600'}>
                      {a.result.obtainedMarks}/{a.result.totalMarks} ({Number(a.result.percentage).toFixed(1)}%)
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {a.result?.rank ? `#${a.result.rank}` : '—'}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onViewDetail?.(a.id)}>
                        <Eye className="mr-2 h-4 w-4" />View Details
                      </DropdownMenuItem>
                      {['GRADED', 'SHORTLISTED', 'WAITLISTED'].includes(a.status) && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDecision(a.id, 'ACCEPTED')}>
                            <CheckCircle className="mr-2 h-4 w-4 text-green-600" />Accept
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDecision(a.id, 'REJECTED')}>
                            <XCircle className="mr-2 h-4 w-4 text-red-600" />Reject
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDecision(a.id, 'WAITLISTED')}>
                            <Clock className="mr-2 h-4 w-4 text-yellow-600" />Waitlist
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
