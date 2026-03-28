import type { ClassWithStudents } from '@/modules/promotions/promotion-queries';
import type { ClassConfig, StudentAction } from './year-transition-types';

export type TransitionSummary = {
  promote: number;
  graduate: number;
  holdBack: number;
  total: number;
};

export type TransitionValidationSummary = {
  missingTargetClass: number;
  missingTargetSection: number;
  invalidGraduateAction: number;
  hasBlockingIssues: boolean;
};

export function buildClassConfigs(initialClasses: ClassWithStudents[]): ClassConfig[] {
  const highestGrade = Math.max(...initialClasses.map((c) => c.grade));

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
        students: cls.students.map((student) => ({
          profileId: student.profileId,
          name: `${student.firstName} ${student.lastName}`,
          rollNumber: student.rollNumber,
          sectionName: student.sectionName,
          sectionId: student.sectionId,
          selected: true,
          action: isHighest ? ('GRADUATE' as const) : ('PROMOTE' as const),
          toClassId: isHighest ? undefined : nextClass?.id,
          toSectionId: isHighest ? undefined : nextClass?.sections[0]?.id,
        })),
      };
    });
}

export function getActiveConfigs(configs: ClassConfig[], selectedClassId: string): ClassConfig[] {
  if (!selectedClassId) return [];
  return configs.filter((cfg) => cfg.fromClassId === selectedClassId);
}

export function calculateSummary(configs: ClassConfig[]): TransitionSummary {
  const summary: TransitionSummary = { promote: 0, graduate: 0, holdBack: 0, total: 0 };

  for (const cfg of configs) {
    for (const student of cfg.students) {
      if (!student.selected) continue;
      if (student.action === 'PROMOTE') summary.promote += 1;
      else if (student.action === 'GRADUATE') summary.graduate += 1;
      else if (student.action === 'HOLD_BACK') summary.holdBack += 1;
      summary.total += 1;
    }
  }

  return summary;
}

export function calculateValidationSummary(
  configs: ClassConfig[],
  classById: Map<string, ClassWithStudents>,
): TransitionValidationSummary {
  const validation: TransitionValidationSummary = {
    missingTargetClass: 0,
    missingTargetSection: 0,
    invalidGraduateAction: 0,
    hasBlockingIssues: false,
  };

  for (const cfg of configs) {
    for (const student of cfg.students) {
      if (!student.selected) continue;

      if (student.action === 'GRADUATE' && !cfg.isHighestGrade) {
        validation.invalidGraduateAction += 1;
        continue;
      }

      if (student.action !== 'PROMOTE') {
        continue;
      }

      if (!student.toClassId) {
        validation.missingTargetClass += 1;
        continue;
      }

      const targetClass = classById.get(student.toClassId);
      if (!targetClass) {
        validation.missingTargetClass += 1;
        continue;
      }

      if (!student.toSectionId) {
        validation.missingTargetSection += 1;
        continue;
      }

      const isValidSection = targetClass.sections.some((section) => section.id === student.toSectionId);
      if (!isValidSection) {
        validation.missingTargetSection += 1;
      }
    }
  }

  validation.hasBlockingIssues =
    validation.missingTargetClass > 0 ||
    validation.missingTargetSection > 0 ||
    validation.invalidGraduateAction > 0;

  return validation;
}

export function updateStudentActionInConfigs(
  configs: ClassConfig[],
  classIdx: number,
  studentIdx: number,
  action: StudentAction,
  classById: Map<string, ClassWithStudents>,
): ClassConfig[] {
  const next = [...configs];
  const cls = { ...next[classIdx]! };
  cls.students = [...cls.students];

  const current = cls.students[studentIdx]!;
  let toClassId = current.toClassId;
  let toSectionId = current.toSectionId;

  if (action === 'PROMOTE') {
    toClassId = toClassId ?? cls.toClassId;
    const targetClass = toClassId ? classById.get(toClassId) : undefined;
    if (!toSectionId || !targetClass?.sections.some((sec) => sec.id === toSectionId)) {
      toSectionId = targetClass?.sections[0]?.id;
    }
  }

  cls.students[studentIdx] = { ...current, action, toClassId, toSectionId };
  next[classIdx] = cls;
  return next;
}

export function updateStudentSelectedInConfigs(
  configs: ClassConfig[],
  classIdx: number,
  studentIdx: number,
  selected: boolean,
): ClassConfig[] {
  const next = [...configs];
  const cls = { ...next[classIdx]! };
  cls.students = [...cls.students];
  cls.students[studentIdx] = { ...cls.students[studentIdx]!, selected };
  next[classIdx] = cls;
  return next;
}

export function setAllStudentsSelectedInConfigs(
  configs: ClassConfig[],
  classIdx: number,
  selected: boolean,
): ClassConfig[] {
  const next = [...configs];
  const cls = { ...next[classIdx]! };
  cls.students = cls.students.map((student) => ({ ...student, selected }));
  next[classIdx] = cls;
  return next;
}

export function updateStudentTargetClassInConfigs(
  configs: ClassConfig[],
  classIdx: number,
  studentIdx: number,
  toClassId: string,
  classById: Map<string, ClassWithStudents>,
): ClassConfig[] {
  const next = [...configs];
  const cls = { ...next[classIdx]! };
  cls.students = [...cls.students];

  const targetClass = classById.get(toClassId);
  cls.students[studentIdx] = {
    ...cls.students[studentIdx]!,
    toClassId,
    toSectionId: targetClass?.sections[0]?.id,
  };

  next[classIdx] = cls;
  return next;
}

export function updateStudentSectionInConfigs(
  configs: ClassConfig[],
  classIdx: number,
  studentIdx: number,
  sectionId: string,
): ClassConfig[] {
  const next = [...configs];
  const cls = { ...next[classIdx]! };
  cls.students = [...cls.students];
  cls.students[studentIdx] = { ...cls.students[studentIdx]!, toSectionId: sectionId };
  next[classIdx] = cls;
  return next;
}

export function updateDefaultSectionInConfigs(
  configs: ClassConfig[],
  classIdx: number,
  sectionId: string,
): ClassConfig[] {
  const next = [...configs];
  next[classIdx] = { ...next[classIdx]!, defaultSectionId: sectionId };
  return next;
}

export function setAllStudentsActionInConfigs(
  configs: ClassConfig[],
  classIdx: number,
  action: StudentAction,
): ClassConfig[] {
  const next = [...configs];
  const cls = { ...next[classIdx]! };
  cls.students = cls.students.map((student) =>
    student.selected ? { ...student, action } : student,
  );
  next[classIdx] = cls;
  return next;
}

export function selectOnlyClassInConfigs(
  configs: ClassConfig[],
  classIdx: number,
): { configs: ClassConfig[]; targetClassId: string } {
  let targetClassId = '';
  const next = configs.map((cfg, idx) => {
    if (idx === classIdx) {
      targetClassId = cfg.fromClassId;
    }
    return {
      ...cfg,
      students: cfg.students.map((student) => ({
        ...student,
        selected: idx === classIdx,
      })),
    };
  });

  return { configs: next, targetClassId };
}
