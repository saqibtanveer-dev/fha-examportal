'use client';

import { useRouter } from 'next/navigation';
import { DashboardShell } from '@/components/layout';
import { getNavigationByRole } from '@/components/layout';
import { logoutAction } from '@/app/(public)/login/actions';

type Props = {
  user: { firstName: string; lastName: string; email: string; role: string };
  notificationCount?: number;
  children: React.ReactNode;
};

export function TeacherShell({ user, notificationCount, children }: Props) {
  const router = useRouter();
  const navigation = getNavigationByRole('TEACHER');

  async function handleSignOut() {
    await logoutAction();
    router.push('/login');
    router.refresh();
  }

  return (
    <DashboardShell navigation={navigation} user={user} notificationCount={notificationCount} onSignOut={handleSignOut}>
      {children}
    </DashboardShell>
  );
}
