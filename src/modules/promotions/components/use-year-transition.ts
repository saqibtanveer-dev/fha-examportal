'use client';

import { useState, useTransition, useMemo } from 'react';
import { useInvalidateCache } from '@/lib/cache-utils';
import { executeYearTransitionAction, undoYearTransitionAction } from '@/modules/promotions/promotion-actions';
import { toast } from 'sonner';
import type { ClassWithStudents } from '@/modules/promotions/promotion-queries';
import type { ClassConfig, StudentAction, AcademicSession } from './year-transition-types';

export function useYearTransition({
  initialClasses,
  currentSessionId,
  transitionDone,
}: {
  initialClasses: ClassWithStudents[];
  currentSessionId: string | null;
  transitionDone: boolean;
}) {
  const invalidate = useInvalidateCache();
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState<'configure' | 'done'>(transitionDone ? 'done' : 'configure');
  const [selectedSessionId, setSelectedSessionId] = useState(currentSessionId ?? '');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [undoConfirmOpen, setUndoConfirmOpen] = useState(false);

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

  function updateStudentAction(classIdx: number, studentIdx: number, action: StudentAction) {
    setConfigs((prev) => {
      const next = [...prev];
      const cls = { ...next[classIdx]! };
      cls.students = [...cls.students];
      cls.students[studentIdx] = { ...cls.students[studentIdx]!, action };
      next[classIdx] = cls;
      return next;
    });
  }

  function updateStudentSection(classIdx: number, studentIdx: number, sectionId: string) {
    setConfigs((prev) => {
      const next = [...prev];
      const cls = { ...next[classIdx]! };
      cls.students = [...cls.students];
      cls.students[studentIdx] = { ...cls.students[studentIdx]!, toSectionId: sectionId };
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
        await invalidate.all();
      } else {
        toast.error(result.error ?? 'Failed to execute transition');
      }
      setConfirmOpen(false);
    });
  }

  function handleUndo() {
    const sessionId = selectedSessionId || currentSessionId;
    if (!sessionId) return;

    startTransition(async () => {
      const result = await undoYearTransitionAction(sessionId);
      if (result.success) {
        toast.success('Year transition undone successfully');
        setStep('configure');
        await invalidate.all();
      } else {
        toast.error(result.error ?? 'Failed to undo');
      }
      setUndoConfirmOpen(false);
    });
  }

  return {
    step,
    isPending,
    configs,
    summary,
    selectedSessionId,
    setSelectedSessionId,
    confirmOpen,
    setConfirmOpen,
    undoConfirmOpen,
    setUndoConfirmOpen,
    updateStudentAction,
    updateStudentSection,
    updateDefaultSection,
    setAllStudentsAction,
    handleExecute,
    handleUndo,
  };
}
