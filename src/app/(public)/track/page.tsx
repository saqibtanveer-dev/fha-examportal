'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/shared';
import { trackApplicationAction } from '@/modules/admissions/portal-actions';
import { Search, FileSearch, Clock, CheckCircle, AlertCircle, XCircle, Send, GraduationCap } from 'lucide-react';

type TrackData = {
  name: string;
  email: string;
  applicationNumber: string;
  campaignName: string;
  campaignType: string;
  status: string;
  appliedAt: string;
  testSession: { startedAt: string; submittedAt: string | null } | null;
  result: { percentage: number; isPassed: boolean; rank: number | null } | null;
  decision: { decision: string; decidedAt: string } | null;
  scholarship: { tier: string; percentageAwarded: number; status: string } | null;
};

const STATUS_STEPS = [
  { key: 'OTP_SENT', label: 'Applied', icon: Send },
  { key: 'VERIFIED', label: 'Verified', icon: CheckCircle },
  { key: 'SHORTLISTED', label: 'Shortlisted', icon: AlertCircle },
  { key: 'TEST_IN_PROGRESS', label: 'Test Taken', icon: Clock },
  { key: 'GRADED', label: 'Graded', icon: FileSearch },
  { key: 'ACCEPTED', label: 'Accepted', icon: GraduationCap },
];

function getStepIndex(status: string): number {
  if (status === 'ENROLLED') return STATUS_STEPS.length;
  if (status === 'REJECTED') return STATUS_STEPS.length;
  if (status === 'WAITLISTED') return 4;
  const idx = STATUS_STEPS.findIndex((s) => s.key === status);
  return idx >= 0 ? idx : 0;
}

export default function TrackPage() {
  const [applicationNumber, setApplicationNumber] = useState('');
  const [email, setEmail] = useState('');
  const [data, setData] = useState<TrackData | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleTrack() {
    startTransition(async () => {
      const res = await trackApplicationAction({ applicationNumber, email });
      if (res.success && res.data) {
        setData(res.data as TrackData);
      } else {
        toast.error(res.error ?? 'Application not found');
        setData(null);
      }
    });
  }

  const currentStep = data ? getStepIndex(data.status) : -1;
  const isRejected = data?.status === 'REJECTED';
  const isEnrolled = data?.status === 'ENROLLED';

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8 text-center">
        <FileSearch className="mx-auto mb-4 h-12 w-12 text-primary" />
        <h1 className="text-3xl font-bold">Track Application</h1>
        <p className="mt-2 text-muted-foreground">
          Check your application progress and status updates
        </p>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <form onSubmit={(e) => { e.preventDefault(); handleTrack(); }} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Application Number</Label>
                <Input
                  required
                  placeholder="ADM-2026-0001"
                  value={applicationNumber}
                  onChange={(e) => setApplicationNumber(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  required
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? <Spinner size="sm" className="mr-2" /> : <Search className="mr-2 h-4 w-4" />}
              Track Application
            </Button>
          </form>
        </CardContent>
      </Card>

      {data && (
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>{data.name}</CardTitle>
                <CardDescription>
                  {data.applicationNumber} &bull; {data.campaignName}
                </CardDescription>
              </div>
              <Badge
                variant="outline"
                className={
                  isRejected
                    ? 'border-red-300 bg-red-50 text-red-700'
                    : isEnrolled
                    ? 'border-green-300 bg-green-50 text-green-700'
                    : 'border-blue-300 bg-blue-50 text-blue-700'
                }
              >
                {data.status.replace(/_/g, ' ')}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {/* Timeline */}
            <div className="relative ml-4 space-y-0">
              {STATUS_STEPS.map((step, idx) => {
                const isCompleted = idx <= currentStep;
                const isCurrent = idx === currentStep && !isRejected && !isEnrolled;
                const Icon = step.icon;

                return (
                  <div key={step.key} className="relative flex items-start gap-4 pb-8 last:pb-0">
                    {/* Connector line */}
                    {idx < STATUS_STEPS.length - 1 && (
                      <div
                        className={`absolute left-[11px] top-8 h-full w-0.5 ${
                          idx < currentStep ? 'bg-primary' : 'bg-muted-foreground/20'
                        }`}
                      />
                    )}

                    {/* Step icon */}
                    <div
                      className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                        isCompleted
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-muted-foreground/30 bg-background text-muted-foreground/50'
                      } ${isCurrent ? 'ring-4 ring-primary/20' : ''}`}
                    >
                      <Icon className="h-3 w-3" />
                    </div>

                    {/* Step content */}
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${isCompleted ? '' : 'text-muted-foreground'}`}>
                        {step.label}
                      </p>
                      {/* Contextual info */}
                      {step.key === 'OTP_SENT' && isCompleted && (
                        <p className="text-xs text-muted-foreground">
                          Applied on {new Date(data.appliedAt).toLocaleDateString()}
                        </p>
                      )}
                      {step.key === 'TEST_IN_PROGRESS' && data.testSession && (
                        <p className="text-xs text-muted-foreground">
                          {data.testSession.submittedAt
                            ? `Submitted ${new Date(data.testSession.submittedAt).toLocaleDateString()}`
                            : `Started ${new Date(data.testSession.startedAt).toLocaleDateString()}`}
                        </p>
                      )}
                      {step.key === 'GRADED' && data.result && (
                        <p className="text-xs text-muted-foreground">
                          Score: {Number(data.result.percentage).toFixed(1)}%
                          {data.result.rank ? ` • Rank #${data.result.rank}` : ''}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Final step: Enrolled or Rejected */}
              {(isEnrolled || isRejected) && (
                <div className="relative flex items-start gap-4">
                  <div
                    className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                      isEnrolled
                        ? 'border-green-600 bg-green-600 text-white'
                        : 'border-red-600 bg-red-600 text-white'
                    }`}
                  >
                    {isEnrolled ? (
                      <GraduationCap className="h-3 w-3" />
                    ) : (
                      <XCircle className="h-3 w-3" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {isEnrolled ? 'Enrolled' : 'Rejected'}
                    </p>
                    {data.decision && (
                      <p className="text-xs text-muted-foreground">
                        {new Date(data.decision.decidedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Scholarship info */}
            {data.scholarship && (
              <div className="mt-6 rounded-lg border border-yellow-200 bg-yellow-50 p-3">
                <p className="text-sm font-medium text-yellow-800">
                  🎓 Scholarship: {data.scholarship.percentageAwarded}% Fee Waiver
                </p>
                <p className="text-xs text-yellow-700">
                  Status: {data.scholarship.status.replace(/_/g, ' ')}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
