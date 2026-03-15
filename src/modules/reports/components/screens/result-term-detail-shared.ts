export type AvailableExam = {
  id: string;
  title: string;
  type: string;
  status: string;
  totalMarks: number;
  subjectId: string;
  subject: { name: string; code: string };
};

export type GroupFormState = {
  name: string;
  weight: string;
  aggregateMode: string;
  bestOfCount: string;
};
