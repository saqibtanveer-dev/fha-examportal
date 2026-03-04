export type TeacherData = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  teacherProfile: {
    id: string;
    employeeId: string;
    qualification: string | null;
    specialization: string | null;
    joiningDate: string;
    teacherSubjects: {
      subject: { id: string; name: string; code: string };
      class: { id: string; name: string; grade: number } | null;
    }[];
  };
  exams: {
    id: string;
    title: string;
    type: string;
    status: string;
    totalMarks: number;
    duration: number;
    scheduledStartAt: string | null;
    createdAt: string;
    subject: { name: string; code: string };
    _count: { examQuestions: number; examSessions: number; examResults: number };
  }[];
  questionStats: { type: string; count: number }[];
  gradingStats: { pendingGrading: number; gradedCount: number };
  performanceSummary: {
    totalResults: number;
    passedResults: number;
    failedResults: number;
    passRate: number;
    avgPercentage: number;
  };
};
