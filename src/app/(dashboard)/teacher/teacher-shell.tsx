'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardShell } from '@/components/layout';
import { getNavigationByRole } from '@/components/layout';
import { logoutAction } from '@/app/(public)/login/actions';
import { useAuthStore, useReferenceStore } from '@/stores';
import type { ReferenceDataPayload } from '@/modules/settings/reference-actions';

type Props = {
  user: { id: string; firstName: string; lastName: string; email: string; role: string };
  referenceData?: ReferenceDataPayload;
  children: React.ReactNode;
};

export function TeacherShell({ user, referenceData, children }: Props) {
  const router = useRouter();
  const navigation = getNavigationByRole('TEACHER');

  // Hydrate stores on mount / when data changes
  useEffect(() => {
    useAuthStore.getState().setUser(user);
    if (referenceData) {
      useAuthStore.getState().setTeacherProfileId(referenceData.teacherProfileId);
      useReferenceStore.getState().hydrate({
        subjects: referenceData.subjects,
        classes: referenceData.classes,
        academicSessions: referenceData.academicSessions,
        tags: referenceData.tags,
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
