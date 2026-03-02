// Barrel re-export  all consumers keep importing from this path.
// Implementation split into queries/ subdirectory.

export type {
  ResultWithDetails,
  AnswerDetail,
  AiGradeInfo,
  DetailedResult,
  McqOptionAnalysis,
  QuestionAnalytics,
  ExamDetailedAnalytics,
} from './queries/result-types';

export {
  getResultsByStudent,
  getResultsByExam,
  getStudentResultDetail,
  getTeacherResultDetail,
} from './queries/result-core-queries';

export {
  getExamAnalytics,
  getStudentAnalytics,
} from './queries/result-analytics-queries';

export { getExamDetailedAnalytics } from './queries/result-detailed-analytics';
