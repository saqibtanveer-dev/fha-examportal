// ============================================
// Family Module — Type Definitions
// ============================================

/** Linked child summary (returned from family profile queries) */
export type LinkedChild = {
  studentProfileId: string;
  userId: string;
  studentName: string;
  classId: string;
  sectionId: string;
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
