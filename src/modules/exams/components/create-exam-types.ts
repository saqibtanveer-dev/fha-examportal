export type Subject = { id: string; name: string; code: string };

export type ClassItem = {
  id: string;
  name: string;
  sections: { id: string; name: string }[];
};

export type QuestionItem = {
  id: string;
  title: string;
  marks: number;
  type: string;
  subjectId?: string;
  estimatedTime?: number;
};

export type AcademicSessionItem = {
  id: string;
  name: string;
  isCurrent: boolean;
};

/** Estimated time per question type (in minutes) */
export const QUESTION_TIME_ESTIMATES: Record<string, number> = {
  MCQ: 1,
  TRUE_FALSE: 0.5,
  SHORT_ANSWER: 3,
  LONG_ANSWER: 8,
  FILL_IN_BLANK: 1.5,
  MATCHING: 2,
};
