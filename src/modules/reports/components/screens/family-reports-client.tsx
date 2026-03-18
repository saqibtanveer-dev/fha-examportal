'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Printer, GraduationCap, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

  const selectedChild = children.find((c) => c.studentId === selectedChildId);

  function handleChildChange(studentId: string) {
    setSelectedChildId(studentId);
    setTerms([]);
    setSelectedTermId('');
    setDmcData(null);
    if (!studentId) return;
    startTransition(async () => {
      try {
        const t = await getPublishedResultTermsForStudentAction(studentId);
        setTerms(t);
      } catch {
        toast.error('Failed to load result terms. Please try again.');
      }
    });
  }

  function handleTermChange(termId: string) {
    setSelectedTermId(termId);
    setDmcData(null);
    if (!termId || !selectedChildId) return;
    startTransition(async () => {
      try {
        const data = await getStudentDmcAction(termId, selectedChildId);
        if (!data) { toast.error('DMC not available'); return; }
        setDmcData(data);
      } catch {
        toast.error('Failed to load DMC. Please try again.');
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
        <CardContent className="pt-4 pb-4">
          <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Select Child</Label>
              <Select value={selectedChildId} onValueChange={handleChildChange}>
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
                disabled={!terms.length}
              >
                <SelectTrigger><SelectValue placeholder="Select result term" /></SelectTrigger>
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

          {selectedChildId && terms.length === 0 && !isPending && (
            <p className="mt-3 text-sm text-muted-foreground">
              No published results available for {selectedChild?.name} yet.
            </p>
          )}
        </CardContent>
      </Card>

      {/* DMC Preview */}
      {isPending && (
        <div className="flex items-center justify-center py-10 sm:py-12 text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Loading...
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
          <div className="no-print flex justify-between items-center">
            <div>
              <p className="font-medium">{selectedChild?.name}</p>
              <p className="text-sm text-muted-foreground">
                {dmcData.resultTerm.name} — {dmcData.academicSession}
              </p>
            </div>
            <Button onClick={() => window.print()}>
              <Printer className="mr-2 h-4 w-4" /> Print DMC
            </Button>
          </div>
          <DmcPrintTemplate dmc={dmcData} />
        </>
      )}
    </div>
  );
}
