'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { CheckCircle, XCircle, Shuffle, AlertTriangle, Trophy, Clock, Hash } from 'lucide-react';

type Props = {
  campaign: any;
};

export function SettingsTabContent({ campaign }: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Test Configuration</CardTitle>
          <CardDescription>How the test is set up</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <SettingRow icon={Clock} label="Duration" value={`${campaign.testDuration} minutes`} />
          <SettingRow icon={Hash} label="Total Marks" value={campaign.totalMarks} />
          <SettingRow icon={Hash} label="Passing Marks" value={campaign.passingMarks} />
          <BooleanRow
            icon={Shuffle}
            label="Shuffle Questions"
            value={campaign.shuffleQuestions}
          />
          <BooleanRow
            icon={AlertTriangle}
            label="Negative Marking"
            value={campaign.negativeMarking}
            extra={campaign.negativeMarking ? `${campaign.negativeMarkValue} per wrong answer` : undefined}
          />
          <BooleanRow icon={Trophy} label="Scholarship" value={campaign.hasScholarship} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Schedule</CardTitle>
          <CardDescription>Registration and test dates</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <DateRow
            label="Registration Start"
            value={campaign.registrationStartAt}
          />
          <DateRow
            label="Registration End"
            value={campaign.registrationEndAt}
          />
          <DateRow
            label="Test Start"
            value={campaign.testStartAt}
          />
          <DateRow
            label="Test End"
            value={campaign.testEndAt}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Metadata</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <SettingRow label="Type" value={campaign.type?.replace('_', ' ')} />
          <SettingRow label="Slug" value={campaign.slug} />
          {campaign.maxSeats && <SettingRow label="Max Seats" value={campaign.maxSeats} />}
          <SettingRow label="Created" value={campaign.createdAt ? format(new Date(campaign.createdAt), 'PPP') : '—'} />
        </CardContent>
      </Card>

      {campaign.scholarshipTiers && campaign.scholarshipTiers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Scholarship Tiers</CardTitle>
            <CardDescription>{campaign.scholarshipTiers.length} tiers configured</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {campaign.scholarshipTiers.map((t: any) => (
                <div key={t.id} className="flex items-center justify-between rounded-md border p-2 text-sm">
                  <div>
                    <span className="font-medium">{t.name}</span>
                    <span className="ml-2 text-muted-foreground">≥ {t.minPercentage}%</span>
                  </div>
                  <Badge variant="outline">{t.maxRecipients} max</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function SettingRow({
  icon: Icon,
  label,
  value,
}: {
  icon?: React.ElementType;
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="flex items-center gap-2 text-muted-foreground">
        {Icon && <Icon className="h-4 w-4" />}
        {label}
      </span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function BooleanRow({
  icon: Icon,
  label,
  value,
  extra,
}: {
  icon: React.ElementType;
  label: string;
  value: boolean;
  extra?: string;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-4 w-4" />
        {label}
      </span>
      <div className="flex items-center gap-2">
        {extra && <span className="text-xs text-muted-foreground">{extra}</span>}
        {value ? (
          <CheckCircle className="h-4 w-4 text-green-500" />
        ) : (
          <XCircle className="h-4 w-4 text-gray-400" />
        )}
      </div>
    </div>
  );
}

function DateRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">
        {value ? format(new Date(value), 'MMM d, yyyy h:mm a') : 'Not set'}
      </span>
    </div>
  );
}
