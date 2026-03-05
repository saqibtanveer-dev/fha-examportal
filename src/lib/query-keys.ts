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

  // ── Written Exams ──
  writtenExams: {
    all: ['written-exams'] as const,
    markEntry: (examId: string) => [...queryKeys.writtenExams.all, 'mark-entry', examId] as const,
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

  // ── Timetable ──
  timetable: {
    all: ['timetable'] as const,
    periodSlots: () => [...queryKeys.timetable.all, 'period-slots'] as const,
    byClass: (classId: string, sectionId: string) =>
      [...queryKeys.timetable.all, 'class', classId, sectionId] as const,
    byTeacher: (teacherProfileId: string) =>
      [...queryKeys.timetable.all, 'teacher', teacherProfileId] as const,
  },

  // ── Datesheet ──
  datesheet: {
    all: ['datesheet'] as const,
    lists: () => [...queryKeys.datesheet.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => [...queryKeys.datesheet.lists(), filters] as const,
    details: () => [...queryKeys.datesheet.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.datesheet.details(), id] as const,
    entries: (datesheetId: string) => [...queryKeys.datesheet.all, 'entries', datesheetId] as const,
    stats: (datesheetId: string) => [...queryKeys.datesheet.all, 'stats', datesheetId] as const,
    byClass: (classId: string, sectionId: string) =>
      [...queryKeys.datesheet.all, 'class', classId, sectionId] as const,
    teacherDuties: (teacherProfileId: string) =>
      [...queryKeys.datesheet.all, 'teacher-duties', teacherProfileId] as const,
  },

  // ── Attendance ──
  attendance: {
    all: ['attendance'] as const,
    daily: () => [...queryKeys.attendance.all, 'daily'] as const,
    dailyByClassDate: (classId: string, sectionId: string, date: string) =>
      [...queryKeys.attendance.daily(), classId, sectionId, date] as const,
    subject: () => [...queryKeys.attendance.all, 'subject'] as const,
    subjectBySlot: (classId: string, sectionId: string, subjectId: string, periodSlotId: string, date: string) =>
      [...queryKeys.attendance.subject(), classId, sectionId, subjectId, periodSlotId, date] as const,
    studentDaily: (studentProfileId: string) =>
      [...queryKeys.attendance.all, 'student-daily', studentProfileId] as const,
    studentSubject: (studentProfileId: string) =>
      [...queryKeys.attendance.all, 'student-subject', studentProfileId] as const,
    stats: () => [...queryKeys.attendance.all, 'stats'] as const,
    classTrend: (classId: string, sectionId: string) =>
      [...queryKeys.attendance.stats(), 'trend', classId, sectionId] as const,
    schoolOverview: (date: string) =>
      [...queryKeys.attendance.stats(), 'school', date] as const,
    studentsForMarking: (classId: string, sectionId: string) =>
      [...queryKeys.attendance.all, 'students-marking', classId, sectionId] as const,
  },

  // ── Diary ──
  diary: {
    all: ['diary'] as const,
    // Teacher
    teacherEntries: (teacherProfileId: string) =>
      [...queryKeys.diary.all, 'teacher', teacherProfileId] as const,
    teacherCalendar: (teacherProfileId: string, year: number, month: number) =>
      [...queryKeys.diary.all, 'teacher-calendar', teacherProfileId, year, month] as const,
    teacherSubjectClasses: () =>
      [...queryKeys.diary.all, 'teacher-subject-classes'] as const,
    // Student
    studentEntries: (classId: string, sectionId: string) =>
      [...queryKeys.diary.all, 'student', classId, sectionId] as const,
    studentToday: (classId: string, sectionId: string) =>
      [...queryKeys.diary.all, 'student-today', classId, sectionId] as const,
    // Principal
    coverage: (startDate: string, endDate: string) =>
      [...queryKeys.diary.all, 'coverage', startDate, endDate] as const,
    byTeacher: (teacherProfileId: string) =>
      [...queryKeys.diary.all, 'by-teacher', teacherProfileId] as const,
    stats: (startDate: string, endDate: string) =>
      [...queryKeys.diary.all, 'stats', startDate, endDate] as const,
    // Shared
    studentProfile: () =>
      [...queryKeys.diary.all, 'student-profile'] as const,
    detail: (entryId: string) =>
      [...queryKeys.diary.all, 'detail', entryId] as const,
  },

  // ── Family ──
  family: {
    all: ['family'] as const,
    children: (familyUserId: string) =>
      [...queryKeys.family.all, 'children', familyUserId] as const,
    dashboard: (childId: string) =>
      [...queryKeys.family.all, 'dashboard', childId] as const,
    childAttendance: (childId: string) =>
      [...queryKeys.family.all, 'attendance', childId] as const,
    childExams: (childId: string) =>
      [...queryKeys.family.all, 'exams', childId] as const,
    childResults: (childId: string) =>
      [...queryKeys.family.all, 'results', childId] as const,
    childResultDetail: (childId: string, resultId: string) =>
      [...queryKeys.family.all, 'results', childId, resultId] as const,
    childResultsAnalytics: (childId: string) =>
      [...queryKeys.family.all, 'results-analytics', childId] as const,
    childTimetable: (childId: string) =>
      [...queryKeys.family.all, 'timetable', childId] as const,
    childDiary: (childId: string) =>
      [...queryKeys.family.all, 'diary', childId] as const,
    profile: () =>
      [...queryKeys.family.all, 'profile'] as const,
  },

} as const;

// Alias for sessions to match import pattern
export const sessionKeys = queryKeys.sessions;
