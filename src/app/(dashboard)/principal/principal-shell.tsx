'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardShell } from '@/components/layout';
import { getNavigationByRole } from '@/components/layout';
import { logoutAction } from '@/app/(public)/login/actions';
import { ROUTES } from '@/lib/constants';
import { useAuthStore } from '@/stores/auth-store';
import { useReferenceStore } from '@/stores/reference-store';

type Props = {
  user: { id: string; firstName: string; lastName: string; email: string; role: string };
  referenceData?: {
    subjects: { id: string; name: string; code: string }[];
    classes: { id: string; name: string; sections: { id: string; name: string }[] }[];
    academicSessions: { id: string; name: string; isCurrent: boolean }[];
  };
  children: React.ReactNode;
};

export function PrincipalShell({ user, referenceData, children }: Props) {
  const router = useRouter();
  const navigation = getNavigationByRole('PRINCIPAL');

  // Hydrate Zustand stores on mount
  useEffect(() => {
    useAuthStore.getState().setUser(user);
    if (referenceData) {
      useReferenceStore.getState().hydrate({
        subjects: referenceData.subjects,
        classes: referenceData.classes,
        academicSessions: referenceData.academicSessions,
        tags: [],
        subjectClassLinks: [],
      });
    }
  }, [user, referenceData]);

  async function handleSignOut() {
    useAuthStore.getState().reset();
    useReferenceStore.getState().invalidate();
    await logoutAction();
    router.push(ROUTES.LOGIN);
    router.refresh();
  }

  return (
    <DashboardShell
      navigation={navigation}
      user={user}
      onSignOut={handleSignOut}
    >
      {children}
    </DashboardShell>
  );
}
