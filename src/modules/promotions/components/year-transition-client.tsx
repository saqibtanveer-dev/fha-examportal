'use client';

import { useState, useTransition, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Spinner } from '@/components/shared';
import { executeYearTransitionAction, undoYearTransitionAction } from '@/modules/promotions/promotion-actions';
import { toast } from 'sonner';
import {
  ArrowRight,
  GraduationCap,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Users,
  ArrowUpCircle,
  XCircle,
} from 'lucide-react';
import type { ClassWithStudents } from '@/modules/promotions/promotion-queries';

type AcademicSession = {
  id: string;
  name: string;
  isCurrent: boolean;
  _count: { exams: number };
};

type PromotionSummary = Record<string, number>;

type Props = {
  classes: ClassWithStudents[];
  sessions: AcademicSession[];
  promotionSummary: PromotionSummary | null;
  currentSessionId: string | null;
  transitionDone: boolean;
};

type StudentAction = 'PROMOTE' | 'HOLD_BACK' | 'GRADUATE';

type StudentEntry = {
  profileId: string;
  name: string;
  rollNumber: string;
  sectionName: string;
  sectionId: string;
  action: StudentAction;
  toSectionId?: string;
};

type ClassConfig = {
  fromClassId: string;
  fromClassName: string;
  fromGrade: number;
  toClassId?: string;
  toClassName?: string;
  toSections: { id: string; name: string }[];
  defaultSectionId?: string;
  isHighestGrade: boolean;
  students: StudentEntry[];
};

export function YearTransitionClient({
  classes: initialClasses,
  sessions,
  promotionSummary,
  currentSessionId,
  transitionDone,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState<'configure' | 'review' | 'done'>(
    transitionDone ? 'done' : 'configure',
  );
  const [selectedSessionId, setSelectedSessionId] = useState(currentSessionId ?? '');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [undoConfirmOpen, setUndoConfirmOpen] = useState(false);

  // Build class configs — figure out next class for each
  const highestGrade = Math.max(...initialClasses.map((c) => c.grade));

  const classConfigs = useMemo(() => {
    return initialClasses
      .filter((cls) => cls.studentCount > 0)
      .map((cls): ClassConfig => {
        const isHighest = cls.grade === highestGrade;
        const nextClass = initialClasses.find((c) => c.grade === cls.grade + 1);

        return {
          fromClassId: cls.id,
          fromClassName: cls.name,
          fromGrade: cls.grade,
          toClassId: isHighest ? undefined : nextClass?.id,
          toClassName: isHighest ? undefined : nextClass?.name,
          toSections: isHighest ? [] : nextClass?.sections ?? [],
          defaultSectionId: isHighest ? undefined : nextClass?.sections[0]?.id,
          isHighestGrade: isHighest,
          students: cls.students.map((s) => ({
            profileId: s.profileId,
            name: `${s.firstName} ${s.lastName}`,
            rollNumber: s.rollNumber,
            sectionName: s.sectionName,
            sectionId: s.sectionId,
            action: isHighest ? ('GRADUATE' as const) : ('PROMOTE' as const),
          })),
        };
      });
  }, [initialClasses, highestGrade]);

  const [configs, setConfigs] = useState<ClassConfig[]>(classConfigs);

  // Summary counts
  const summary = useMemo(() => {
    const s = { promote: 0, graduate: 0, holdBack: 0, total: 0 };
    for (const cfg of configs) {
      for (const st of cfg.students) {
        if (st.action === 'PROMOTE') s.promote++;
        else if (st.action === 'GRADUATE') s.graduate++;
        else if (st.action === 'HOLD_BACK') s.holdBack++;
        s.total++;
      }
    }
    return s;
  }, [configs]);

  function updateStudentAction(
    classIdx: number,
    studentIdx: number,
    action: StudentAction,
  ) {
    setConfigs((prev) => {
      const next = [...prev];
      const cls = { ...next[classIdx]! };
      const students = [...cls.students];
      students[studentIdx] = { ...students[studentIdx]!, action };
      cls.students = students;
      next[classIdx] = cls;
      return next;
    });
  }

  function updateStudentSection(
    classIdx: number,
    studentIdx: number,
    sectionId: string,
  ) {
    setConfigs((prev) => {
      const next = [...prev];
      const cls = { ...next[classIdx]! };
      const students = [...cls.students];
      students[studentIdx] = { ...students[studentIdx]!, toSectionId: sectionId };
      cls.students = students;
      next[classIdx] = cls;
      return next;
    });
  }

  function updateDefaultSection(classIdx: number, sectionId: string) {
    setConfigs((prev) => {
      const next = [...prev];
      next[classIdx] = { ...next[classIdx]!, defaultSectionId: sectionId };
      return next;
    });
  }

  function setAllStudentsAction(classIdx: number, action: StudentAction) {
    setConfigs((prev) => {
      const next = [...prev];
      const cls = { ...next[classIdx]! };
      cls.students = cls.students.map((s) => ({ ...s, action }));
      next[classIdx] = cls;
      return next;
    });
  }

  function handleExecute() {
    if (!selectedSessionId) {
      toast.error('Select an academic session first');
      return;
    }

    startTransition(async () => {
      const input = {
        academicSessionId: selectedSessionId,
        promotions: configs.map((cfg) => ({
          fromClassId: cfg.fromClassId,
          toClassId: cfg.toClassId,
          defaultSectionId: cfg.defaultSectionId,
          entries: cfg.students.map((s) => ({
            studentProfileId: s.profileId,
            action: s.action,
            toSectionId: s.toSectionId,
          })),
        })),
      };

      const result = await executeYearTransitionAction(input);
      if (result.success) {
        toast.success(
          `Year transition complete! ${result.data!.promoted} promoted, ${result.data!.graduated} graduated, ${result.data!.heldBack} held back`,
        );
        setStep('done');
        router.refresh();
      } else {
        toast.error(result.error ?? 'Failed to execute transition');
      }
      setConfirmOpen(false);
    });
  }

  function handleUndo() {
    if (!selectedSessionId && !currentSessionId) return;
    const sessionId = selectedSessionId || currentSessionId!;

    startTransition(async () => {
      const result = await undoYearTransitionAction(sessionId);
      if (result.success) {
        toast.success('Year transition undone successfully');
        setStep('configure');
        router.refresh();
      } else {
        toast.error(result.error ?? 'Failed to undo');
      }
      setUndoConfirmOpen(false);
    });
  }

  // ============================
  // DONE STATE
  // ============================
  if (step === 'done' && transitionDone && promotionSummary) {
    return (
      <div className="space-y-6">
        <Card className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
              <CheckCircle2 className="h-5 w-5" />
              Year Transition Completed
            </CardTitle>
            <CardDescription>
              The year transition has already been executed for the current session.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-4">
              <SummaryCard
                label="Promoted"
                count={promotionSummary.PROMOTED ?? 0}
                icon={<ArrowUpCircle className="h-5 w-5 text-blue-500" />}
              />
              <SummaryCard
                label="Graduated"
                count={promotionSummary.GRADUATED ?? 0}
                icon={<GraduationCap className="h-5 w-5 text-green-500" />}
              />
              <SummaryCard
                label="Held Back"
                count={promotionSummary.HELD_BACK ?? 0}
                icon={<XCircle className="h-5 w-5 text-orange-500" />}
              />
              <SummaryCard
                label="Total"
                count={promotionSummary.total ?? 0}
                icon={<Users className="h-5 w-5 text-gray-500" />}
              />
            </div>

            <div className="mt-6">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setUndoConfirmOpen(true)}
                disabled={isPending}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Undo Year Transition
              </Button>
              <p className="mt-1 text-xs text-muted-foreground">
                This will revert all students to their previous classes and re-activate graduated students.
              </p>
            </div>
          </CardContent>
        </Card>

        <AlertDialog open={undoConfirmOpen} onOpenChange={setUndoConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Undo Year Transition?
              </AlertDialogTitle>
              <AlertDialogDescription>
                This will revert ALL student promotions, graduations, and hold-backs. Students will be moved
                back to their original classes. This action should only be used if the transition was done in error.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleUndo}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isPending ? <Spinner size="sm" className="mr-2" /> : null}
                Yes, Undo Everything
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  // ============================
  // CONFIGURE / REVIEW STATE
  // ============================
  return (
    <div className="space-y-6">
      {/* Session Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Academic Session</CardTitle>
          <CardDescription>
            Select the ending academic session. Students will be promoted for the transition out of this session.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedSessionId} onValueChange={setSelectedSessionId}>
            <SelectTrigger className="w-full max-w-sm">
              <SelectValue placeholder="Select academic session" />
            </SelectTrigger>
            <SelectContent>
              {sessions.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name} {s.isCurrent ? '(Current)' : ''} — {s._count.exams} exams
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Summary Bar */}
      <div className="grid gap-4 sm:grid-cols-4">
        <SummaryCard
          label="To Promote"
          count={summary.promote}
          icon={<ArrowUpCircle className="h-5 w-5 text-blue-500" />}
        />
        <SummaryCard
          label="To Graduate"
          count={summary.graduate}
          icon={<GraduationCap className="h-5 w-5 text-green-500" />}
        />
        <SummaryCard
          label="To Hold Back"
          count={summary.holdBack}
          icon={<XCircle className="h-5 w-5 text-orange-500" />}
        />
        <SummaryCard
          label="Total Students"
          count={summary.total}
          icon={<Users className="h-5 w-5 text-gray-500" />}
        />
      </div>

      {/* Class-by-class configuration */}
      {configs.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No active students found in any class.
          </CardContent>
        </Card>
      ) : (
        configs.map((cfg, classIdx) => (
          <Card key={cfg.fromClassId}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    {cfg.fromClassName}
                    {cfg.isHighestGrade ? (
                      <Badge variant="secondary" className="ml-2">
                        <GraduationCap className="mr-1 h-3 w-3" />
                        Graduating Class
                      </Badge>
                    ) : (
                      <>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        <span className="text-primary">{cfg.toClassName}</span>
                      </>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {cfg.students.length} student{cfg.students.length !== 1 ? 's' : ''}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {!cfg.isHighestGrade && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setAllStudentsAction(classIdx, 'PROMOTE')}
                      >
                        Promote All
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setAllStudentsAction(classIdx, 'HOLD_BACK')}
                      >
                        Hold All
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Default section for promoted students */}
              {!cfg.isHighestGrade && cfg.toSections.length > 0 && (
                <div className="mt-3 flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">
                    Default section in {cfg.toClassName}:
                  </span>
                  <Select
                    value={cfg.defaultSectionId ?? ''}
                    onValueChange={(v) => updateDefaultSection(classIdx, v)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Section" />
                    </SelectTrigger>
                    <SelectContent>
                      {cfg.toSections.map((sec) => (
                        <SelectItem key={sec.id} value={sec.id}>
                          {sec.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Roll #</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Current Section</TableHead>
                    <TableHead>Action</TableHead>
                    {!cfg.isHighestGrade && cfg.toSections.length > 1 && (
                      <TableHead>Target Section</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cfg.students.map((student, studentIdx) => (
                    <TableRow key={student.profileId}>
                      <TableCell className="font-mono text-sm">
                        {student.rollNumber}
                      </TableCell>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{student.sectionName}</Badge>
                      </TableCell>
                      <TableCell>
                        {cfg.isHighestGrade ? (
                          <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                            <GraduationCap className="mr-1 h-3 w-3" />
                            Graduate
                          </Badge>
                        ) : (
                          <Select
                            value={student.action}
                            onValueChange={(v) =>
                              updateStudentAction(
                                classIdx,
                                studentIdx,
                                v as StudentAction,
                              )
                            }
                          >
                            <SelectTrigger className="w-36">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="PROMOTE">
                                ✅ Promote
                              </SelectItem>
                              <SelectItem value="HOLD_BACK">
                                🔁 Hold Back
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </TableCell>
                      {!cfg.isHighestGrade && cfg.toSections.length > 1 && (
                        <TableCell>
                          {student.action === 'PROMOTE' ? (
                            <Select
                              value={student.toSectionId ?? cfg.defaultSectionId ?? ''}
                              onValueChange={(v) =>
                                updateStudentSection(classIdx, studentIdx, v)
                              }
                            >
                              <SelectTrigger className="w-24">
                                <SelectValue placeholder="Sec" />
                              </SelectTrigger>
                              <SelectContent>
                                {cfg.toSections.map((sec) => (
                                  <SelectItem key={sec.id} value={sec.id}>
                                    {sec.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))
      )}

      {/* Execute Button */}
      {configs.length > 0 && (
        <div className="flex justify-end gap-3">
          <Button
            size="lg"
            onClick={() => setConfirmOpen(true)}
            disabled={isPending || !selectedSessionId || summary.total === 0}
          >
            <ArrowUpCircle className="mr-2 h-5 w-5" />
            Execute Year Transition ({summary.total} students)
          </Button>
        </div>
      )}

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Confirm Year Transition
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>You are about to execute a year transition that will:</p>
                <ul className="list-inside list-disc space-y-1 text-sm">
                  {summary.promote > 0 && (
                    <li>
                      <strong>Promote {summary.promote}</strong> student{summary.promote !== 1 ? 's' : ''} to the next class
                    </li>
                  )}
                  {summary.graduate > 0 && (
                    <li>
                      <strong>Graduate {summary.graduate}</strong> student{summary.graduate !== 1 ? 's' : ''} (accounts will be deactivated)
                    </li>
                  )}
                  {summary.holdBack > 0 && (
                    <li>
                      <strong>Hold back {summary.holdBack}</strong> student{summary.holdBack !== 1 ? 's' : ''} in their current class
                    </li>
                  )}
                </ul>
                <p className="text-sm font-medium text-amber-600">
                  This action can be undone, but should be done carefully. Students will be notified.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleExecute}>
              {isPending ? <Spinner size="sm" className="mr-2" /> : null}
              Confirm & Execute
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ============================================
// Helper Components
// ============================================

function SummaryCard({
  label,
  count,
  icon,
}: {
  label: string;
  count: number;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        {icon}
        <div>
          <p className="text-2xl font-bold">{count}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
