'use client';

// ============================================
// Family Dashboard — Home Page Client
// ============================================

import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { PageHeader } from '@/components/shared';
import { EmptyState } from '@/components/shared';
import { SkeletonDashboard } from '@/components/shared';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAllChildrenOverview } from '@/modules/family/hooks';
import { useFamilyFeesSummary } from '@/modules/family/hooks/use-family-queries';
import { CHILD_SELECTOR_PARAM } from '@/modules/family/family.constants';
import { ChildStatsCard } from './child-stats-card';
import { Users, CreditCard, AlertTriangle, ArrowRight } from 'lucide-react';
import { formatCurrency } from '@/modules/fees/components/fee-status-badge';

export function FamilyDashboardClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data, isLoading } = useAllChildrenOverview();
  const { data: feesSummary } = useFamilyFeesSummary();

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

      {/* ── Fee Alert Widget ── */}
      {feesSummary && feesSummary.totalBalance > 0 && (
        <div className="mt-6">
          <Link href="/family/fees" className="block group">
            <Card className={`border transition-colors group-hover:bg-muted/30 ${feesSummary.overdueCount > 0 ? 'border-destructive/40 bg-destructive/5' : 'border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30'}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    {feesSummary.overdueCount > 0 ? (
                      <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
                    ) : (
                      <CreditCard className="h-5 w-5 text-amber-600 shrink-0" />
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className={`font-semibold text-sm ${feesSummary.overdueCount > 0 ? 'text-destructive' : 'text-amber-800 dark:text-amber-300'}`}>
                          {feesSummary.overdueCount > 0 ? 'Overdue Fees' : 'Pending Fees'}
                        </p>
                        {feesSummary.overdueCount > 0 && (
                          <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                            {feesSummary.overdueCount} overdue
                          </Badge>
                        )}
                        {feesSummary.childrenWithDues > 0 && (
                          <span className={`text-xs ${feesSummary.overdueCount > 0 ? 'text-destructive/80' : 'text-amber-700 dark:text-amber-400'}`}>
                            {feesSummary.childrenWithDues} of {feesSummary.totalChildren} {feesSummary.childrenWithDues === 1 ? 'child' : 'children'}
                          </span>
                        )}
                      </div>
                      <p className={`font-mono font-bold text-lg mt-0.5 ${feesSummary.overdueCount > 0 ? 'text-destructive' : 'text-amber-900 dark:text-amber-200'}`}>
                        {formatCurrency(feesSummary.totalBalance)}
                      </p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-medium shrink-0 ${feesSummary.overdueCount > 0 ? 'text-destructive' : 'text-amber-700 dark:text-amber-400'}`}>
                    View Fees
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      )}

      {/* ── Children Overview Grid ── */}
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
