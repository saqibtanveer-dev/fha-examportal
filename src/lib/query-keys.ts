/**
 * Centralized query key factory for React Query cache management.
 * Ensures consistent cache key structure and enables granular invalidation.
 *
 * Key Hierarchy Pattern:
 *   ['module'] → all data for module
 *   ['module', 'list'] → all list queries for module
 *   ['module', 'list', { filters }] → specific filtered list
 *   ['module', 'detail', id] → specific item detail
 */

export const queryKeys = {
  // ── Exams ──
  exams: {
    all: ['exams'] as const,
    lists: () => [...queryKeys.exams.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => [...queryKeys.exams.lists(), filters] as const,
    details: () => [...queryKeys.exams.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.exams.details(), id] as const,
  },

  // ── Questions ──
  questions: {
    all: ['questions'] as const,
    lists: () => [...queryKeys.questions.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => [...queryKeys.questions.lists(), filters] as const,
    details: () => [...queryKeys.questions.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.questions.details(), id] as const,
    picker: (subjectId?: string) => [...queryKeys.questions.all, 'picker', subjectId] as const,
  },

  // ── Grading ──
  grading: {
    all: ['grading'] as const,
    sessions: () => [...queryKeys.grading.all, 'sessions'] as const,
    session: (id: string) => [...queryKeys.grading.all, 'session', id] as const,
  },

  // ── Results ──
  results: {
    all: ['results'] as const,
    lists: () => [...queryKeys.results.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => [...queryKeys.results.lists(), filters] as const,
    detail: (id: string) => [...queryKeys.results.all, 'detail', id] as const,
    analytics: (examId: string) => [...queryKeys.results.all, 'analytics', examId] as const,
    reports: () => [...queryKeys.results.all, 'reports'] as const,
  },

  // ── Subjects ──
  subjects: {
    all: ['subjects'] as const,
    list: () => [...queryKeys.subjects.all, 'list'] as const,
    forTeacher: (teacherId: string) => [...queryKeys.subjects.all, 'teacher', teacherId] as const,
  },

  // ── Classes ──
  classes: {
    all: ['classes'] as const,
    active: () => [...queryKeys.classes.all, 'active'] as const,
  },

  // ── Academic Sessions ──
  academicSessions: {
    all: ['academic-sessions'] as const,
    list: () => [...queryKeys.academicSessions.all, 'list'] as const,
  },

  // ── Users/Students ──
  users: {
    all: ['users'] as const,
    list: (filters: Record<string, unknown>) => [...queryKeys.users.all, 'list', filters] as const,
    detail: (id: string) => [...queryKeys.users.all, 'detail', id] as const,
  },

  // ── Notifications ──
  notifications: {
    all: ['notifications'] as const,
    unread: () => [...queryKeys.notifications.all, 'unread'] as const,
  },

  // ── Settings ──
  settings: {
    all: ['settings'] as const,
  },

  // ── Departments ──
  departments: {
    all: ['departments'] as const,
    list: () => [...queryKeys.departments.all, 'list'] as const,
  },

  // ── Principal ──
  principal: {
    all: ['principal'] as const,
    dashboard: {
      stats: () => ['principal', 'dashboard', 'stats'] as const,
      activity: () => ['principal', 'dashboard', 'activity'] as const,
      trends: () => ['principal', 'dashboard', 'trends'] as const,
      gradeDistribution: () => ['principal', 'dashboard', 'gradeDistribution'] as const,
    },
    students: (filters: Record<string, unknown>) => ['principal', 'students', filters] as const,
    teachers: (filters: Record<string, unknown>) => ['principal', 'teachers', filters] as const,
    exams: (filters: Record<string, unknown>) => ['principal', 'exams', filters] as const,
    classes: (filters: Record<string, unknown>) => ['principal', 'classes', filters] as const,
    filterOptions: () => ['principal', 'filterOptions'] as const,
  },

  // ── Sessions (Exam Sessions) ──
  sessions: {
    all: ['sessions'] as const,
    studentDashboard: () => ['student', 'dashboard', 'stats'] as const,
  },

  // ── Admission Campaigns ──
  campaigns: {
    all: ['campaigns'] as const,
    lists: () => [...queryKeys.campaigns.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => [...queryKeys.campaigns.lists(), filters] as const,
    details: () => [...queryKeys.campaigns.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.campaigns.details(), id] as const,
    analytics: (id: string) => [...queryKeys.campaigns.all, 'analytics', id] as const,
  },

  // ── Applicants ──
  applicants: {
    all: ['applicants'] as const,
    lists: () => [...queryKeys.applicants.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => [...queryKeys.applicants.lists(), filters] as const,
    details: () => [...queryKeys.applicants.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.applicants.details(), id] as const,
  },

  // ── Merit List ──
  meritList: {
    all: ['merit-list'] as const,
    byCampaign: (campaignId: string) => [...queryKeys.meritList.all, campaignId] as const,
  },

  // ── Scholarship Reports ──
  scholarshipReport: {
    all: ['scholarship-report'] as const,
    byCampaign: (campaignId: string) => [...queryKeys.scholarshipReport.all, campaignId] as const,
  },

  // ── Public Portal ──
  publicCampaigns: {
    all: ['public-campaigns'] as const,
    list: () => [...queryKeys.publicCampaigns.all, 'list'] as const,
    detail: (slug: string) => [...queryKeys.publicCampaigns.all, 'detail', slug] as const,
  },

  publicResult: {
    all: ['public-result'] as const,
    check: (token: string) => [...queryKeys.publicResult.all, 'check', token] as const,
  },

  applicantStatus: {
    all: ['applicant-status'] as const,
    track: (token: string) => [...queryKeys.applicantStatus.all, 'track', token] as const,
  },
} as const;

// Alias for sessions to match import pattern
export const sessionKeys = queryKeys.sessions;
