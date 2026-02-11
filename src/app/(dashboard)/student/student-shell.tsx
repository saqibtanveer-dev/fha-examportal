'use client';

import { DashboardShell } from '@/components/layout';
import { studentNavigation } from '@/components/layout/nav-config';

export function StudentShell({ children }: { children: React.ReactNode }) {
  return <DashboardShell navigation={studentNavigation}>{children}</DashboardShell>;
}
