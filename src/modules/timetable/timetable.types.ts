import type {
  PeriodSlot,
  TimetableEntry,
  Class,
  Section,
  Subject,
  TeacherProfile,
  User,
  AcademicSession,
  DayOfWeek,
} from '@prisma/client';

// ── Period Slot Types ──

export type PeriodSlotRow = PeriodSlot;

export type PeriodSlotListItem = Pick<
  PeriodSlot,
  'id' | 'name' | 'shortName' | 'startTime' | 'endTime' | 'sortOrder' | 'isBreak' | 'isActive'
>;

// ── Timetable Entry Types ──

export type TimetableEntryWithRelations = TimetableEntry & {
  class: Pick<Class, 'id' | 'name' | 'grade'>;
  section: Pick<Section, 'id' | 'name'>;
  subject: Pick<Subject, 'id' | 'name' | 'code'>;
  teacherProfile: Pick<TeacherProfile, 'id' | 'employeeId'> & {
    user: Pick<User, 'id' | 'firstName' | 'lastName'>;
  };
  periodSlot: Pick<PeriodSlot, 'id' | 'name' | 'shortName' | 'startTime' | 'endTime' | 'sortOrder'>;
  academicSession: Pick<AcademicSession, 'id' | 'name'>;
};

/** One cell in the timetable grid: day × period → entry */
export type TimetableCell = {
  dayOfWeek: DayOfWeek;
  periodSlotId: string;
  entry: TimetableEntryWithRelations | null;
};

/** Full weekly timetable for a class/section */
export type WeeklyTimetable = {
  classId: string;
  sectionId: string;
  className: string;
  sectionName: string;
  academicSessionId: string;
  periodSlots: PeriodSlotListItem[];
  days: DayOfWeek[];
  grid: Record<string, Record<string, TimetableEntryWithRelations | null>>;
  // grid[dayOfWeek][periodSlotId] = entry | null
};

/** Teacher's daily schedule */
export type TeacherDaySchedule = {
  dayOfWeek: DayOfWeek;
  entries: TimetableEntryWithRelations[];
};
