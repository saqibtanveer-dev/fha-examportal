'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardShell } from '@/components/layout';
import { getNavigationByRole } from '@/components/layout';
import { logoutAction } from '@/app/(public)/login/actions';
import { useAuthStore } from '@/stores/auth-store';

type Props = {
  user: { id: string; firstName: string; lastName: string; email: string; role: string };
  children: React.ReactNode;
};

export function FamilyShell({ user, children }: Props) {
  const router = useRouter();
  const navigation = getNavigationByRole('FAMILY');

  // Hydrate auth store on mount
  useEffect(() => {
    useAuthStore.getState().setUser(user);
  }, [user]);

  async function handleSignOut() {
    useAuthStore.getState().reset();
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
