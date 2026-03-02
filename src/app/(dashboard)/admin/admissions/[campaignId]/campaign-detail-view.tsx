'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/shared';
import { CampaignLifecycleActions } from '@/modules/admissions/components/campaign-lifecycle-actions';
import { CampaignStatsCards } from '@/modules/admissions/components/campaign-stats-cards';
import { ApplicantsTabContent } from './tabs/applicants-tab';
import { QuestionsTabContent } from './tabs/questions-tab';
import { MeritTabContent } from './tabs/merit-tab';
import { SettingsTabContent } from './tabs/settings-tab';
import { AnalyticsTab } from './tabs/analytics-tab';
import { ROUTES } from '@/lib/constants';
import { format } from 'date-fns';

type Props = {
  campaign: any;
  stats: any;
};

export function CampaignDetailView({ campaign, stats }: Props) {
  const defaultStats = {
    totalApplicants: 0,
    verified: 0,
    testCompleted: 0,
    graded: 0,
    shortlisted: 0,
    accepted: 0,
    rejected: 0,
    waitlisted: 0,
    enrolled: 0,
    ...stats,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={campaign.name}
        description={campaign.description || `${campaign.type} campaign`}
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Admissions', href: ROUTES.ADMIN_ADMISSIONS.ROOT },
          { label: campaign.name },
        ]}
        actions={
          <CampaignLifecycleActions
            campaignId={campaign.id}
            currentStatus={campaign.status}
          />
        }
      />

      <CampaignStatsCards stats={defaultStats} />

      {/* Campaign Info Bar */}
      <div className="flex flex-wrap gap-4 rounded-md border bg-muted/30 p-3 text-sm">
        <InfoItem label="Duration" value={`${campaign.testDuration} min`} />
        <InfoItem label="Total Marks" value={campaign.totalMarks} />
        <InfoItem label="Passing Marks" value={campaign.passingMarks} />
        {campaign.maxSeats && <InfoItem label="Max Seats" value={campaign.maxSeats} />}
        {campaign.registrationStartAt && (
          <InfoItem
            label="Registration"
            value={`${format(new Date(campaign.registrationStartAt), 'MMM d')} – ${campaign.registrationEndAt ? format(new Date(campaign.registrationEndAt), 'MMM d') : 'Open'}`}
          />
        )}
        {campaign.testStartAt && (
          <InfoItem
            label="Test Window"
            value={`${format(new Date(campaign.testStartAt), 'MMM d, h:mm a')} – ${campaign.testEndAt ? format(new Date(campaign.testEndAt), 'MMM d, h:mm a') : 'Open'}`}
          />
        )}
      </div>

      <Tabs defaultValue="applicants">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="applicants">Applicants</TabsTrigger>
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="merit">Merit List</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="applicants" className="mt-4">
          <ApplicantsTabContent campaignId={campaign.id} />
        </TabsContent>
        <TabsContent value="questions" className="mt-4">
          <QuestionsTabContent campaignId={campaign.id} isDraft={campaign.status === 'DRAFT'} />
        </TabsContent>
        <TabsContent value="merit" className="mt-4">
          <MeritTabContent campaignId={campaign.id} campaignStatus={campaign.status} />
        </TabsContent>
        <TabsContent value="analytics" className="mt-4">
          <AnalyticsTab campaignId={campaign.id} />
        </TabsContent>
        <TabsContent value="settings" className="mt-4">
          <SettingsTabContent campaign={campaign} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <span className="text-muted-foreground">{label}: </span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
