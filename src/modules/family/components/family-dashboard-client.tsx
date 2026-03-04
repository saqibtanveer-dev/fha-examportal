'use client';

// ============================================
// Family Dashboard — Home Page Client
// ============================================

import { useRouter, useSearchParams } from 'next/navigation';
import { PageHeader } from '@/components/shared';
import { EmptyState } from '@/components/shared';
import { SkeletonDashboard } from '@/components/shared';
import { useAllChildrenOverview } from '@/modules/family/hooks';
import { CHILD_SELECTOR_PARAM } from '@/modules/family/family.constants';
import { ChildStatsCard } from './child-stats-card';
import { Users } from 'lucide-react';

export function FamilyDashboardClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data, isLoading } = useAllChildrenOverview();

  if (isLoading) return <SkeletonDashboard />;

  if (!data?.success || !data.data) {
    return (
      <EmptyState
        icon={<Users className="h-12 w-12 text-muted-foreground" />}
        title="No Family Profile"
        description="Your family profile is not set up yet. Please contact the school admin."
      />
    );
  }

  const { children, totalChildren } = data.data;

  if (totalChildren === 0) {
    return (
      <div>
        <PageHeader title="Family Dashboard" description="Welcome to your family portal" />
        <EmptyState
          icon={<Users className="h-12 w-12 text-muted-foreground" />}
          title="No Children Linked"
          description="No students are linked to your account yet. Contact the school admin to link your children."
        />
      </div>
    );
  }

  function handleChildClick(studentProfileId: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set(CHILD_SELECTOR_PARAM, studentProfileId);
    router.push(`/family/attendance?${params.toString()}`);
  }

  return (
    <div>
      <PageHeader
        title="Family Dashboard"
        description={`Monitoring ${totalChildren} ${totalChildren === 1 ? 'child' : 'children'}`}
      />

      {/* Children Overview Grid */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {children.map((child) => (
          <ChildStatsCard
            key={child.studentProfileId}
            child={child}
            onClick={() => handleChildClick(child.studentProfileId)}
          />
        ))}
      </div>
    </div>
  );
}
