// ============================================
// Diary Module — TypeScript Types
// ============================================

import type { DiaryStatus } from '@prisma/client';

// ── Serialized Diary Entry (from server) ──

export type DiaryEntryRecord = {
  id: string;
  teacherProfileId: string;
  classId: string;
  sectionId: string;
  subjectId: string;
  academicSessionId: string;
  date: string;
  title: string;
  content: string;
  status: DiaryStatus;
  isEdited: boolean;
  editedAt: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  teacherProfile: {
    id: string;
    employeeId: string;
    user: { id: string; firstName: string; lastName: string };
  };
  subject: { id: string; name: string; code: string };
  class: { id: string; name: string };
  section: { id: string; name: string };
  _count: { readReceipts: number };
};

export type DiaryEntryForStudent = {
  id: string;
  date: string;
  title: string;
  content: string;
  status: DiaryStatus;
  isEdited: boolean;
  createdAt: string;
  subject: { id: string; name: string; code: string };
  teacherProfile: {
    user: { firstName: string; lastName: string };
  };
};

export type DiaryEntryDetail = DiaryEntryRecord & {
  principalNotes: DiaryPrincipalNoteRecord[];
};

export type DiaryPrincipalNoteRecord = {
  id: string;
  diaryEntryId: string;
  principalId: string;
  note: string;
  createdAt: string;
  updatedAt: string;
  principal: { id: string; firstName: string; lastName: string };
};

// ── Teacher subject-class mapping ──

export type TeacherSubjectClass = {
  subjectId: string;
  subjectName: string;
  subjectCode: string | null;
  classId: string;
  className: string;
  sections: { id: string; name: string }[];
};

// ── Calendar + Coverage types ──

export type DiaryCalendarDay = {
  date: string;
  entryCount: number;
  expectedCount: number;
};

export type DiaryCoverageRow = {
  teacherProfileId: string;
  teacherName: string;
  employeeId: string;
  dates: Record<string, { submitted: number; expected: number }>;
  coveragePercent: number;
};

export type DiaryCoverageData = {
  rows: DiaryCoverageRow[];
  dates: string[];
  overallCoverage: number;
};

export type DiaryStatsData = {
  totalEntries: number;
  totalTeachersWithEntries: number;
  totalExpectedEntries: number;
  coveragePercent: number;
  missingToday: {
    teacherName: string;
    employeeId: string;
    subjectName: string;
    className: string;
  }[];
};

// ── Filter types ──

export type DiaryFilters = {
  classId?: string;
  sectionId?: string;
  subjectId?: string;
  startDate?: string;
  endDate?: string;
  status?: DiaryStatus;
  teacherProfileId?: string;
};
