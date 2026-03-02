'use client';

import { StatusBadge } from '@/components/shared';
import type { CampaignStatus } from '@prisma/client';

const statusConfig: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'destructive' | 'secondary' }> = {
  DRAFT: { label: 'Draft', variant: 'secondary' },
  REGISTRATION_OPEN: { label: 'Registration Open', variant: 'default' },
  REGISTRATION_CLOSED: { label: 'Registration Closed', variant: 'warning' },
  TEST_ACTIVE: { label: 'Test Active', variant: 'success' },
  TEST_CLOSED: { label: 'Test Closed', variant: 'warning' },
  GRADING: { label: 'Grading', variant: 'default' },
  RESULTS_READY: { label: 'Results Ready', variant: 'success' },
  RESULTS_PUBLISHED: { label: 'Published', variant: 'success' },
  COMPLETED: { label: 'Completed', variant: 'secondary' },
  ARCHIVED: { label: 'Archived', variant: 'secondary' },
};

export function CampaignStatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] ?? { label: status, variant: 'secondary' as const };
  return <StatusBadge label={config.label} variant={config.variant} />;
}

const applicantStatusConfig: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'destructive' | 'secondary' }> = {
  REGISTERED: { label: 'Registered', variant: 'secondary' },
  VERIFIED: { label: 'Verified', variant: 'default' },
  TEST_IN_PROGRESS: { label: 'Testing', variant: 'warning' },
  TEST_COMPLETED: { label: 'Completed', variant: 'default' },
  GRADED: { label: 'Graded', variant: 'default' },
  SHORTLISTED: { label: 'Shortlisted', variant: 'success' },
  INTERVIEW_SCHEDULED: { label: 'Interview', variant: 'default' },
  ACCEPTED: { label: 'Accepted', variant: 'success' },
  REJECTED: { label: 'Rejected', variant: 'destructive' },
  WAITLISTED: { label: 'Waitlisted', variant: 'warning' },
  ENROLLED: { label: 'Enrolled', variant: 'success' },
  WITHDRAWN: { label: 'Withdrawn', variant: 'secondary' },
  EXPIRED: { label: 'Expired', variant: 'destructive' },
};

export function ApplicantStatusBadge({ status }: { status: string }) {
  const config = applicantStatusConfig[status] ?? { label: status, variant: 'secondary' as const };
  return <StatusBadge label={config.label} variant={config.variant} />;
}
