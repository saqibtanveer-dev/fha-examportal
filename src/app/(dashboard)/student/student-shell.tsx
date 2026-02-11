'use client';

import { useRouter } from 'next/navigation';
import { DashboardShell } from '@/components/layout';
import { getNavigationByRole } from '@/components/layout';
import { logoutAction } from '@/app/(public)/login/actions';

type Props = {
  user: { firstName: string; lastName: string; email: string; role: string };
  children: React.ReactNode;
};

export function StudentShell({ user, children }: Props) {
  const router = useRouter();
  const navigation = getNavigationByRole('STUDENT');

  async function handleSignOut() {
    await logoutAction();
    router.push('/login');
    router.refresh();
  }

  return (
    <DashboardShell navigation={navigation} user={user} onSignOut={handleSignOut}>
      {children}
    </DashboardShell>
  );
}
