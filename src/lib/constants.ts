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
// Admission Test Constants
// ============================================

export const ADMISSION_APPLICATION_NUMBER_PREFIX = 'ADM';
export const ADMISSION_PIN_LENGTH = 6; // 6-digit memorable PIN for candidates
export const ADMISSION_AUTO_SAVE_INTERVAL_MS = 60 * 1000; // 60 seconds
export const ADMISSION_HEARTBEAT_INTERVAL_MS = 30 * 1000; // 30 seconds
export const ADMISSION_SUBMIT_GRACE_PERIOD_MS = 30 * 1000; // 30 seconds
export const ADMISSION_MAX_TAB_SWITCHES = 5;
export const ADMISSION_MAX_FULLSCREEN_EXITS = 3;
export const ADMISSION_BATCH_GRADING_SIZE = 10;
export const ADMISSION_AI_GRADING_CONCURRENCY = 5;
export const ADMISSION_SCHOLARSHIP_CASCADE_MAX_DEPTH = 10;
export const ADMISSION_BULK_EMAIL_BATCH_SIZE = 10;
export const ADMISSION_BULK_EMAIL_DELAY_MS = 1000;

/** Available paper version labels for test campaigns. */
export const PAPER_VERSIONS = ['A', 'B', 'C', 'D', 'E'] as const;
export type PaperVersion = (typeof PAPER_VERSIONS)[number];

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
    TIMETABLE: '/admin/timetable',
    ATTENDANCE: '/admin/attendance',
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
    ATTENDANCE: '/teacher/attendance',
    TIMETABLE: '/teacher/timetable',
    NOTIFICATIONS: '/teacher/notifications',
  },
  STUDENT: {
    EXAMS: '/student/exams',
    RESULTS: '/student/results',
    ATTENDANCE: '/student/attendance',
    NOTIFICATIONS: '/student/notifications',
  },
  PROFILE: '/profile',
  CHANGE_PASSWORD: '/profile/change-password',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',

  // Candidate Test Portal (admin-generated links)
  TEST: {
    TAKE: (token: string) => `/test/${token}` as const,
  },

  // Admin Admission Management
  ADMIN_ADMISSIONS: {
    ROOT: '/admin/admissions',
    CAMPAIGNS: '/admin/admissions',
    NEW_CAMPAIGN: '/admin/admissions/new',
    CAMPAIGN_DETAIL: (id: string) => `/admin/admissions/${id}` as const,
    CAMPAIGN_QUESTIONS: (id: string) => `/admin/admissions/${id}` as const,
    CAMPAIGN_TIERS: (id: string) => `/admin/admissions/${id}` as const,
    CAMPAIGN_APPLICANTS: (id: string) => `/admin/admissions/${id}` as const,
    CAMPAIGN_APPLICANT: (id: string, appId: string) => `/admin/admissions/${id}` as const,
    CAMPAIGN_GRADING: (id: string) => `/admin/admissions/${id}` as const,
    CAMPAIGN_MERIT: (id: string) => `/admin/admissions/${id}` as const,
    CAMPAIGN_SCHOLARSHIPS: (id: string) => `/admin/admissions/${id}` as const,
    CAMPAIGN_ENROLLMENT: (id: string) => `/admin/admissions/${id}` as const,
    CAMPAIGN_ANALYTICS: (id: string) => `/admin/admissions/${id}` as const,
  },
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
