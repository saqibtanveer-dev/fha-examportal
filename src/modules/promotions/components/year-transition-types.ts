import type { ClassWithStudents } from '@/modules/promotions/promotion-queries';

export type AcademicSession = {
  id: string;
  name: string;
  isCurrent: boolean;
  _count: { exams: number };
};

export type PromotionSummary = Record<string, number>;

export type StudentAction = 'PROMOTE' | 'HOLD_BACK' | 'GRADUATE';

export type StudentEntry = {
  profileId: string;
  name: string;
  rollNumber: string;
  sectionName: string;
  sectionId: string;
  action: StudentAction;
  toSectionId?: string;
};

export type ClassConfig = {
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

export type YearTransitionProps = {
  classes: ClassWithStudents[];
  sessions: AcademicSession[];
  promotionSummary: PromotionSummary | null;
  currentSessionId: string | null;
  transitionDone: boolean;
};
