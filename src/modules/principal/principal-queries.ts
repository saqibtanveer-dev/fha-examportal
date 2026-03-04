/**
 * Principal queries — barrel re-export.
 * Each domain lives in its own file under ./queries/ for maintainability.
 */

// Dashboard + filters
export {
  getPrincipalDashboardStats,
  getRecentActivity,
  getFilterOptions,
} from './queries/dashboard-queries';

// Teachers
export { getTeachersList, getTeacherDetail } from './queries/teacher-queries';
export type { TeacherListItem } from './queries/teacher-queries';

// Students
export { getStudentsList, getStudentDetail } from './queries/student-queries';
export type { StudentListItem } from './queries/student-queries';

// Classes
export { getClassesList, getClassDetail } from './queries/class-queries';
export type { ClassOverview } from './queries/class-queries';

// Exams
export { getExamsList, getExamDetail } from './queries/exam-queries';
export type { ExamListItem } from './queries/exam-queries';

// Analytics
export {
  getTeacherWiseAnalytics,
  getClassWiseAnalytics,
  getSubjectWiseAnalytics,
  getPerformanceTrends,
  getGradeDistributionOverall,
  getTopPerformingStudents,
  getBottomPerformingStudents,
} from './queries/analytics-queries';
