'use client';

import { useRouter } from 'next/navigation';
import { DashboardShell } from '@/components/layout';
import { getNavigationByRole } from '@/components/layout';
import { logoutAction } from '@/app/(public)/login/actions';
import { ROUTES } from '@/lib/constants';

type Props = {
  user: { firstName: string; lastName: string; email: string; role: string };
  notificationCount?: number;
  children: React.ReactNode;
};

export function PrincipalShell({ user, notificationCount, children }: Props) {
  const router = useRouter();
  const navigation = getNavigationByRole('PRINCIPAL');

  async function handleSignOut() {
    await logoutAction();
    router.push(ROUTES.LOGIN);
    router.refresh();
  }

  return (
    <DashboardShell
      navigation={navigation}
      user={user}
      notificationCount={notificationCount}
      onSignOut={handleSignOut}
    >
      {children}
    </DashboardShell>
  );
}
