'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Printer, FileText, Users, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { EmptyState } from '@/components/shared';
import { DmcPrintTemplate } from '@/modules/reports/components/print/dmc-print-template';
import {
  getSectionsForClassAction,
  getSectionStudentsForDmcAction,
  getDmcDataAction,
  getBatchDmcDataAction,
} from '@/modules/reports/actions/result-term-fetch-actions';
import type { ResultTermSummary } from '@/modules/reports/queries/result-term-queries';
import type { DmcData } from '@/modules/reports/types/report-types';

type Props = { terms: ResultTermSummary[] };
type Section = { id: string; name: string };
type StudentItem = {
  studentId: string; name: string; rollNumber: string;
  rankInSection: number | null; overallPercentage: number;
  overallGrade: string | null; isOverallPassed: boolean;
};

export function DmcGeneratorClient({ terms }: Props) {
  const [isPending, startTransition] = useTransition();
  const [termId, setTermId] = useState('');
  const [sections, setSections] = useState<Section[]>([]);
  const [sectionId, setSectionId] = useState('');
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [dmcData, setDmcData] = useState<DmcData | null>(null);
  const [batchDmcs, setBatchDmcs] = useState<DmcData[]>([]);
  const [mode, setMode] = useState<'single' | 'batch' | null>(null);

  const selectedTerm = terms.find((t) => t.id === termId);

  function handleTermChange(id: string) {
    setTermId(id);
    setSections([]);
    setSectionId('');
    setStudents([]);
    setSelectedStudentId('');
    setDmcData(null);
    setBatchDmcs([]);
    setMode(null);

    if (!id) return;
    const term = terms.find((t) => t.id === id);
    if (!term) return;

    startTransition(async () => {
      const secs = await getSectionsForClassAction(term.class.id);
      setSections(secs);
    });
  }

  function handleSectionChange(id: string) {
    setSectionId(id);
    setStudents([]);
    setSelectedStudentId('');
    setDmcData(null);
    setBatchDmcs([]);
    setMode(null);

    if (!id || !termId) return;
    startTransition(async () => {
      const list = await getSectionStudentsForDmcAction(termId, id);
      setStudents(list);
    });
  }

  function handleLoadDmc(studentId: string) {
    setSelectedStudentId(studentId);
    setMode('single');
    setBatchDmcs([]);
    startTransition(async () => {
      const data = await getDmcDataAction(termId, studentId);
      if (!data) { toast.error('DMC data not found'); return; }
      setDmcData(data);
    });
  }

  function handleBatchLoad() {
    if (!sectionId) { toast.error('Select a section'); return; }
    setMode('batch');
    setDmcData(null);
    setSelectedStudentId('');
    startTransition(async () => {
      const list = await getBatchDmcDataAction(termId, sectionId);
      if (!list.length) { toast.error('No DMC data found for this section'); return; }
      setBatchDmcs(list);
    });
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label>Result Term</Label>
              <Select value={termId} onValueChange={handleTermChange}>
                <SelectTrigger><SelectValue placeholder="Select term" /></SelectTrigger>
                <SelectContent>
                  {terms.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name} — {t.class.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Section</Label>
              <Select value={sectionId} onValueChange={handleSectionChange} disabled={!sections.length}>
                <SelectTrigger><SelectValue placeholder="Select section" /></SelectTrigger>
                <SelectContent>
                  {sections.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end gap-2">
              <Button
                variant="outline"
                className="flex-1"
                disabled={!sectionId || isPending || !students.length}
                onClick={handleBatchLoad}
              >
                <Users className="mr-2 h-4 w-4" />
                Load Entire Section
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Student List */}
        <div className="space-y-2">
          {students.length === 0 ? (
            <p className="text-sm text-muted-foreground">Select a section to see students</p>
          ) : (
            students.map((s) => (
              <button
                key={s.studentId}
                className={`w-full text-left rounded-md border px-3 py-2.5 text-sm transition-colors hover:bg-accent ${
                  selectedStudentId === s.studentId ? 'bg-accent border-primary' : ''
                }`}
                onClick={() => handleLoadDmc(s.studentId)}
                disabled={isPending}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{s.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Roll #{s.rollNumber} · Rank {s.rankInSection ?? '—'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{s.overallPercentage.toFixed(1)}%</p>
                    <Badge variant={s.isOverallPassed ? 'default' : 'destructive'} className="text-xs">
                      {s.overallGrade ?? (s.isOverallPassed ? 'Pass' : 'Fail')}
                    </Badge>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        {/* DMC Preview */}
        <div className="space-y-4">
          {(dmcData || batchDmcs.length > 0) && (
            <div className="flex items-center justify-between no-print">
              <p className="text-sm text-muted-foreground">
                {mode === 'batch'
                  ? `${batchDmcs.length} DMCs loaded — will print all`
                  : 'Single DMC preview'}
              </p>
              <Button onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" /> Print
              </Button>
            </div>
          )}

          {isPending && (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              Loading DMC data...
            </div>
          )}

          {!isPending && !dmcData && batchDmcs.length === 0 && (
            <EmptyState
              icon={<FileText className="h-12 w-12 text-muted-foreground" />}
              title="No DMC loaded"
              description="Select a student from the list, or load the entire section"
            />
          )}

          {/* Single DMC */}
          {mode === 'single' && dmcData && !isPending && (
            <DmcPrintTemplate dmc={dmcData} />
          )}

          {/* Batch DMCs */}
          {mode === 'batch' && batchDmcs.length > 0 && !isPending && (
            <div className="space-y-0">
              {batchDmcs.map((dmc, i) => (
                <div key={dmc.student.rollNumber} className={i > 0 ? 'page-break' : ''}>
                  <DmcPrintTemplate dmc={dmc} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
