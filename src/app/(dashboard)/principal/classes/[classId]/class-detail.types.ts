export type ClassDetailData = {
  id: string;
  name: string;
  grade: number;
  isActive: boolean;
  sections: {
    id: string;
    name: string;
    students: {
      userId: string;
      rollNumber: string;
      status: string;
      user: { firstName: string; lastName: string; email: string; isActive: boolean };
    }[];
  }[];
  subjectClassLinks: {
    subject: { id: string; name: string; code: string };
  }[];
  teacherSubjects: {
    teacher: { user: { id: string; firstName: string; lastName: string } };
    subject: { name: string; code: string };
  }[];
  assignedExams: {
    id: string;
    title: string;
    type: string;
    status: string;
    totalMarks: number;
    scheduledStartAt: string | null;
    subject: { name: string; code: string };
    createdBy: { firstName: string; lastName: string };
    resultsCount: number;
    avgPercentage: number;
    passRate: number;
  }[];
  classStats: {
    totalStudents: number;
    totalResults: number;
    passedCount: number;
    failedCount: number;
    avgPercentage: number;
    passRate: number;
  };
  subjectPerformance: {
    subject: string;
    avgPercentage: number;
    passRate: number;
    totalResults: number;
  }[];
  studentsWithPerformance: {
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    rollNumber: string;
    section: string;
    status: string;
    isActive: boolean;
    examsTaken: number;
    avgPercentage: number;
    passRate: number;
  }[];
};
