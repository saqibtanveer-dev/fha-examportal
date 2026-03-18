'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Printer, GraduationCap, FileText, Loader2, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { EmptyState } from '@/components/shared';
import { DmcPrintTemplate } from '@/modules/reports/components/print/dmc-print-template';
import {
  getPublishedResultTermsForStudentAction,
  getStudentDmcAction,
} from '@/modules/reports/actions/result-term-fetch-actions';
import type { DmcData } from '@/modules/reports/types/report-types';
import { format } from 'date-fns';

type Child = {
  studentId: string;
  name: string;
  className: string;
  sectionName: string;
  rollNumber: string;
  classId: string;
};

type Term = {
  id: string;
  name: string;
  publishedAt: Date | null;
  academicSession: { name: string };
};

type Props = { children: Child[] };

export function FamilyReportsClient({ children }: Props) {
  const [isPending, startTransition] = useTransition();
  const [selectedChildId, setSelectedChildId] = useState('');
  const [terms, setTerms] = useState<Term[]>([]);
  const [selectedTermId, setSelectedTermId] = useState('');
  const [dmcData, setDmcData] = useState<DmcData | null>(null);
  const [loadingStage, setLoadingStage] = useState<'terms' | 'dmc' | null>(null);

  const selectedChild = children.find((c) => c.studentId === selectedChildId);

  function handleChildChange(studentId: string) {
    setSelectedChildId(studentId);
    setTerms([]);
    setSelectedTermId('');
    setDmcData(null);
    if (!studentId) return;
    setLoadingStage('terms');
    startTransition(async () => {
      try {
        const t = await getPublishedResultTermsForStudentAction(studentId);
        setTerms(t);
      } catch {
        toast.error('Failed to load result terms. Please try again.');
      } finally {
        setLoadingStage(null);
      }
    });
  }

  function handleTermChange(termId: string) {
    setSelectedTermId(termId);
    setDmcData(null);
    if (!termId || !selectedChildId) return;
    setLoadingStage('dmc');
    startTransition(async () => {
      try {
        const data = await getStudentDmcAction(termId, selectedChildId);
        if (!data) { toast.error('DMC not available'); return; }
        setDmcData(data);
      } catch {
        toast.error('Failed to load DMC. Please try again.');
      } finally {
        setLoadingStage(null);
      }
    });
  }

  if (children.length === 0) {
    return (
      <EmptyState
        icon={<GraduationCap className="h-12 w-12 text-muted-foreground" />}
        title="No linked children"
        description="Contact school admin to link your children to your account"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Child + Term Selectors */}
      <Card>
        <CardContent className="pt-4 pb-4 space-y-4">
          <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Select Child</Label>
              <Select value={selectedChildId} onValueChange={handleChildChange} disabled={isPending}>
                <SelectTrigger><SelectValue placeholder="Select child" /></SelectTrigger>
                <SelectContent>
                  {children.map((c) => (
                    <SelectItem key={c.studentId} value={c.studentId}>
                      {c.name} — {c.className} {c.sectionName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Result Term</Label>
              <Select
                value={selectedTermId}
                onValueChange={handleTermChange}
                disabled={!terms.length || isPending}
              >
                <SelectTrigger>
                  {loadingStage === 'terms' ? (
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading results…
                    </span>
                  ) : (
                    <SelectValue placeholder="Select result term" />
                  )}
                </SelectTrigger>
                <SelectContent>
                  {terms.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name} — {t.academicSession.name}
                      {t.publishedAt ? ` (${format(t.publishedAt, 'dd MMM')})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Selected child info strip */}
          {selectedChild && (
            <div className="flex items-center gap-3 rounded-md bg-muted/50 px-3 py-2 text-sm">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-xs">
                {selectedChild.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
              </div>
              <div className="min-w-0">
                <p className="font-medium truncate">{selectedChild.name}</p>
                <p className="text-xs text-muted-foreground">
                  {selectedChild.className} · {selectedChild.sectionName} · Roll #{selectedChild.rollNumber}
                </p>
              </div>
            </div>
          )}

          {selectedChildId && terms.length === 0 && !isPending && (
            <div className="flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-800/40 dark:bg-amber-900/20 dark:text-amber-300">
              <BookOpen className="h-4 w-4 shrink-0" />
              No published results available for {selectedChild?.name} yet.
            </div>
          )}
        </CardContent>
      </Card>

      {/* DMC Loading Skeleton */}
      {loadingStage === 'dmc' && (
        <div className="space-y-3 animate-pulse">
          <div className="h-6 w-48 rounded bg-muted" />
          <div className="h-4 w-72 rounded bg-muted" />
          <div className="h-64 rounded-lg bg-muted" />
        </div>
      )}

      {!isPending && !dmcData && selectedTermId && (
        <EmptyState
          icon={<FileText className="h-12 w-12 text-muted-foreground" />}
          title="DMC not available"
          description="Results data could not be loaded"
        />
      )}

      {dmcData && !isPending && (
        <>
          <div className="no-print flex items-center justify-between rounded-lg border bg-card px-4 py-3 gap-3">
            <div className="min-w-0">
              <p className="font-semibold text-sm truncate">{selectedChild?.name}</p>
              <p className="text-xs text-muted-foreground">
                {dmcData.resultTerm.name} — {dmcData.academicSession}
              </p>
            </div>
            <Button onClick={() => window.print()} className="shrink-0">
              <Printer className="mr-2 h-4 w-4" /> Print DMC
            </Button>
          </div>
          <DmcPrintTemplate dmc={dmcData} />
        </>
      )}
    </div>
  );
}
