import {
  LayoutDashboard,
  Users,
  BookOpen,
  School,
  GraduationCap,
  FileQuestion,
  ClipboardList,
  PenTool,
  BarChart3,
  Settings,
  Bell,
  ScrollText,
  ArrowUpCircle,
  UserCheck,
  TrendingUp,
  UserPlus,
  CalendarCheck,
  Clock,
  BookOpenText,
  Heart,
  CalendarRange,
  Wallet,
  FileText,
  MessageSquare,
  type LucideIcon,
} from 'lucide-react';
import { ROUTES } from '@/lib/constants';

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
};

export type NavGroup = {
  title: string;
  items: NavItem[];
};

export const adminNavigation: NavGroup[] = [
  {
    title: 'Overview',
    items: [
      { label: 'Dashboard', href: ROUTES.DASHBOARD.ADMIN, icon: LayoutDashboard },
    ],
  },
  {
    title: 'Management',
    items: [
      { label: 'Users', href: ROUTES.ADMIN.USERS, icon: Users },
      { label: 'Departments', href: ROUTES.ADMIN.DEPARTMENTS, icon: School },
      { label: 'Subjects', href: ROUTES.ADMIN.SUBJECTS, icon: BookOpen },
      { label: 'Classes', href: ROUTES.ADMIN.CLASSES, icon: GraduationCap },
      { label: 'Timetable', href: ROUTES.ADMIN.TIMETABLE, icon: Clock },
      { label: 'Datesheet', href: ROUTES.ADMIN.DATESHEET, icon: CalendarRange },
      { label: 'Attendance', href: ROUTES.ADMIN.ATTENDANCE, icon: CalendarCheck },
      { label: 'Fees', href: ROUTES.ADMIN.FEES, icon: Wallet },
      { label: 'Admissions', href: ROUTES.ADMIN_ADMISSIONS.ROOT, icon: UserPlus },
      {
        label: 'Year Transition',
        href: ROUTES.ADMIN.YEAR_TRANSITION,
        icon: ArrowUpCircle,
      },
    ],
  },
  {
    title: 'Reports',
    items: [
      { label: 'Analytics', href: ROUTES.ADMIN.REPORTS, icon: BarChart3 },
      { label: 'Result Terms', href: ROUTES.ADMIN.REPORTS_RESULT_TERMS, icon: ClipboardList },
      { label: 'Consolidation', href: ROUTES.ADMIN.REPORTS_CONSOLIDATION, icon: TrendingUp },
      { label: 'DMC Generator', href: ROUTES.ADMIN.REPORTS_DMC, icon: FileText },
      { label: 'Class Gazette', href: ROUTES.ADMIN.REPORTS_GAZETTE, icon: ScrollText },
      { label: 'Student Remarks', href: ROUTES.ADMIN.REPORTS_REMARKS, icon: MessageSquare },
    ],
  },
  {
    title: 'System',
    items: [
      { label: 'Notifications', href: ROUTES.ADMIN.NOTIFICATIONS, icon: Bell },
      { label: 'Audit Logs', href: ROUTES.ADMIN.AUDIT_LOG, icon: ScrollText },
      { label: 'Settings', href: ROUTES.ADMIN.SETTINGS, icon: Settings },
    ],
  },
];

export const principalNavigation: NavGroup[] = [
  {
    title: 'Overview',
    items: [
      { label: 'Dashboard', href: ROUTES.DASHBOARD.PRINCIPAL, icon: LayoutDashboard },
    ],
  },
  {
    title: 'Monitoring',
    items: [
      { label: 'Teachers', href: ROUTES.PRINCIPAL.TEACHERS, icon: UserCheck },
      { label: 'Students', href: ROUTES.PRINCIPAL.STUDENTS, icon: Users },
      { label: 'Classes', href: ROUTES.PRINCIPAL.CLASSES, icon: GraduationCap },
      { label: 'Exams', href: ROUTES.PRINCIPAL.EXAMS, icon: ClipboardList },
      { label: 'Timetable', href: ROUTES.PRINCIPAL.TIMETABLE, icon: Clock },
      { label: 'Datesheet', href: ROUTES.PRINCIPAL.DATESHEET, icon: CalendarRange },
      { label: 'Attendance', href: ROUTES.PRINCIPAL.ATTENDANCE, icon: CalendarCheck },
      { label: 'Diary', href: ROUTES.PRINCIPAL.DIARY, icon: BookOpenText },
      { label: 'Fees', href: ROUTES.PRINCIPAL.FEES, icon: Wallet },
    ],
  },
  {
    title: 'Insights',
    items: [
      { label: 'Analytics', href: ROUTES.PRINCIPAL.ANALYTICS, icon: TrendingUp },
      { label: 'Notifications', href: ROUTES.PRINCIPAL.NOTIFICATIONS, icon: Bell },
    ],
  },
];

export const teacherNavigation: NavGroup[] = [
  {
    title: 'Overview',
    items: [
      { label: 'Dashboard', href: ROUTES.DASHBOARD.TEACHER, icon: LayoutDashboard },
    ],
  },
  {
    title: 'Exam Management',
    items: [
      { label: 'Question Bank', href: ROUTES.TEACHER.QUESTIONS, icon: FileQuestion },
      { label: 'Exams', href: ROUTES.TEACHER.EXAMS, icon: ClipboardList },
      { label: 'Grading', href: ROUTES.TEACHER.GRADING, icon: PenTool },
      { label: 'Results', href: ROUTES.TEACHER.RESULTS, icon: BarChart3 },
    ],
  },
  {
    title: 'Classroom',
    items: [
      { label: 'Attendance', href: ROUTES.TEACHER.ATTENDANCE, icon: CalendarCheck },
      { label: 'Diary', href: ROUTES.TEACHER.DIARY, icon: BookOpenText },
      { label: 'Timetable', href: ROUTES.TEACHER.TIMETABLE, icon: Clock },
      { label: 'Datesheet', href: ROUTES.TEACHER.DATESHEET, icon: CalendarRange },
    ],
  },
  {
    title: 'Account',
    items: [
      { label: 'Notifications', href: ROUTES.TEACHER.NOTIFICATIONS, icon: Bell },
    ],
  },
];

export const studentNavigation: NavGroup[] = [
  {
    title: 'Overview',
    items: [
      { label: 'Dashboard', href: ROUTES.DASHBOARD.STUDENT, icon: LayoutDashboard },
    ],
  },
  {
    title: 'Exams',
    items: [
      { label: 'My Exams', href: ROUTES.STUDENT.EXAMS, icon: ClipboardList },
      { label: 'My Results', href: ROUTES.STUDENT.RESULTS, icon: BarChart3 },
      { label: 'My Reports / DMC', href: '/student/reports', icon: FileText },
    ],
  },
  {
    title: 'Classroom',
    items: [
      { label: 'My Attendance', href: ROUTES.STUDENT.ATTENDANCE, icon: CalendarCheck },
      { label: 'Diary', href: ROUTES.STUDENT.DIARY, icon: BookOpenText },
      { label: 'My Fees', href: ROUTES.STUDENT.FEES, icon: Wallet },
      { label: 'My Timetable', href: ROUTES.STUDENT.TIMETABLE, icon: Clock },
      { label: 'Datesheet', href: ROUTES.STUDENT.DATESHEET, icon: CalendarRange },
    ],
  },
  {
    title: 'Account',
    items: [
      { label: 'Notifications', href: ROUTES.STUDENT.NOTIFICATIONS, icon: Bell },
    ],
  },
];

export const familyNavigation: NavGroup[] = [
  {
    title: 'Overview',
    items: [
      { label: 'Dashboard', href: ROUTES.DASHBOARD.FAMILY, icon: LayoutDashboard },
    ],
  },
  {
    title: 'Academics',
    items: [
      { label: 'Attendance', href: ROUTES.FAMILY.ATTENDANCE, icon: CalendarCheck },
      { label: 'Exams & Results', href: ROUTES.FAMILY.RESULTS, icon: BarChart3 },
      { label: 'Report Cards / DMC', href: '/family/reports', icon: FileText },
      { label: 'Timetable', href: ROUTES.FAMILY.TIMETABLE, icon: Clock },
      { label: 'Datesheet', href: ROUTES.FAMILY.DATESHEET, icon: CalendarRange },
      { label: 'Diary', href: ROUTES.FAMILY.DIARY, icon: BookOpenText },
      { label: 'Fees', href: ROUTES.FAMILY.FEES, icon: Wallet },
    ],
  },
  {
    title: 'Account',
    items: [
      { label: 'Notifications', href: ROUTES.FAMILY.NOTIFICATIONS, icon: Bell },
      { label: 'Profile', href: ROUTES.FAMILY.PROFILE, icon: Heart },
    ],
  },
];

export function getNavigationByRole(role: string): NavGroup[] {
  switch (role) {
    case 'ADMIN':
      return adminNavigation;
    case 'PRINCIPAL':
      return principalNavigation;
    case 'TEACHER':
      return teacherNavigation;
    case 'STUDENT':
      return studentNavigation;
    case 'FAMILY':
      return familyNavigation;
    default:
      return [];
  }
}
