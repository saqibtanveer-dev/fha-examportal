// Report system shared types
// Used across all report queries, actions, and components

import type { AggregateMode } from '@prisma/client';

// ============================================
// GROUP SCORE (stored as JSON in ConsolidatedResult)
// ============================================

export type GroupScoreStatus = 'COMPUTED' | 'ABSENT' | 'NO_EXAM' | 'PENDING' | 'EXEMPT';

export type GroupScore = {
  groupId: string;
  groupName: string;
  obtained: number | null; // null = no exam / absent
  total: number | null;
  percentage: number | null;
  status: GroupScoreStatus;
};

// ============================================
// GRADING SCALE
// ============================================

export type GradeEntry = {
  grade: string;
  minPercentage: number;
  maxPercentage: number;
};

// ============================================
// CONSOLIDATED RESULT TYPES
// ============================================

export type ConsolidatedSubjectResult = {
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  isElective: boolean;
  groupScores: GroupScore[];
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  grade: string | null;
  isPassed: boolean;
  rankInClass: number | null;
  rankInSection: number | null;
};

export type ConsolidatedStudentResult = {
  studentId: string;
  studentName: string;
  rollNumber: string;
  registrationNo: string;
  sectionId: string;
  sectionName: string;
  subjects: ConsolidatedSubjectResult[];
  totalSubjects: number;
  passedSubjects: number;
  failedSubjects: number;
  grandTotalMarks: number;
  grandObtainedMarks: number;
  overallPercentage: number;
  overallGrade: string | null;
  isOverallPassed: boolean;
  rankInClass: number | null;
  rankInSection: number | null;
  attendancePercentage: number | null;
  totalDays: number | null;
  presentDays: number | null;
  classTeacherRemarks: string | null;
  principalRemarks: string | null;
};

// ============================================
// DMC DATA TYPES
// ============================================

export type SchoolInfo = {
  name: string;
  logo: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  reportHeaderText: string | null;
  reportFooterText: string | null;
  principalName: string | null;
  examControllerName: string | null;
  signatureImageUrl: string | null;
};

export type DmcExamGroupHeader = {
  id: string;
  name: string;
  weight: number;
  sortOrder: number;
};

export type DmcStudentInfo = {
  name: string;
  fatherName: string | null;
  rollNumber: string;
  registrationNo: string;
  dateOfBirth: string | null;
  gender: string | null;
};

export type DmcSubjectRow = {
  subjectName: string;
  subjectCode: string;
  isElective: boolean;
  groupScores: GroupScore[];
  consolidatedMarks: number;
  maxConsolidatedMarks: number;
  percentage: number;
  grade: string | null;
  isPassed: boolean;
};

export type DmcSummary = {
  totalSubjects: number;
  passedSubjects: number;
  failedSubjects: number;
  grandTotalObtained: number;
  grandTotalMax: number;
  overallPercentage: number;
  overallGrade: string | null;
  isOverallPassed: boolean;
  rankInSection: number | null;
  totalStudentsInSection: number;
  rankInClass: number | null;
  totalStudentsInClass: number;
};

export type DmcAttendance = {
  totalDays: number;
  presentDays: number;
  percentage: number;
};

export type DmcData = {
  school: SchoolInfo;
  resultTerm: {
    id: string;
    name: string;
    examGroups: DmcExamGroupHeader[];
  };
  className: string;
  sectionName: string;
  academicSession: string;
  student: DmcStudentInfo;
  subjects: DmcSubjectRow[];
  summary: DmcSummary;
  attendance: DmcAttendance | null;
  classTeacherRemarks: string | null;
  principalRemarks: string | null;
  dateOfIssue: string;
};

// ============================================
// GAZETTE DATA TYPES
// ============================================

export type GazetteStudentRow = {
  studentId: string;
  studentName: string;
  rollNumber: string;
  sectionName: string;
  subjectMarks: Record<string, {
    obtained: number | null;
    total: number;
    percentage: number | null;
    grade: string | null;
    isPassed: boolean;
    groupScores: GroupScore[];
  }>;
  grandTotalObtained: number;
  grandTotalMax: number;
  overallPercentage: number;
  overallGrade: string | null;
  isOverallPassed: boolean;
  rankInClass: number | null;
  rankInSection: number | null;
  attendancePercentage: number | null;
};

export type GazetteData = {
  school: SchoolInfo;
  resultTerm: {
    id: string;
    name: string;
    examGroups: DmcExamGroupHeader[];
  };
  className: string;
  sectionName: string | null; // null = all sections
  academicSession: string;
  subjects: { id: string; name: string; code: string; isElective: boolean }[];
  students: GazetteStudentRow[];
  summary: {
    totalStudents: number;
    passedStudents: number;
    failedStudents: number;
    passRate: number;
    avgPercentage: number;
    highestPercentage: number;
    lowestPercentage: number;
  };
};

// ============================================
// RESULT TERM CONFIGURATION TYPES
// ============================================

export type ResultTermWithGroups = {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  isPublished: boolean;
  isComputing: boolean;
  publishedAt: string | null;
  computedAt: string | null;
  academicSession: { id: string; name: string };
  class: { id: string; name: string; grade: number };
  examGroups: {
    id: string;
    name: string;
    weight: number;
    aggregateMode: AggregateMode;
    bestOfCount: number | null;
    sortOrder: number;
    examLinks: {
      id: string;
      exam: {
        id: string;
        title: string;
        subjectId: string;
        subjectName: string;
        subjectCode: string;
        type: string;
        status: string;
        totalMarks: number;
      };
    }[];
  }[];
};

// ============================================
// SECTION/CLASS SUMMARY TYPES
// ============================================

export type SectionResultSummary = {
  sectionId: string;
  sectionName: string;
  totalStudents: number;
  passedStudents: number;
  failedStudents: number;
  passRate: number;
  avgPercentage: number;
  highestPercentage: number;
  lowestPercentage: number;
  toppers: {
    studentId: string;
    studentName: string;
    percentage: number;
    rank: number;
  }[];
  subjectSummaries: {
    subjectId: string;
    subjectName: string;
    avgPercentage: number;
    passRate: number;
    highestMarks: number;
    lowestMarks: number;
  }[];
};

export type MeritListEntry = {
  rank: number;
  studentId: string;
  studentName: string;
  rollNumber: string;
  className: string;
  sectionName: string;
  overallPercentage: number;
  overallGrade: string | null;
  totalSubjects: number;
  passedSubjects: number;
};

export type FailListEntry = MeritListEntry & {
  failedSubjects: number;
  failedSubjectNames: string[];
};
