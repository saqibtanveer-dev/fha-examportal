'use client';

import { useState, useTransition, useMemo } from 'react';
import { toast } from 'sonner';
import { Printer, FileText, Users, ChevronRight, Loader2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  const [studentSearch, setStudentSearch] = useState('');

  const selectedTerm = terms.find((t) => t.id === termId);

  const filteredStudents = useMemo(() => {
    if (!studentSearch.trim()) return students;
    const q = studentSearch.toLowerCase();
    return students.filter((s) =>
      s.name.toLowerCase().includes(q) || s.rollNumber.toLowerCase().includes(q),
    );
  }, [students, studentSearch]);

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
          <div className="grid gap-3 sm:gap-4 sm:grid-cols-3">
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
                className="w-full sm:flex-1"
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

      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[280px_1fr] lg:gap-6">
        {/* Student List */}
        {students.length === 0 ? (
          <p className="text-sm text-muted-foreground">Select a section to see students</p>
        ) : (
          <div className="space-y-2">
            {students.length > 8 && (
              <div className="relative no-print">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search by name or roll#"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="pl-9 h-8 text-xs"
                />
              </div>
            )}
            <div className="flex flex-col gap-1.5 max-h-[50vh] lg:max-h-[70vh] overflow-y-auto">
              {filteredStudents.map((s) => (
                <button
                  key={s.studentId}
                  className={`w-full text-left rounded-md border px-3 py-2.5 text-sm transition-colors hover:bg-accent active:bg-accent ${
                    selectedStudentId === s.studentId ? 'bg-accent border-primary ring-1 ring-primary' : ''
                  }`}
                  onClick={() => handleLoadDmc(s.studentId)}
                  disabled={isPending}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium truncate">{s.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Roll #{s.rollNumber} · Rank {s.rankInSection ?? '—'}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-semibold">{s.overallPercentage.toFixed(1)}%</p>
                      <Badge variant={s.isOverallPassed ? 'default' : 'destructive'} className="text-xs">
                        {s.overallGrade ?? (s.isOverallPassed ? 'Pass' : 'Fail')}
                      </Badge>
                    </div>
                  </div>
                </button>
              ))}
              {filteredStudents.length === 0 && studentSearch && (
                <p className="text-xs text-muted-foreground text-center py-3">No students match "{studentSearch}"</p>
              )}
            </div>
          </div>
        )}

        {/* DMC Preview */}
        <div className="space-y-4 min-w-0">
          {(dmcData || batchDmcs.length > 0) && (
            <div className="flex items-center justify-between gap-2 no-print">
              <p className="text-sm text-muted-foreground truncate">
                {mode === 'batch'
                  ? `${batchDmcs.length} DMCs loaded — will print all`
                  : 'Single DMC preview'}
              </p>
              <Button onClick={handlePrint} size="sm" className="shrink-0">
                <Printer className="mr-2 h-4 w-4" /> Print
              </Button>
            </div>
          )}

          {isPending && (
            <div className="flex items-center justify-center py-12 sm:py-16 text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
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
                <div
                  key={`${dmc.student.rollNumber}-${i}`}
                  className={i > 0 ? 'page-break' : ''}
                >
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
