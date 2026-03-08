'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardShell } from '@/components/layout';
import { getNavigationByRole } from '@/components/layout';
import { logoutAction } from '@/app/(public)/login/actions';
import { useAuthStore } from '@/stores/auth-store';
import { useReferenceStore } from '@/stores/reference-store';
import type { ReferenceDataPayload } from '@/modules/settings/reference-actions';

type AdminShellProps = {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  referenceData?: Partial<ReferenceDataPayload>;
  children: React.ReactNode;
};

export function AdminShell({ user, referenceData, children }: AdminShellProps) {
  const router = useRouter();
  const navigation = getNavigationByRole('ADMIN');

  // Hydrate Zustand stores on mount
  useEffect(() => {
    useAuthStore.getState().setUser(user);
    if (referenceData) {
      useReferenceStore.getState().hydrate({
        subjects: referenceData.subjects,
        classes: referenceData.classes,
        academicSessions: referenceData.academicSessions,
        tags: [],
        subjectClassLinks: referenceData.subjectClassLinks,
      });
    }
  }, [user, referenceData]);

  async function handleSignOut() {
    useAuthStore.getState().reset();
    useReferenceStore.getState().invalidate();
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
