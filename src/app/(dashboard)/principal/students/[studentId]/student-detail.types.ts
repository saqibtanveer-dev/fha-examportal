export type StudentData = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  studentProfile: {
    id: string;
    rollNumber: string;
    registrationNo: string;
    status: string;
    gender: string | null;
    guardianName: string | null;
    guardianPhone: string | null;
    dateOfBirth: string | null;
    enrollmentDate: string;
    class: { id: string; name: string; grade: number };
    section: { id: string; name: string };
  };
  results: {
    id: string;
    totalMarks: number;
    obtainedMarks: number;
    percentage: number;
    grade: string | null;
    isPassed: boolean;
    rank: number | null;
    createdAt: string;
    exam: {
      id: string;
      title: string;
      type: string;
      subject: { name: string; code: string };
      createdBy: { firstName: string; lastName: string };
    };
  }[];
  sessions: {
    id: string;
    status: string;
    startedAt: string | null;
    submittedAt: string | null;
    timeSpent: number | null;
    tabSwitchCount: number;
    isFlagged: boolean;
    exam: { title: string; duration: number };
  }[];
  performance: {
    totalExams: number;
    passedExams: number;
    failedExams: number;
    passRate: number;
    avgPercentage: number;
    highestPercentage: number;
    lowestPercentage: number;
  };
  subjectPerformance: {
    subject: string;
    exams: number;
    avgPercentage: number;
    passRate: number;
  }[];
  timeline: {
    date: string;
    percentage: number;
    exam: string;
    subject: string;
  }[];
};
