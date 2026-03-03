import type {
  DailyAttendance,
  SubjectAttendance,
  AttendanceStatus,
  StudentProfile,
  User,
  Class,
  Section,
  Subject,
  PeriodSlot,
  TimetableEntry,
  AcademicSession,
} from '@prisma/client';

// ── Daily Attendance Types ──

export type DailyAttendanceRecord = DailyAttendance & {
  studentProfile: Pick<StudentProfile, 'id' | 'rollNumber' | 'registrationNo'> & {
    user: Pick<User, 'id' | 'firstName' | 'lastName'>;
  };
  markedBy: Pick<User, 'id' | 'firstName' | 'lastName'>;
  editedBy: Pick<User, 'id' | 'firstName' | 'lastName'> | null;
};

export type SubjectAttendanceRecord = SubjectAttendance & {
  studentProfile: Pick<StudentProfile, 'id' | 'rollNumber' | 'registrationNo'> & {
    user: Pick<User, 'id' | 'firstName' | 'lastName'>;
  };
  subject: Pick<Subject, 'id' | 'name' | 'code'>;
  periodSlot: Pick<PeriodSlot, 'id' | 'name' | 'shortName' | 'startTime' | 'endTime'>;
  markedBy: Pick<User, 'id' | 'firstName' | 'lastName'>;
  editedBy: Pick<User, 'id' | 'firstName' | 'lastName'> | null;
};

// ── Marking Types ──

export type AttendanceMarkEntry = {
  studentProfileId: string;
  status: AttendanceStatus;
  remarks?: string;
};

export type DailyAttendanceMarkInput = {
  classId: string;
  sectionId: string;
  date: string; // ISO date string (YYYY-MM-DD)
  records: AttendanceMarkEntry[];
};

export type SubjectAttendanceMarkInput = {
  classId: string;
  sectionId: string;
  subjectId: string;
  periodSlotId: string;
  timetableEntryId?: string;
  date: string; // ISO date string (YYYY-MM-DD)
  records: AttendanceMarkEntry[];
};

// ── Stats Types ──

export type AttendanceStatusCounts = {
  present: number;
  absent: number;
  late: number;
  excused: number;
  total: number;
};

export type AttendancePercentage = {
  percentage: number; // (present + late) / (total - excused) * 100
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  excusedDays: number;
};

export type StudentAttendanceSummary = {
  studentProfileId: string;
  studentName: string;
  rollNumber: string;
  daily: AttendancePercentage;
};

export type ClassAttendanceSummary = {
  classId: string;
  sectionId: string;
  className: string;
  sectionName: string;
  date: string;
  totalStudents: number;
  statusCounts: AttendanceStatusCounts;
  percentage: number;
};

export type MonthlyCalendarDay = {
  date: string; // YYYY-MM-DD
  status: AttendanceStatus | null; // null = no record (holiday/weekend)
  isWeekend: boolean;
};

export type MonthlyAttendanceCalendar = {
  year: number;
  month: number;
  days: MonthlyCalendarDay[];
  summary: AttendancePercentage;
};

// ── Filter Types ──

export type AttendanceFilters = {
  classId?: string;
  sectionId?: string;
  subjectId?: string;
  startDate?: string;
  endDate?: string;
  status?: AttendanceStatus;
};

// ── Student for marking (the student list shown to teacher) ──

export type StudentForMarking = {
  id: string; // studentProfileId
  rollNumber: string;
  firstName: string;
  lastName: string;
  existingStatus?: AttendanceStatus;
  existingRemarks?: string;
  existingRecordId?: string;
};
