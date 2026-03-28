'use client';

import { useCallback, useEffect, useMemo, useState, useTransition } from 'react';
import { useInvalidateCache } from '@/lib/cache-utils';
import {
  executeYearTransitionAction,
  undoSelectedYearTransitionAction,
  undoYearTransitionAction,
} from '@/modules/promotions/promotion-actions';
import { toast } from 'sonner';
import type { ClassWithStudents } from '@/modules/promotions/promotion-queries';
import type {
  ClassConfig,
  StudentAction,
} from './year-transition-types';
import { useSessionTransitionHistory } from './use-session-transition-history';
import {
  buildClassConfigs,
  calculateValidationSummary,
  calculateSummary,
  getActiveConfigs,
  selectOnlyClassInConfigs,
  setAllStudentsActionInConfigs,
  setAllStudentsSelectedInConfigs,
  updateDefaultSectionInConfigs,
  updateStudentActionInConfigs,
  updateStudentSectionInConfigs,
  updateStudentSelectedInConfigs,
  updateStudentTargetClassInConfigs,
} from './year-transition-config-helpers';

export function useYearTransition({
  initialClasses,
  currentSessionId,
}: {
  initialClasses: ClassWithStudents[];
  currentSessionId: string | null;
}) {
  const invalidate = useInvalidateCache();
  const [isPending, startTransition] = useTransition();
  const [selectedSessionId, setSelectedSessionId] = useState(currentSessionId ?? '');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [undoConfirmOpen, setUndoConfirmOpen] = useState(false);
  const [undoSelectedConfirmOpen, setUndoSelectedConfirmOpen] = useState(false);
  const history = useSessionTransitionHistory();

  const classById = useMemo(
    () => new Map(initialClasses.map((cls) => [cls.id, cls])),
    [initialClasses],
  );

  const classConfigs = useMemo(() => buildClassConfigs(initialClasses), [initialClasses]);

  const [configs, setConfigs] = useState<ClassConfig[]>(classConfigs);
  const [selectedClassId, setSelectedClassId] = useState(classConfigs[0]?.fromClassId ?? '');

  const resolvedSelectedClassId = useMemo(() => {
    if (configs.length === 0) return '';
    if (configs.some((cfg) => cfg.fromClassId === selectedClassId)) return selectedClassId;
    return configs[0]!.fromClassId;
  }, [configs, selectedClassId]);

  const activeConfigs = useMemo(
    () => getActiveConfigs(configs, resolvedSelectedClassId),
    [configs, resolvedSelectedClassId],
  );

  const summary = useMemo(() => calculateSummary(activeConfigs), [activeConfigs]);
  const validation = useMemo(
    () => calculateValidationSummary(activeConfigs, classById),
    [activeConfigs, classById],
  );

  const activeStudentsTotal = useMemo(
    () => activeConfigs.reduce((acc, cfg) => acc + cfg.students.length, 0),
    [activeConfigs],
  );

  const reviewProgress = useMemo(() => {
    if (activeStudentsTotal === 0) return 0;
    return Math.round((summary.total / activeStudentsTotal) * 100);
  }, [activeStudentsTotal, summary.total]);

  const updateStudentAction = useCallback((classIdx: number, studentIdx: number, action: StudentAction) => {
    setConfigs((prev) => updateStudentActionInConfigs(prev, classIdx, studentIdx, action, classById));
  }, [classById]);

  const updateStudentSelected = useCallback((classIdx: number, studentIdx: number, selected: boolean) => {
    setConfigs((prev) => updateStudentSelectedInConfigs(prev, classIdx, studentIdx, selected));
  }, []);

  const setAllStudentsSelected = useCallback((classIdx: number, selected: boolean) => {
    setConfigs((prev) => setAllStudentsSelectedInConfigs(prev, classIdx, selected));
  }, []);

  const updateStudentTargetClass = useCallback((classIdx: number, studentIdx: number, toClassId: string) => {
    setConfigs((prev) => updateStudentTargetClassInConfigs(prev, classIdx, studentIdx, toClassId, classById));
  }, [classById]);

  const updateStudentSection = useCallback((classIdx: number, studentIdx: number, sectionId: string) => {
    setConfigs((prev) => updateStudentSectionInConfigs(prev, classIdx, studentIdx, sectionId));
  }, []);

  const updateDefaultSection = useCallback((classIdx: number, sectionId: string) => {
    setConfigs((prev) => updateDefaultSectionInConfigs(prev, classIdx, sectionId));
  }, []);

  const setAllStudentsAction = useCallback((classIdx: number, action: StudentAction) => {
    setConfigs((prev) => setAllStudentsActionInConfigs(prev, classIdx, action));
  }, []);

  const selectOnlyClass = useCallback((classIdx: number) => {
    let targetClassId = '';
    setConfigs((prev) => {
      const next = selectOnlyClassInConfigs(prev, classIdx);
      targetClassId = next.targetClassId;
      return next.configs;
    });
    if (targetClassId) {
      setSelectedClassId(targetClassId);
    }
  }, []);

  useEffect(() => {
    if (!selectedSessionId) return;
    void history.loadSessionTransitions(selectedSessionId);
  }, [history, selectedSessionId]);

  function handleExecute() {
    if (!selectedSessionId) {
      toast.error('Select an academic session first');
      return;
    }

    if (summary.total === 0) {
      toast.error('Select at least one student to process');
      return;
    }

    if (validation.hasBlockingIssues) {
      const messages: string[] = [];
      if (validation.missingTargetClass > 0) {
        messages.push(`${validation.missingTargetClass} student(s) missing target class`);
      }
      if (validation.missingTargetSection > 0) {
        messages.push(`${validation.missingTargetSection} student(s) missing/invalid target section`);
      }
      if (validation.invalidGraduateAction > 0) {
        messages.push(`${validation.invalidGraduateAction} non-final class student(s) marked as graduate`);
      }

      toast.error(`Fix before executing: ${messages.join(', ')}`);
      return;
    }

    startTransition(async () => {
      const promotions = activeConfigs
        .map((cfg) => ({
          fromClassId: cfg.fromClassId,
          toClassId: cfg.toClassId,
          defaultSectionId: cfg.defaultSectionId,
          entries: cfg.students
            .filter((student) => student.selected)
            .map((student) => ({
              studentProfileId: student.profileId,
              action: student.action,
              toClassId: student.toClassId,
              toSectionId: student.toSectionId,
            })),
        }))
        .filter((cfg) => cfg.entries.length > 0);

      if (promotions.length === 0) {
        toast.error('No selected students found in this class');
        setConfirmOpen(false);
        return;
      }

      const input = {
        academicSessionId: selectedSessionId,
        promotions,
      };

      const result = await executeYearTransitionAction(input);
      if (result.success) {
        const summary = result.data!;
        toast.success(
          `Processed ${summary.processed} students: ${summary.promoted} promoted, ${summary.graduated} graduated, ${summary.heldBack} held back, ${summary.skipped} skipped.`,
        );
        await invalidate.all();
        await history.loadSessionTransitions(selectedSessionId);
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
        await invalidate.all();
        await history.loadSessionTransitions(sessionId);
      } else {
        toast.error(result.error ?? 'Failed to undo');
      }
      setUndoConfirmOpen(false);
    });
  }

  function handleUndoSelected() {
    if (!selectedSessionId) {
      toast.error('Select an academic session first');
      return;
    }
    if (history.selectedTransitionIds.length === 0) {
      toast.error('Select at least one transitioned student to undo');
      return;
    }

    startTransition(async () => {
      const result = await undoSelectedYearTransitionAction({
        academicSessionId: selectedSessionId,
        promotionIds: history.selectedTransitionIds,
      });

      if (result.success) {
        toast.success(`Undid ${result.data?.undone ?? 0} selected transition(s)`);
        await invalidate.all();
        await history.loadSessionTransitions(selectedSessionId);
      } else {
        toast.error(result.error ?? 'Failed to undo selected transitions');
      }
      setUndoSelectedConfirmOpen(false);
    });
  }

  return {
    isPending,
    isLoadingTransitions: history.isLoadingTransitions,
    configs,
    activeConfigs,
    summary,
    validation,
    activeStudentsTotal,
    reviewProgress,
    classById,
    selectedClassId: resolvedSelectedClassId,
    setSelectedClassId,
    selectedSessionId,
    setSelectedSessionId,
    confirmOpen,
    setConfirmOpen,
    undoConfirmOpen,
    setUndoConfirmOpen,
    undoSelectedConfirmOpen,
    setUndoSelectedConfirmOpen,
    sessionTransitions: history.sessionTransitions,
    selectedTransitionIds: history.selectedTransitionIds,
    toggleTransitionSelection: history.toggleTransitionSelection,
    setAllTransitionSelection: history.setAllTransitionSelection,
    updateStudentAction,
    updateStudentSelected,
    setAllStudentsSelected,
    selectOnlyClass,
    updateStudentTargetClass,
    updateStudentSection,
    updateDefaultSection,
    setAllStudentsAction,
    handleExecute,
    handleUndo,
    handleUndoSelected,
  };
}
