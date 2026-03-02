/**
 * Shared types and constants for analytics tab components.
 */

export type TeacherAnalytics = {
  teacherId: string;
  teacherName: string;
  examsCreated: number;
  questionsCreated: number;
  totalResults: number;
  avgPercentage: number;
  passRate: number;
};

export type ClassAnalytics = {
  classId: string;
  className: string;
  grade: number;
  totalStudents: number;
  totalResults: number;
  avgPercentage: number;
  passRate: number;
};

export type SubjectAnalytics = {
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  department: string;
  totalExams: number;
  totalResults: number;
  avgPercentage: number;
  passRate: number;
};

export type PerformanceTrend = {
  month: string;
  avgPercentage: number;
  passRate: number;
  totalExams: number;
};

export type GradeDistItem = {
  grade: string;
  count: number;
};

export type StudentPerformance = {
  studentId: string;
  studentName: string;
  rollNumber: string;
  className: string;
  section: string;
  examsTaken: number;
  avgPercentage: number;
  passRate: number;
};

export const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#f97316'];

export function formatMonth(m: string) {
  const [year, month] = m.split('-');
  const date = new Date(Number(year), Number(month) - 1);
  return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
}
