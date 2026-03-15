'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Save, Loader2, SaveAll } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { updateStudentRemarksAction, batchUpdateStudentRemarksAction } from '@/modules/reports/actions/consolidation-actions';
import { getSectionsForClassAction, getSectionStudentsForDmcAction } from '@/modules/reports/actions/result-term-fetch-actions';
import type { ResultTermSummary } from '@/modules/reports/queries/result-term-queries';

type Props = { terms: ResultTermSummary[] };

type StudentRow = {
  studentId: string;
  name: string;
  rollNumber: string;
  rankInSection: number | null;
  overallPercentage: number;
  overallGrade: string | null;
  isOverallPassed: boolean;
  classTeacherRemarks?: string;
  principalRemarks?: string;
};

type Section = { id: string; name: string };

export function RemarksEntryClient({ terms }: Props) {
  const [isPending, startTransition] = useTransition();
  const [selectedTermId, setSelectedTermId] = useState('');
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [remarks, setRemarks] = useState<Record<string, { teacher: string; principal: string }>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [isBatchSaving, setIsBatchSaving] = useState(false);

  const selectedTerm = terms.find((t) => t.id === selectedTermId);
  const computedTerms = terms.filter((t) => t._count.consolidatedResults > 0);

  function handleTermChange(termId: string) {
    setSelectedTermId(termId);
    setSelectedSectionId('');
    setStudents([]);
    const term = terms.find((t) => t.id === termId);
    if (!term) return;
    startTransition(async () => {
      const res = await getSectionsForClassAction(term.class.id);
      setSections(res ?? []);
    });
  }

  function handleSectionChange(sectionId: string) {
    setSelectedSectionId(sectionId);
    if (!selectedTermId) return;
    startTransition(async () => {
      const res = await getSectionStudentsForDmcAction(selectedTermId, sectionId);
      setStudents(res ?? []);
      const initial: Record<string, { teacher: string; principal: string }> = {};
      for (const s of res ?? []) {
        initial[s.studentId] = {
          teacher: s.classTeacherRemarks ?? '',
          principal: s.principalRemarks ?? '',
        };
      }
      setRemarks(initial);
    });
  }

  function handleSaveRemarks(studentId: string) {
    const r = remarks[studentId];
    if (!r) return;
    setSavingId(studentId);
    startTransition(async () => {
      const res = await updateStudentRemarksAction({
        resultTermId: selectedTermId,
        studentId,
        classTeacherRemarks: r.teacher || null,
        principalRemarks: r.principal || null,
      });
      if (res.success) toast.success('Remarks saved');
      else toast.error(res.error ?? 'Failed to save remarks');
      setSavingId(null);
    });
  }

  function updateRemark(studentId: string, field: 'teacher' | 'principal', value: string) {
    setRemarks((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId]!, [field]: value },
    }));
  }

  function handleBatchSave() {
    const remarksToSave = Object.entries(remarks)
      .filter(([, r]) => r.teacher.trim() || r.principal.trim())
      .map(([studentId, r]) => ({
        studentId,
        classTeacherRemarks: r.teacher || null,
        principalRemarks: r.principal || null,
      }));

    if (remarksToSave.length === 0) {
      toast.error('No remarks to save — enter remarks for at least one student');
      return;
    }

    setIsBatchSaving(true);
    startTransition(async () => {
      const res = await batchUpdateStudentRemarksAction({
        resultTermId: selectedTermId,
        remarks: remarksToSave,
      });
      if (res.success) {
        toast.success(`Remarks saved for ${res.data?.updated ?? remarksToSave.length} students`);
      } else {
        toast.error(res.error ?? 'Failed to save remarks');
      }
      setIsBatchSaving(false);
    });
  }

  const filledRemarksCount = Object.values(remarks).filter(
    (r) => r.teacher.trim() || r.principal.trim(),
  ).length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Student Remarks Entry</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Result Term *</Label>
              <Select value={selectedTermId} onValueChange={handleTermChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a computed term" />
                </SelectTrigger>
                <SelectContent>
                  {computedTerms.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name} — {t.class.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Section *</Label>
              <Select value={selectedSectionId} onValueChange={handleSectionChange} disabled={!selectedTermId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select section" />
                </SelectTrigger>
                <SelectContent>
                  {sections.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {students.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h3 className="font-semibold text-sm">
              {students.length} students — add class teacher &amp; principal remarks
            </h3>
            <Button
              onClick={handleBatchSave}
              disabled={isPending || isBatchSaving || filledRemarksCount === 0}
              size="sm"
            >
              {isBatchSaving ? (
                <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Saving All...</>
              ) : (
                <><SaveAll className="mr-1.5 h-3.5 w-3.5" /> Save All ({filledRemarksCount})</>
              )}
            </Button>
          </div>
          {students.map((s) => (
            <Card key={s.studentId}>
              <CardContent className="py-4 space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div>
                    <p className="font-medium text-sm">
                      #{s.rankInSection ?? '-'} {s.name}
                      <span className="text-muted-foreground ml-2 text-xs">Roll: {s.rollNumber}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {s.overallPercentage.toFixed(1)}% · {s.overallGrade}
                    </p>
                  </div>
                  <Badge variant={s.isOverallPassed ? 'default' : 'destructive'}>
                    {s.isOverallPassed ? 'PASS' : 'FAIL'}
                  </Badge>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Class Teacher Remarks</Label>
                    <Textarea
                      rows={2}
                      placeholder="e.g. Excellent performance, keep it up"
                      value={remarks[s.studentId]?.teacher ?? ''}
                      onChange={(e) => updateRemark(s.studentId, 'teacher', e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Principal Remarks</Label>
                    <Textarea
                      rows={2}
                      placeholder="Optional"
                      value={remarks[s.studentId]?.principal ?? ''}
                      onChange={(e) => updateRemark(s.studentId, 'principal', e.target.value)}
                    />
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleSaveRemarks(s.studentId)}
                  disabled={isPending && savingId === s.studentId}
                >
                  {savingId === s.studentId ? (
                    <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Saving...</>
                  ) : (
                    <><Save className="mr-1.5 h-3.5 w-3.5" /> Save Remarks</>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedSectionId && students.length === 0 && !isPending && (
        <p className="text-sm text-muted-foreground text-center py-8">
          No consolidated results found for this section. Run consolidation first.
        </p>
      )}
    </div>
  );
}
