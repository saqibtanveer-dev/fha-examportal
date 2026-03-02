'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { PageHeader, EmptyState } from '@/components/shared';
import { CampaignTable, CreateCampaignDialog } from '@/modules/admissions/components';
import { ROUTES } from '@/lib/constants';

type Props = {
  campaigns: any[];
  classes: { id: string; name: string }[];
  academicSessions: { id: string; name: string }[];
};

export function CampaignsView({ campaigns, classes, academicSessions }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admissions"
        description="Manage admission & scholarship test campaigns"
        breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Admissions' }]}
        actions={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />New Campaign
          </Button>
        }
      />
      {campaigns.length === 0 ? (
        <EmptyState
          title="No campaigns"
          description="Create your first admission or scholarship test campaign to get started."
          action={
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />New Campaign
            </Button>
          }
        />
      ) : (
        <CampaignTable campaigns={campaigns} />
      )}
      <CreateCampaignDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        classes={classes}
        academicSessions={academicSessions}
      />
    </div>
  );
}
