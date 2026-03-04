// ============================================
// Family Module — Type Definitions
// ============================================

/** Linked child summary (returned from family profile queries) */
export type LinkedChild = {
  studentProfileId: string;
  studentName: string;
  className: string;
  sectionName: string;
  rollNumber: string;
  registrationNo: string;
  relationship: string;
  isPrimary: boolean;
  status: string;
  gender: string | null;
};

/** Family profile with linked children */
export type FamilyProfileWithChildren = {
  id: string;
  userId: string;
  relationship: string;
  occupation: string | null;
  address: string | null;
  emergencyPhone: string | null;
  children: LinkedChild[];
};

/** Dashboard stats for a single child */
export type ChildDashboardStats = {
  studentProfileId: string;
  studentName: string;
  className: string;
  sectionName: string;
  attendance: {
    totalDays: number;
    presentDays: number;
    absentDays: number;
    lateDays: number;
    percentage: number;
  };
  exams: {
    totalExams: number;
    completedExams: number;
    averagePercentage: number;
    latestGrade: string | null;
  };
  diary: {
    totalEntries: number;
    unreadEntries: number;
    todayEntries: number;
  };
};

/** Overview card data for all children (home dashboard) */
export type AllChildrenOverview = {
  children: ChildDashboardStats[];
  totalChildren: number;
};

/** Child attendance record for the family view */
export type ChildAttendanceRecord = {
  id: string;
  date: string;
  status: string;
  markedAt: string;
  subjectName?: string;
  periodLabel?: string;
};

/** Child attendance summary */
export type ChildAttendanceSummary = {
  studentProfileId: string;
  studentName: string;
  className: string;
  sectionName: string;
  daily: {
    totalDays: number;
    present: number;
    absent: number;
    late: number;
    excused: number;
    percentage: number;
  };
  monthly: {
    month: string;
    present: number;
    absent: number;
    total: number;
  }[];
};

/** Child exam with result for family view */
export type ChildExamResult = {
  examId: string;
  examTitle: string;
  subjectName: string;
  examType: string;
  date: string;
  totalMarks: number;
  obtainedMarks: number | null;
  percentage: number | null;
  grade: string | null;
  status: string;
};

/** Child timetable entry for family view */
export type ChildTimetableEntry = {
  id: string;
  dayOfWeek: string;
  subjectName: string;
  teacherName: string;
  startTime: string;
  endTime: string;
  periodLabel: string;
};

/** Child diary entry for family view */
export type ChildDiaryEntry = {
  id: string;
  date: string;
  title: string;
  content: string;
  subjectName: string;
  teacherName: string;
  status: string;
  isRead: boolean;
  createdAt: string;
};

/** Filters for attendance page */
export type FamilyAttendanceFilters = {
  childId: string;
  startDate?: string;
  endDate?: string;
  type?: 'daily' | 'subject';
};

/** Filters for diary page */
export type FamilyDiaryFilters = {
  childId: string;
  startDate?: string;
  endDate?: string;
  subjectId?: string;
};
