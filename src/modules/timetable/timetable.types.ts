import type {
  PeriodSlot,
  TimetableEntry,
  ElectiveSlotGroup,
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
  'id' | 'name' | 'shortName' | 'startTime' | 'endTime' | 'sortOrder' | 'isBreak' | 'isActive' | 'classId' | 'sectionId'
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

// ── Grid Cell Types (Discriminated Union) ──

export type RegularCell = {
  type: 'regular';
  dayOfWeek: DayOfWeek;
  periodSlotId: string;
  entry: TimetableEntryWithRelations;
};

export type ElectiveCell = {
  type: 'elective';
  dayOfWeek: DayOfWeek;
  periodSlotId: string;
  groupId: string;
  groupName: string | null;
  entries: TimetableEntryWithRelations[];
};

export type EmptyCell = {
  type: 'empty';
  dayOfWeek: DayOfWeek;
  periodSlotId: string;
};

export type TimetableGridCell = RegularCell | ElectiveCell | EmptyCell;

/** Full weekly timetable for a class/section */
export type WeeklyTimetable = {
  classId: string;
  sectionId: string;
  className: string;
  sectionName: string;
  academicSessionId: string;
  periodSlots: PeriodSlotListItem[];
  days: DayOfWeek[];
  grid: Record<string, Record<string, TimetableGridCell>>;
  // grid[dayOfWeek][periodSlotId] = cell
};

/** Teacher's daily schedule */
export type TeacherDaySchedule = {
  dayOfWeek: DayOfWeek;
  entries: TimetableEntryWithRelations[];
};

/** Elective slot group with related entries */
export type ElectiveSlotGroupWithEntries = ElectiveSlotGroup & {
  entries: TimetableEntryWithRelations[];
};
