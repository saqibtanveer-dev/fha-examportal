'use client';

import { useState, useTransition } from 'react';
import { PageHeader, Spinner, EmptyState } from '@/components/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  checkEnrollmentIntegrityAction,
  cleanupOrphanedSlotGroupsAction,
} from '@/modules/subjects/enrollment-integrity';
import { toast } from 'sonner';
import { AlertTriangle, CheckCircle, Shield, Trash2 } from 'lucide-react';

type IntegrityIssue = {
  type: 'DUPLICATE_GROUP_ENROLLMENT' | 'ORPHANED_SLOT_GROUP' | 'MISSING_ENROLLMENT';
  description: string;
  entityIds: string[];
};

const ISSUE_LABELS: Record<IntegrityIssue['type'], { label: string; color: string }> = {
  DUPLICATE_GROUP_ENROLLMENT: { label: 'Duplicate Enrollment', color: 'text-red-500' },
  ORPHANED_SLOT_GROUP: { label: 'Orphaned Slot Group', color: 'text-yellow-500' },
  MISSING_ENROLLMENT: { label: 'Missing Enrollment', color: 'text-orange-500' },
};

export default function IntegrityCheckPage() {
  const [isPending, startTransition] = useTransition();
  const [issues, setIssues] = useState<IntegrityIssue[] | null>(null);
  const [scannedAt, setScannedAt] = useState<string>('');

  function handleScan() {
    startTransition(async () => {
      const result = await checkEnrollmentIntegrityAction();
      if (result.success && result.data) {
        setIssues(result.data.issues);
        setScannedAt(result.data.scannedAt);
        if (result.data.issues.length === 0) {
          toast.success('No integrity issues found');
        } else {
          toast.warning(`Found ${result.data.issues.length} issue(s)`);
        }
      } else {
        toast.error(result.error ?? 'Scan failed');
      }
    });
  }

  function handleCleanup() {
    startTransition(async () => {
      const result = await cleanupOrphanedSlotGroupsAction();
      if (result.success && result.data) {
        toast.success(`Cleaned up ${result.data.deleted} orphaned group(s)`);
        handleScan(); // Re-scan after cleanup
      } else {
        toast.error(result.error ?? 'Cleanup failed');
      }
    });
  }

  const orphanedCount = issues?.filter((i) => i.type === 'ORPHANED_SLOT_GROUP').length ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Enrollment Integrity"
        description="Scan for and fix elective enrollment inconsistencies"
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Subjects', href: '/admin/subjects' },
          { label: 'Integrity Check' },
        ]}
        actions={
          <Button onClick={handleScan} disabled={isPending}>
            {isPending ? <Spinner size="sm" className="mr-2" /> : <Shield className="mr-2 h-4 w-4" />}
            Run Scan
          </Button>
        }
      />

      {issues === null ? (
        <Card>
          <CardContent className="py-8">
            <EmptyState
              icon={<Shield className="h-10 w-10 text-muted-foreground" />}
              title="Run Integrity Scan"
              description="Click 'Run Scan' to check for enrollment data inconsistencies."
            />
          </CardContent>
        </Card>
      ) : issues.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <EmptyState
              icon={<CheckCircle className="h-10 w-10 text-green-500" />}
              title="All Clear"
              description={`No integrity issues found. Scanned at ${new Date(scannedAt).toLocaleString()}`}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="destructive" className="gap-1">
                <AlertTriangle className="h-3 w-3" />
                {issues.length} issue{issues.length !== 1 ? 's' : ''}
              </Badge>
              <span className="text-xs text-muted-foreground">
                Scanned {new Date(scannedAt).toLocaleString()}
              </span>
            </div>
            {orphanedCount > 0 && (
              <Button variant="outline" size="sm" onClick={handleCleanup} disabled={isPending}>
                <Trash2 className="mr-1 h-3 w-3" />
                Clean {orphanedCount} orphaned
              </Button>
            )}
          </div>

          <div className="space-y-2">
            {issues.map((issue, i) => {
              const config = ISSUE_LABELS[issue.type];
              return (
                <Card key={i}>
                  <CardContent className="py-3">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className={`h-4 w-4 mt-0.5 shrink-0 ${config.color}`} />
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {config.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground break-all">
                          {issue.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
