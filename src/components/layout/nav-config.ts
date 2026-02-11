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
    ],
  },
  {
    title: 'System',
    items: [
      { label: 'Reports', href: ROUTES.ADMIN.REPORTS, icon: BarChart3 },
      { label: 'Notifications', href: ROUTES.ADMIN.NOTIFICATIONS, icon: Bell },
      { label: 'Audit Logs', href: ROUTES.ADMIN.AUDIT_LOG, icon: ScrollText },
      { label: 'Settings', href: ROUTES.ADMIN.SETTINGS, icon: Settings },
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
    ],
  },
  {
    title: 'Account',
    items: [
      { label: 'Notifications', href: ROUTES.STUDENT.NOTIFICATIONS, icon: Bell },
    ],
  },
];

export function getNavigationByRole(role: string): NavGroup[] {
  switch (role) {
    case 'ADMIN':
      return adminNavigation;
    case 'TEACHER':
      return teacherNavigation;
    case 'STUDENT':
      return studentNavigation;
    default:
      return [];
  }
}
