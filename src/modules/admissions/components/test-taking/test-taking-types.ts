/** Shared types for the test-taking interface */

export type QuestionOption = {
  id: string;
  label: string;
  text: string;
  sortOrder: number;
};

export type ExistingAnswer = {
  campaignQuestionId: string;
  selectedOptionId: string | null;
  answerText: string | null;
};

export type Question = {
  campaignQuestionId: string;
  questionId: string;
  title: string;
  description: string | null;
  type: string;
  marks: number;
  sectionLabel: string | null;
  sortOrder: number;
  isRequired: boolean;
  options: QuestionOption[];
  existingAnswer: ExistingAnswer | null;
};

export type TestTakingProps = {
  accessToken: string;
  campaignName: string;
  onAuthError?: () => void;
};

export type AnswerState = Record<
  string,
  { selectedOptionId?: string; answerText?: string; dirty: boolean }
>;
