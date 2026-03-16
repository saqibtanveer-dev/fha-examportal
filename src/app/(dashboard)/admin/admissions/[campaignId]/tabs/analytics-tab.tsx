'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCampaignAnalyticsQuery } from '@/modules/admissions/hooks/use-admissions-query';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';
import { TrendingUp, Users, Target, BarChart3, Lightbulb } from 'lucide-react';

type Props = { campaignId: string };

type AnalyticsData = {
  funnel: Record<string, number>;
  scoreDistribution: { range: string; count: number }[];
  questionAnalytics: {
    questionId: string;
    title: string;
    type: string;
    subjectName: string;
    subjectCode: string;
    paperVersion: string;
    sectionLabel: string | null;
    totalAttempts: number;
    correctCount: number;
    accuracy: number;
    avgMarks: number;
    maxMarks: number;
  }[];
  subjectCoverage: {
    subjectName: string;
    subjectCode: string;
    questionCount: number;
    totalAttempts: number;
    totalMarks: number;
    avgAccuracy: number;
  }[];
  versionCoverage: {
    paperVersion: string;
    questionCount: number;
    totalAttempts: number;
    totalMarks: number;
    avgAccuracy: number;
  }[];
  summary: {
    totalGraded: number;
    avgPercentage: number;
    maxPercentage: number;
    minPercentage: number;
  };
};

const FUNNEL_STEPS = [
  { key: 'totalApplicants', label: 'Registered', color: '#6366f1' },
  { key: 'verified', label: 'Verified', color: '#8b5cf6' },
  { key: 'testCompleted', label: 'Test Done', color: '#a78bfa' },
  { key: 'graded', label: 'Graded', color: '#60a5fa' },
  { key: 'shortlisted', label: 'Shortlisted', color: '#34d399' },
  { key: 'accepted', label: 'Accepted', color: '#22c55e' },
  { key: 'enrolled', label: 'Enrolled', color: '#16a34a' },
];

const BAR_COLORS = [
  '#ef4444', '#ef4444', '#f97316', '#f97316', '#eab308',
  '#eab308', '#22c55e', '#22c55e', '#3b82f6', '#3b82f6',
];

export function AnalyticsTab({ campaignId }: Props) {
  const { data: res, isLoading } = useCampaignAnalyticsQuery(campaignId);
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState<'ALL' | string>('ALL');
  const [versionFilter, setVersionFilter] = useState<'ALL' | string>('ALL');

  const analytics = res?.success ? (res.data as AnalyticsData) : null;

  const funnelData = useMemo(
    () => FUNNEL_STEPS.map((step) => ({
      label: step.label,
      value: analytics?.funnel?.[step.key] ?? 0,
      color: step.color,
    })),
    [analytics],
  );

  const subjectOptions = useMemo(
    () => analytics?.subjectCoverage.map((s) => s.subjectName) ?? [],
    [analytics],
  );
  const versionOptions = useMemo(
    () => analytics?.versionCoverage.map((v) => v.paperVersion) ?? [],
    [analytics],
  );

  const filteredQuestionAnalytics = useMemo(() => {
    const source = analytics?.questionAnalytics ?? [];
    const needle = search.trim().toLowerCase();
    return source.filter((q) => {
      if (subjectFilter !== 'ALL' && q.subjectName !== subjectFilter) return false;
      if (versionFilter !== 'ALL' && q.paperVersion !== versionFilter) return false;
      if (!needle) return true;

      return (
        q.title.toLowerCase().includes(needle)
        || q.subjectName.toLowerCase().includes(needle)
        || String(q.sectionLabel ?? '').toLowerCase().includes(needle)
      );
    });
  }, [analytics, search, subjectFilter, versionFilter]);

  const actionItems = useMemo(() => buildActionItems(analytics?.funnel ?? {}), [analytics]);

  if (isLoading) return <AnalyticsSkeleton />;
  if (!analytics) return <p className="text-sm text-muted-foreground">No analytics available yet.</p>;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <SummaryCard icon={Users} label="Total Graded" value={analytics.summary.totalGraded} />
        <SummaryCard icon={TrendingUp} label="Average %" value={`${analytics.summary.avgPercentage}%`} />
        <SummaryCard icon={Target} label="Highest %" value={`${analytics.summary.maxPercentage}%`} />
        <SummaryCard icon={BarChart3} label="Lowest %" value={`${analytics.summary.minPercentage}%`} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Lightbulb className="h-4 w-4" />
            Admin Action Guide
          </CardTitle>
          <CardDescription>Simple next steps based on live campaign data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {actionItems.map((item) => (
            <div key={item.label} className="rounded-md border bg-muted/20 p-2">
              <p className="font-medium">{item.label}</p>
              <p className="text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Funnel Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Admission Funnel</CardTitle>
            <CardDescription>Applicant progression through stages</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnelData} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" allowDecimals={false} fontSize={12} />
                  <YAxis type="category" dataKey="label" fontSize={12} width={80} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {funnelData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Score Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Score Distribution</CardTitle>
            <CardDescription>Number of applicants per score range</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.scoreDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" fontSize={11} angle={-30} textAnchor="end" height={50} />
                  <YAxis allowDecimals={false} fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {analytics.scoreDistribution.map((_, index) => (
                      <Cell key={index} fill={BAR_COLORS[index] ?? '#6366f1'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Subject Coverage</CardTitle>
            <CardDescription>Questions and performance by subject</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {analytics.subjectCoverage.map((subject) => (
              <div key={subject.subjectCode} className="rounded-md border p-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">{subject.subjectName}</p>
                  <Badge variant="outline">{subject.questionCount} questions</Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Attempts: {subject.totalAttempts} | Avg accuracy: {subject.avgAccuracy}% | Marks: {subject.totalMarks}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Version Coverage</CardTitle>
            <CardDescription>Balance of paper versions in this campaign</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {analytics.versionCoverage.map((version) => (
              <div key={version.paperVersion} className="rounded-md border px-3 py-2 text-sm">
                <p className="font-medium">Version {version.paperVersion}</p>
                <p className="text-xs text-muted-foreground">
                  {version.questionCount} questions | Accuracy {version.avgAccuracy}%
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Question Analytics */}
      {analytics.questionAnalytics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Question Performance</CardTitle>
            <CardDescription>Accuracy and difficulty diagnostics with filters</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-3 grid gap-2 sm:grid-cols-3">
              <Input
                placeholder="Search question/subject/section"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Subjects</SelectItem>
                  {subjectOptions.map((subject) => (
                    <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={versionFilter} onValueChange={setVersionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter version" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Versions</SelectItem>
                  {versionOptions.map((version) => (
                    <SelectItem key={version} value={version}>Version {version}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 pr-4">#</th>
                    <th className="pb-2 pr-4">Question</th>
                    <th className="pb-2 pr-4">Subject</th>
                    <th className="pb-2 pr-4">Version</th>
                    <th className="pb-2 pr-4">Type</th>
                    <th className="pb-2 pr-4 text-center">Attempts</th>
                    <th className="pb-2 pr-4 text-center">Accuracy</th>
                    <th className="pb-2 text-center">Avg Marks</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredQuestionAnalytics.map((q, idx) => (
                    <tr key={q.questionId} className="border-b last:border-0">
                      <td className="py-2 pr-4 text-muted-foreground">{idx + 1}</td>
                      <td className="py-2 pr-4 max-w-xs truncate">{q.title}</td>
                      <td className="py-2 pr-4">{q.subjectName}</td>
                      <td className="py-2 pr-4">
                        <Badge variant="outline" className="text-xs">{q.paperVersion}</Badge>
                      </td>
                      <td className="py-2 pr-4">
                        <Badge variant="outline" className="text-xs">{q.type}</Badge>
                      </td>
                      <td className="py-2 pr-4 text-center">{q.totalAttempts}</td>
                      <td className="py-2 pr-4 text-center">
                        <Badge
                          variant="outline"
                          className={
                            q.accuracy >= 70
                              ? 'border-green-300 bg-green-50 text-green-700'
                              : q.accuracy >= 40
                              ? 'border-yellow-300 bg-yellow-50 text-yellow-700'
                              : 'border-red-300 bg-red-50 text-red-700'
                          }
                        >
                          {q.accuracy}%
                        </Badge>
                      </td>
                      <td className="py-2 text-center">
                        {q.avgMarks}/{q.maxMarks}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredQuestionAnalytics.length === 0 && (
              <p className="mt-3 text-sm text-muted-foreground">No questions match current filters.</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
}) {
  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <Icon className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-xl font-bold">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-80" />
        <Skeleton className="h-80" />
      </div>
    </div>
  );
}

function buildActionItems(funnel: Record<string, number>) {
  const items: Array<{ label: string; description: string }> = [];

  const total = funnel.totalApplicants ?? 0;
  const verified = funnel.verified ?? 0;
  const completed = funnel.testCompleted ?? 0;
  const graded = funnel.graded ?? 0;
  const accepted = funnel.accepted ?? 0;
  const enrolled = funnel.enrolled ?? 0;

  if (total > 0 && verified < total) {
    items.push({
      label: 'Pending Candidate Verification',
      description: `${total - verified} candidate(s) are still unverified. Ask admin team to validate records before test window closes.`,
    });
  }

  if (verified > completed) {
    items.push({
      label: 'Follow Up for Test Completion',
      description: `${verified - completed} verified candidate(s) have not completed tests yet. Send reminder and confirm their PIN access.`,
    });
  }

  if (completed > graded) {
    items.push({
      label: 'Grading Backlog',
      description: `${completed - graded} completed test(s) are awaiting grading. Trigger grading to unblock merit and admissions decisions.`,
    });
  }

  if (accepted > enrolled) {
    items.push({
      label: 'Enrollment Conversion',
      description: `${accepted - enrolled} accepted candidate(s) are not enrolled yet. Coordinate with front-desk for final admissions completion.`,
    });
  }

  if (items.length === 0) {
    items.push({
      label: 'Campaign Flow Healthy',
      description: 'Current funnel looks balanced. Continue monitoring subject-level weak areas for better question quality.',
    });
  }

  return items;
}
