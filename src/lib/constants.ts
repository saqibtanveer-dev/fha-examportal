// ============================================
// Application Constants
// ============================================

export const APP_NAME = 'ExamCore';
export const APP_DESCRIPTION = 'School Examination & Quiz Automation System';

// ============================================
// Pagination
// ============================================

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

// ============================================
// Auth
// ============================================

export const AUTH_COOKIE_NAME = 'examcore.session-token';
export const SESSION_MAX_AGE = 30 * 24 * 60 * 60; // 30 days in seconds

// ============================================
// Exam
// ============================================

export const MAX_EXAM_DURATION_MINUTES = 300;
export const MIN_EXAM_DURATION_MINUTES = 5;
export const MAX_QUESTIONS_PER_EXAM = 200;
export const MAX_MCQ_OPTIONS = 6;

// ============================================
// File Upload
// ============================================

export const MAX_FILE_SIZE_MB = 5;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

// ============================================
// AI Grading
// ============================================

export const AI_GRADING_MODEL = 'gpt-4o-mini';
export const AI_CONFIDENCE_THRESHOLD = 0.7;
export const AI_MAX_TOKENS = 1024;
export const AI_AUTO_ACCEPT_THRESHOLD = 0.85;
export const AI_REVIEW_RECOMMENDED_THRESHOLD = 0.6;
export const AI_MAX_ANSWER_LENGTH = 4000;

// ============================================
// Routes
// ============================================

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: {
    ADMIN: '/admin',
    PRINCIPAL: '/principal',
    TEACHER: '/teacher',
    STUDENT: '/student',
  },
  ADMIN: {
    USERS: '/admin/users',
    CLASSES: '/admin/classes',
    SUBJECTS: '/admin/subjects',
    DEPARTMENTS: '/admin/departments',
    YEAR_TRANSITION: '/admin/year-transition',
    NOTIFICATIONS: '/admin/notifications',
    SETTINGS: '/admin/settings',
    AUDIT_LOG: '/admin/audit-log',
    REPORTS: '/admin/reports',
  },
  PRINCIPAL: {
    TEACHERS: '/principal/teachers',
    STUDENTS: '/principal/students',
    CLASSES: '/principal/classes',
    EXAMS: '/principal/exams',
    ANALYTICS: '/principal/analytics',
    NOTIFICATIONS: '/principal/notifications',
    PROFILE: '/principal/profile',
    CHANGE_PASSWORD: '/principal/profile/change-password',
  },
  TEACHER: {
    QUESTIONS: '/teacher/questions',
    EXAMS: '/teacher/exams',
    GRADING: '/teacher/grading',
    RESULTS: '/teacher/results',
    NOTIFICATIONS: '/teacher/notifications',
  },
  STUDENT: {
    EXAMS: '/student/exams',
    RESULTS: '/student/results',
    NOTIFICATIONS: '/student/notifications',
  },
  PROFILE: '/profile',
  CHANGE_PASSWORD: '/profile/change-password',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
} as const;

// ============================================
// Grading Scale (default)
// ============================================

export const DEFAULT_GRADING_SCALE = [
  { grade: 'A+', minPercentage: 90, maxPercentage: 100 },
  { grade: 'A', minPercentage: 80, maxPercentage: 89.99 },
  { grade: 'B+', minPercentage: 70, maxPercentage: 79.99 },
  { grade: 'B', minPercentage: 60, maxPercentage: 69.99 },
  { grade: 'C', minPercentage: 50, maxPercentage: 59.99 },
  { grade: 'D', minPercentage: 40, maxPercentage: 49.99 },
  { grade: 'F', minPercentage: 0, maxPercentage: 39.99 },
] as const;
