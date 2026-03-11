import type {
  Datesheet,
  DatesheetEntry,
  DatesheetDuty,
  DatesheetStatus,
  ExamType,
  Class,
  Section,
  Subject,
  TeacherProfile,
  User,
  AcademicSession,
} from '@prisma/client';

// ── Datesheet List Item ──

export type DatesheetWithMeta = Pick<
  Datesheet,
  'id' | 'title' | 'description' | 'examType' | 'status' | 'startDate' | 'endDate' | 'publishedAt' | 'createdAt'
> & {
  academicSession: Pick<AcademicSession, 'id' | 'name'>;
  createdBy: Pick<User, 'id' | 'firstName' | 'lastName'>;
  publishedBy: Pick<User, 'id' | 'firstName' | 'lastName'> | null;
  _count: { entries: number };
};

// ── Datesheet Entry With Relations ──

export type DatesheetEntryWithRelations = Pick<
  DatesheetEntry,
  'id' | 'datesheetId' | 'classId' | 'sectionId' | 'subjectId' | 'examDate' | 'startTime' | 'endTime' | 'room' | 'instructions' | 'totalMarks'
> & {
  class: Pick<Class, 'id' | 'name' | 'grade'>;
  section: Pick<Section, 'id' | 'name'>;
  subject: Pick<Subject, 'id' | 'name' | 'code'>;
  duties: DatesheetDutyWithTeacher[];
};

// ── Duty With Teacher ──

export type DatesheetDutyWithTeacher = Pick<
  DatesheetDuty,
  'id' | 'datesheetEntryId' | 'teacherProfileId' | 'role' | 'room' | 'notes'
> & {
  teacherProfile: Pick<TeacherProfile, 'id' | 'employeeId'> & {
    user: Pick<User, 'id' | 'firstName' | 'lastName'>;
  };
};

// ── Grid Data Structure ──

export type DatesheetGridData = {
  datesheetId: string;
  dates: string[];
  classes: Pick<Class, 'id' | 'name' | 'grade'>[];
  grid: Record<string, Record<string, DatesheetEntryWithRelations | null>>;
};

// ── Teacher Duty Schedule ──

export type TeacherDutyDay = {
  date: string;
  duties: (DatesheetDutyWithTeacher & {
    entry: DatesheetEntryWithRelations;
  })[];
};

// ── Stats ──

export type DatesheetStats = {
  entryCount: number;
  dutyCount: number;
  classCount: number;
  dateCount: number;
};
