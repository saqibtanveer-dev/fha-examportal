'use client';

import { useTransition } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Spinner } from '@/components/shared';
import {
  ChevronDown,
  UserPlus,
  UserX,
  TestTube,
  XCircle,
  Award,
  CheckCircle,
  BarChart3,
  Archive,
  Send,
} from 'lucide-react';
import { CampaignStatusBadge } from './campaign-status-badge';
import {
  openRegistrationAction,
  closeRegistrationAction,
  activateTestAction,
  closeTestAction,
  triggerGradingAction,
  publishResultsAction,
  completeCampaignAction,
  archiveCampaignAction,
} from '../admission-actions';
import { useInvalidateCache } from '@/lib/cache-utils';

type Props = {
  campaignId: string;
  currentStatus: string;
};

const transitions: Record<string, Array<{
  label: string;
  action: string;
  icon: React.ElementType;
  variant?: 'default' | 'destructive';
}>> = {
  DRAFT: [
    { label: 'Open Registration', action: 'OPEN_REGISTRATION', icon: UserPlus },
  ],
  REGISTRATION_OPEN: [
    { label: 'Close Registration', action: 'CLOSE_REGISTRATION', icon: UserX },
    { label: 'Activate Test', action: 'ACTIVATE_TEST', icon: TestTube },
  ],
  REGISTRATION_CLOSED: [
    { label: 'Activate Test', action: 'ACTIVATE_TEST', icon: TestTube },
  ],
  TEST_ACTIVE: [
    { label: 'Close Test', action: 'CLOSE_TEST', icon: XCircle, variant: 'destructive' },
  ],
  TEST_CLOSED: [
    { label: 'Start Grading', action: 'TRIGGER_GRADING', icon: Award },
  ],
  GRADING: [
    { label: 'Trigger Grading', action: 'TRIGGER_GRADING', icon: Award },
  ],
  RESULTS_READY: [
    { label: 'Publish Results', action: 'PUBLISH_RESULTS', icon: Send },
  ],
  RESULTS_PUBLISHED: [
    { label: 'Complete Campaign', action: 'COMPLETE_CAMPAIGN', icon: CheckCircle },
  ],
  COMPLETED: [
    { label: 'Archive Campaign', action: 'ARCHIVE_CAMPAIGN', icon: Archive },
  ],
};

const actionMap: Record<string, (id: string) => Promise<unknown>> = {
  OPEN_REGISTRATION: openRegistrationAction,
  CLOSE_REGISTRATION: closeRegistrationAction,
  ACTIVATE_TEST: activateTestAction,
  CLOSE_TEST: closeTestAction,
  TRIGGER_GRADING: triggerGradingAction,
  PUBLISH_RESULTS: publishResultsAction,
  COMPLETE_CAMPAIGN: completeCampaignAction,
  ARCHIVE_CAMPAIGN: archiveCampaignAction,
};

export function CampaignLifecycleActions({ campaignId, currentStatus }: Props) {
  const [isPending, startTransition] = useTransition();
  const invalidate = useInvalidateCache();

  const available = transitions[currentStatus] ?? [];

  function handleAction(actionKey: string) {
    const fn = actionMap[actionKey];
    if (!fn) return;
    startTransition(async () => {
      const result = (await fn(campaignId)) as { success: boolean; error?: string };
      if (result.success) {
        toast.success('Status updated');
        invalidate.campaigns();
      } else {
        toast.error(result.error ?? 'Failed to update status');
      }
    });
  }

  if (available.length === 0) {
    return <CampaignStatusBadge status={currentStatus} />;
  }

  return (
    <div className="flex items-center gap-2">
      <CampaignStatusBadge status={currentStatus} />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={isPending}>
            {isPending ? (
              <Spinner size="sm" className="mr-2" />
            ) : (
              <ChevronDown className="mr-1 h-3 w-3" />
            )}
            Actions
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {available.map((t, i) => (
            <DropdownMenuItem
              key={t.action}
              onClick={() => handleAction(t.action)}
              className={t.variant === 'destructive' ? 'text-destructive' : ''}
            >
              <t.icon className="mr-2 h-4 w-4" />
              {t.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
