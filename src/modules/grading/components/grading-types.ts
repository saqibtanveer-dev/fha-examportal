export type Answer = {
  id: string;
  answer: string;
  question: { id: string; title: string; marks: number; type: string; correctAnswer: string | null };
  answerGrade: {
    id: string;
    marksAwarded: number;
    feedback: string | null;
    gradedBy: string;
    aiConfidence: number | string | null;
    isReviewed: boolean;
  } | null;
};

export type AntiCheatInfo = {
  tabSwitchCount: number;
  fullscreenExits: number;
  copyPasteAttempts: number;
  isFlagged: boolean;
};

export type GradingProps = {
  sessionId: string;
  answers: Answer[];
  studentName: string;
  antiCheatInfo?: AntiCheatInfo;
};

export type ViewMode = 'step' | 'batch';

export type AnswerCardProps = {
  answer: Answer;
  index: number;
  total: number;
  marks: Record<string, string>;
  feedback: Record<string, string>;
  editingGradeId: string | null;
  isLoading: boolean;
  isAnyLoading: boolean;
  onMarksChange: (id: string, value: string) => void;
  onFeedbackChange: (id: string, value: string) => void;
  onGrade: (answerId: string) => void;
  onApproveAi: (gradeId: string, overrides?: { marksAwarded?: number; feedback?: string }) => void;
  onEditGrade: (gradeId: string) => void;
  onCancelEdit: () => void;
  compact?: boolean;
};
