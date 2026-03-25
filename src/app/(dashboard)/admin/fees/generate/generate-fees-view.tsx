'use client';

import { useState, useTransition, useCallback, useEffect, useRef } from 'react';
import { useInvalidateCache } from '@/lib/cache-utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { PageHeader } from '@/components/shared';
import { Spinner } from '@/components/shared';
import { FamilySearchCombobox } from '@/modules/fees/components/family-search-combobox';
import { generateFeesAction } from '@/modules/fees/fee-generation-actions';
import { applyLateFeesAction } from '@/modules/fees/fee-management-actions';
import { toast } from 'sonner';
import { AlertTriangle, Zap, Search, X, Users, UserPlus, Loader2 } from 'lucide-react';

type SectionOption = { id: string; name: string };
type ClassOption = { id: string; name: string; grade: number; sections?: SectionOption[] };
type SelectedStudent = { id: string; name: string; rollNumber: string; className: string };
type FeeCategoryOption = { id: string; name: string; frequency: 'MONTHLY' | 'TERM' | 'ANNUAL' | 'ONE_TIME' };

type Props = {
  classes: ClassOption[];
  categories: FeeCategoryOption[];
  dueDayOfMonth: number;
};

export function GenerateFeesView({ classes, categories, dueDayOfMonth }: Props) {
  const [isGenerating, startGenerating] = useTransition();
  const [isApplyingLateFees, startApplyingLateFees] = useTransition();
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedSection, setSelectedSection] = useState('all');
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [dueDate, setDueDate] = useState(() => {
    const now = new Date();
    const day = Math.min(dueDayOfMonth, 28);
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  });
  const [genMode, setGenMode] = useState<'bulk' | 'specific' | 'family'>('bulk');
  const [selectedStudents, setSelectedStudents] = useState<SelectedStudent[]>([]);
  const [selectedFamily, setSelectedFamily] = useState<{ id: string; label: string } | null>(null);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [studentResults, setStudentResults] = useState<SelectedStudent[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const invalidate = useInvalidateCache();

  const selectedClassObj = classes.find((c) => c.id === selectedClass);
  const sections = selectedClassObj?.sections ?? [];

  function handleClassChange(value: string) {
    setSelectedClass(value);
    setSelectedSection('all');
  }

  const searchStudents = useCallback(async (query: string) => {
    if (query.trim().length < 2) { setStudentResults([]); return; }
    setIsSearching(true);
    try {
      const { searchStudentsForLinkingAction } = await import('@/modules/family/family-search-actions');
      const result = await searchStudentsForLinkingAction(query);
      if (result.success && result.data) {
        const selectedIds = new Set(selectedStudents.map((s) => s.id));
        setStudentResults(
          result.data
            .filter((s) => !selectedIds.has(s.studentProfileId))
            .map((s) => ({ id: s.studentProfileId, name: s.studentName, rollNumber: s.rollNumber, className: s.className })),
        );
      }
    } catch { setStudentResults([]); }
    setIsSearching(false);
  }, [selectedStudents]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (studentSearch.trim().length >= 2) {
      debounceRef.current = setTimeout(() => searchStudents(studentSearch), 400);
    } else { setStudentResults([]); }
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [studentSearch, searchStudents]);

  function handleGenerate() {
    startGenerating(async () => {
      const result = await generateFeesAction({
        generatedForMonth: month,
        classId: selectedClass === 'all' ? undefined : selectedClass,
        sectionId: selectedSection === 'all' ? undefined : selectedSection,
        dueDate,
        studentProfileIds: genMode === 'specific' && selectedStudents.length > 0
          ? selectedStudents.map((s) => s.id)
          : undefined,
        familyProfileId: genMode === 'family' ? (selectedFamily?.id ?? undefined) : undefined,
        categoryIds: selectedCategoryIds.length > 0 ? selectedCategoryIds : undefined,
      });

      if (result.success) {
        if (result.data?.queued) {
          toast.success('Fee generation queued. Fees will be generated in the background.');
        } else {
          toast.success(`Fee generation completed. Generated: ${result.data?.generated ?? 0}, Skipped: ${result.data?.skipped ?? 0}`);
        }
        await invalidate.afterFeeMutation();
      } else {
        toast.error(result.error ?? 'Failed to generate fees');
      }
    });
  }

  function handleApplyLateFees() {
    startApplyingLateFees(async () => {
      const result = await applyLateFeesAction();
      if (result.success) {
        toast.success(`Late fees applied to ${result.data?.updated ?? 0} assignments`);
        await invalidate.afterFeeMutation();
      } else {
        toast.error(result.error ?? 'Failed to apply late fees');
      }
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Generate Fees"
        description="Generate monthly fee assignments for students."
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Fees', href: '/admin/fees' },
          { label: 'Generate' },
        ]}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />Generate Monthly Fees
            </CardTitle>
            <CardDescription>
              Creates fee assignments for all active students based on configured fee structures.
              Students who already have fees for the selected month are automatically skipped.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Month</Label>
                <Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} disabled={isGenerating} />
              </div>
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} disabled={isGenerating} />
              </div>
            </div>

            {/* Generation mode toggle */}
            <div className="grid gap-2 grid-cols-1 sm:grid-cols-3">
              <Button size="sm" className="w-full" variant={genMode === 'bulk' ? 'default' : 'outline'} onClick={() => { setGenMode('bulk'); setSelectedStudents([]); setSelectedFamily(null); }}>
                <Users className="mr-1 h-3.5 w-3.5" /> Bulk (Class/Section)
              </Button>
              <Button size="sm" className="w-full" variant={genMode === 'specific' ? 'default' : 'outline'} onClick={() => { setGenMode('specific'); setSelectedFamily(null); }}>
                <UserPlus className="mr-1 h-3.5 w-3.5" /> Specific Students
              </Button>
              <Button size="sm" className="w-full" variant={genMode === 'family' ? 'default' : 'outline'} onClick={() => { setGenMode('family'); setSelectedStudents([]); }}>
                <Users className="mr-1 h-3.5 w-3.5" /> Single Family
              </Button>
            </div>

            {genMode === 'bulk' ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Class Filter</Label>
                  <Select value={selectedClass} onValueChange={handleClassChange} disabled={isGenerating}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Classes</SelectItem>
                      {classes.sort((a, b) => a.grade - b.grade).map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {selectedClass !== 'all' && sections.length > 0 && (
                  <div className="space-y-2">
                    <Label>Section Filter</Label>
                    <Select value={selectedSection} onValueChange={setSelectedSection} disabled={isGenerating}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Sections</SelectItem>
                        {sections.map((s) => (
                          <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            ) : genMode === 'specific' ? (
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search students by name, roll#, reg#..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    disabled={isGenerating}
                    className="pl-9"
                  />
                  {isSearching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />}
                </div>
                {studentResults.length > 0 && (
                  <div className="max-h-40 overflow-y-auto rounded-md border divide-y">
                    {studentResults.map((s) => (
                      <button key={s.id} type="button" className="flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-accent text-left"
                        onClick={() => { setSelectedStudents((p) => [...p, s]); setStudentResults((p) => p.filter((r) => r.id !== s.id)); setStudentSearch(''); }}>
                        <span>{s.name} <span className="text-muted-foreground">({s.className}, Roll: {s.rollNumber})</span></span>
                        <Badge variant="outline" className="text-xs shrink-0 ml-2">+ Add</Badge>
                      </button>
                    ))}
                  </div>
                )}
                {selectedStudents.length > 0 && (
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">{selectedStudents.length} student(s) selected</Label>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedStudents.map((s) => (
                        <Badge key={s.id} variant="secondary" className="gap-1 pr-1">
                          {s.name}
                          <button type="button" onClick={() => setSelectedStudents((p) => p.filter((x) => x.id !== s.id))} className="ml-0.5 rounded-full hover:bg-muted-foreground/20 p-0.5">
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {selectedStudents.length === 0 && studentSearch.length < 2 && (
                  <p className="text-xs text-muted-foreground">Search and select specific students (e.g. late admissions) to generate fees only for them.</p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <FamilySearchCombobox
                  value={selectedFamily?.id ?? ''}
                  selectedLabel={selectedFamily?.label}
                  disabled={isGenerating}
                  onSelect={(family) => {
                    setSelectedFamily({
                      id: family.familyProfileId,
                      label: `${family.parentName} (${family.relationship}) — ${family.childrenCount} child(ren)`,
                    });
                  }}
                  onClear={() => setSelectedFamily(null)}
                />
                {!selectedFamily && (
                  <p className="text-xs text-muted-foreground">Select one family to generate fees only for that family.</p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label>Categories (optional)</Label>
              <p className="text-xs text-muted-foreground">Leave empty to include all active categories. Use this to generate only annual fund/term/selected categories.</p>
              <div className="max-h-36 overflow-y-auto rounded-md border p-2 grid gap-1">
                {categories.map((category) => {
                  const checked = selectedCategoryIds.includes(category.id);
                  return (
                    <label key={category.id} className="flex items-center justify-between rounded px-2 py-1 text-sm hover:bg-muted/40">
                      <span>{category.name} <span className="text-xs text-muted-foreground">({category.frequency})</span></span>
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={isGenerating}
                        onChange={(event) => {
                          const isChecked = event.target.checked;
                          setSelectedCategoryIds((prev) => {
                            if (isChecked) return [...prev, category.id];
                            return prev.filter((id) => id !== category.id);
                          });
                        }}
                      />
                    </label>
                  );
                })}
              </div>
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  disabled={isGenerating || (genMode === 'specific' && selectedStudents.length === 0) || (genMode === 'family' && !selectedFamily)}
                  className="w-full"
                >
                  {isGenerating && <Spinner size="sm" className="mr-2" />}
                  Generate Fees
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Generate fees for {month}?</AlertDialogTitle>
                  <AlertDialogDescription>
                    {genMode === 'specific'
                      ? `This will create fee assignments for ${selectedStudents.length} selected student(s). Students who already have fees for this month will be skipped.`
                      : genMode === 'family'
                        ? `This will generate fees only for the selected family. Students already generated for this month will be skipped.`
                        : `This will create fee assignments for all active students${selectedClass !== 'all' ? ` in ${selectedClassObj?.name ?? 'the selected class'}` : ''}${selectedSection !== 'all' ? ` (${sections.find((s) => s.id === selectedSection)?.name ?? 'selected section'})` : ''}. Students who already have fees for this month will be skipped.`}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleGenerate}>Generate</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />Apply Late Fees
            </CardTitle>
            <CardDescription>
              Calculates and applies late fees to all overdue assignments based on configured
              late fee per day, grace period, and maximum cap.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This will scan all pending/partial/overdue assignments past their due date
              and apply the appropriate late fee charges.
            </p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  disabled={isApplyingLateFees}
                  variant="outline"
                  className="w-full"
                >
                  {isApplyingLateFees && <Spinner size="sm" className="mr-2" />}
                  Apply Late Fees Now
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Apply late fees?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will calculate and add late fee charges to all overdue assignments
                    based on the configured rate, grace period, and maximum cap. This action
                    modifies fee amounts and cannot be easily reversed.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleApplyLateFees}>Apply</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
