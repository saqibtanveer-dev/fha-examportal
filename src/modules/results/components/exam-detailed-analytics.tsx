'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/utils/cn';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ScatterChart,
  Scatter,
  Legend,
} from 'recharts';
import {
  Users,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Clock,
  ShieldAlert,
  BarChart3,
  Target,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Minus,
} from 'lucide-react';
import type { ExamDetailedAnalytics, QuestionAnalytics } from '@/modules/results/result-queries';

// ============================================
// Constants
// ============================================

const CHART_COLORS = {
  primary: 'hsl(var(--primary))',
  green: '#22c55e',
  red: '#ef4444',
  amber: '#f59e0b',
  blue: '#3b82f6',
  purple: '#8b5cf6',
  indigo: '#6366f1',
  teal: '#14b8a6',
  gray: '#6b7280',
};

const PIE_COLORS = [CHART_COLORS.green, CHART_COLORS.red];
const OPTION_COLORS = ['#3b82f6', '#f59e0b', '#8b5cf6', '#14b8a6', '#ec4899', '#f97316'];

// ============================================
// KPI Card
// ============================================

function KpiCard({
  icon,
  label,
  value,
  subtext,
  variant = 'default',
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtext?: string;
  variant?: 'default' | 'success' | 'danger' | 'warning';
}) {
  const borderMap = {
    default: '',
    success: 'border-l-green-500',
    danger: 'border-l-red-500',
    warning: 'border-l-amber-500',
  };

  return (
    <Card className={cn('border-l-4', borderMap[variant])}>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs text-muted-foreground">{label}</p>
          <p className="text-lg font-bold leading-tight">{value}</p>
          {subtext && <p className="truncate text-xs text-muted-foreground">{subtext}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// Score Overview Section
// ============================================

function ScoreOverview({ data }: { data: ExamDetailedAnalytics }) {
  const passFailData = [
    { name: 'Passed', value: data.passed },
    { name: 'Failed', value: data.failed },
  ];

  return (
    <div className="space-y-4">
      {/* KPI Grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          label="Total Students"
          value={String(data.totalStudents)}
          variant="default"
        />
        <KpiCard
          icon={<CheckCircle2 className="h-4 w-4 text-green-600" />}
          label="Passed"
          value={String(data.passed)}
          subtext={`${data.passRate.toFixed(1)}% pass rate`}
          variant="success"
        />
        <KpiCard
          icon={<XCircle className="h-4 w-4 text-red-600" />}
          label="Failed"
          value={String(data.failed)}
          variant="danger"
        />
        <KpiCard
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
          label="Average"
          value={`${data.avgPercentage.toFixed(1)}%`}
          subtext={`Median: ${data.medianPercentage.toFixed(1)}%`}
          variant="default"
        />
      </div>

      {/* Statistical Summary + Charts */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Stats Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Statistical Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2 text-sm">
              <StatRow label="Mean" value={`${data.avgPercentage.toFixed(1)}%`} />
              <StatRow label="Median" value={`${data.medianPercentage.toFixed(1)}%`} />
              <StatRow label="Std. Deviation" value={`${data.stdDeviation.toFixed(1)}%`} />
              <StatRow label="Q1 (25th)" value={`${data.q1Percentage.toFixed(1)}%`} />
              <StatRow label="Q3 (75th)" value={`${data.q3Percentage.toFixed(1)}%`} />
              <StatRow label="IQR" value={`${(data.q3Percentage - data.q1Percentage).toFixed(1)}%`} />
              <StatRow label="Range" value={`${data.minPercentage.toFixed(1)}% – ${data.maxPercentage.toFixed(1)}%`} />
            </dl>
          </CardContent>
        </Card>

        {/* Score Distribution */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Score Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.scoreDistribution}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="range" fontSize={11} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis allowDecimals={false} fontSize={11} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Bar dataKey="count" fill={CHART_COLORS.primary} radius={[4, 4, 0, 0]} name="Students" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Pass/Fail Donut */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Pass / Fail Ratio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={passFailData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                    labelLine={false}
                  >
                    {passFailData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grade Distribution */}
      {data.gradeDistribution.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Grade Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.gradeDistribution}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="grade" fontSize={12} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis allowDecimals={false} fontSize={12} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Bar dataKey="count" fill={CHART_COLORS.indigo} radius={[4, 4, 0, 0]} name="Students" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}

// ============================================
// Question Analytics Section
// ============================================

function QuestionAccuracyChart({ questions }: { questions: QuestionAnalytics[] }) {
  const chartData = questions.map((q) => ({
    name: `Q${q.questionNumber}`,
    accuracy: Number(q.accuracyRate.toFixed(1)),
    partial: Number(
      (q.partialCount / Math.max(q.correctCount + q.partialCount + q.wrongCount, 1) * 100).toFixed(1),
    ),
    wrong: Number(
      (q.wrongCount / Math.max(q.correctCount + q.partialCount + q.wrongCount, 1) * 100).toFixed(1),
    ),
  }));

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Question Accuracy Rate</CardTitle>
        <CardDescription>Percentage of students who answered each question correctly</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis type="number" domain={[0, 100]} unit="%" fontSize={11} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis dataKey="name" type="category" width={40} fontSize={12} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip
                contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
                formatter={((value: number, name: string) => [`${value}%`, name === 'accuracy' ? 'Correct' : name === 'partial' ? 'Partial' : 'Wrong']) as never}
              />
              <Legend formatter={(value: string) => value === 'accuracy' ? 'Correct' : value === 'partial' ? 'Partial' : 'Wrong'} />
              <Bar dataKey="accuracy" stackId="a" fill={CHART_COLORS.green} />
              <Bar dataKey="partial" stackId="a" fill={CHART_COLORS.amber} />
              <Bar dataKey="wrong" stackId="a" fill={CHART_COLORS.red} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function DifficultyDiscriminationChart({ questions }: { questions: QuestionAnalytics[] }) {
  const scatterData = questions.map((q) => ({
    name: `Q${q.questionNumber}`,
    x: Number(q.difficultyIndex.toFixed(2)),
    y: Number(q.discriminationIndex.toFixed(2)),
    type: q.type,
  }));

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Difficulty vs Discrimination</CardTitle>
        <CardDescription>
          X = Difficulty Index (higher = easier), Y = Discrimination Index (higher = better differentiator)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="x"
                type="number"
                domain={[0, 1]}
                name="Difficulty"
                fontSize={11}
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                label={{ value: 'Difficulty Index', position: 'insideBottom', offset: -5, style: { fill: 'hsl(var(--muted-foreground))', fontSize: 10 } }}
              />
              <YAxis
                dataKey="y"
                type="number"
                domain={[-1, 1]}
                name="Discrimination"
                fontSize={11}
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                label={{ value: 'Discrimination', angle: -90, position: 'insideLeft', style: { fill: 'hsl(var(--muted-foreground))', fontSize: 10 } }}
              />
              <Tooltip
                contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                formatter={((value: number, name: string) => [value.toFixed(2), name]) as never}
                labelFormatter={(_, payload) => payload?.[0]?.payload?.name ?? ''}
              />
              <Scatter data={scatterData} fill={CHART_COLORS.purple}>
                {scatterData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={
                      entry.y >= 0.3
                        ? CHART_COLORS.green
                        : entry.y >= 0.1
                          ? CHART_COLORS.amber
                          : CHART_COLORS.red
                    }
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-green-500" />Good (&ge;0.3)</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" />Acceptable (0.1–0.3)</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500" />Poor (&lt;0.1)</span>
        </div>
      </CardContent>
    </Card>
  );
}

function McqOptionBreakdown({ questions }: { questions: QuestionAnalytics[] }) {
  const mcqQuestions = questions.filter((q) => q.type === 'MCQ' && q.optionAnalysis.length > 0);

  if (mcqQuestions.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">MCQ Option Distribution</CardTitle>
        <CardDescription>How students distributed their answers across options</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {mcqQuestions.map((q) => {
            const chartData = q.optionAnalysis.map((opt) => ({
              name: opt.label,
              value: opt.selectionCount,
              percentage: Number(opt.selectionPercentage.toFixed(1)),
              isCorrect: opt.isCorrect,
              text: opt.text.length > 40 ? `${opt.text.slice(0, 40)}...` : opt.text,
            }));

            return (
              <div key={q.examQuestionId} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">Q{q.questionNumber}</Badge>
                  <span className="text-sm font-medium">{q.title.length > 80 ? `${q.title.slice(0, 80)}...` : q.title}</span>
                </div>
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="name" fontSize={12} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                      <YAxis allowDecimals={false} fontSize={11} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                        labelStyle={{ color: 'hsl(var(--foreground))' }}
                        formatter={((value: number, _name: string, props: { payload: { percentage: number; text: string } }) => [
                          `${value} students (${props.payload.percentage}%)`,
                          props.payload.text,
                        ]) as never}
                      />
                      <Bar dataKey="value" name="Selections" radius={[4, 4, 0, 0]}>
                        {chartData.map((entry, i) => (
                          <Cell key={i} fill={entry.isCorrect ? CHART_COLORS.green : OPTION_COLORS[i % OPTION_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function QuestionPerformanceTable({ questions }: { questions: QuestionAnalytics[] }) {
  const [sortKey, setSortKey] = useState<'number' | 'accuracy' | 'difficulty' | 'discrimination'>('number');
  const [sortAsc, setSortAsc] = useState(true);

  const sorted = [...questions].sort((a, b) => {
    let cmp = 0;
    switch (sortKey) {
      case 'number': cmp = a.questionNumber - b.questionNumber; break;
      case 'accuracy': cmp = a.accuracyRate - b.accuracyRate; break;
      case 'difficulty': cmp = a.difficultyIndex - b.difficultyIndex; break;
      case 'discrimination': cmp = a.discriminationIndex - b.discriminationIndex; break;
    }
    return sortAsc ? cmp : -cmp;
  });

  function handleSort(key: typeof sortKey) {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  }

  const SortIcon = ({ active, asc }: { active: boolean; asc: boolean }) => {
    if (!active) return <Minus className="ml-1 inline h-3 w-3 text-muted-foreground" />;
    return asc ? <ArrowUp className="ml-1 inline h-3 w-3" /> : <ArrowDown className="ml-1 inline h-3 w-3" />;
  };

  function getDifficultyBadge(idx: number) {
    if (idx >= 0.7) return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Easy</Badge>;
    if (idx >= 0.3) return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">Medium</Badge>;
    return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Hard</Badge>;
  }

  function getDiscriminationBadge(idx: number) {
    if (idx >= 0.3) return <Badge variant="outline" className="border-green-500 text-green-700">Good</Badge>;
    if (idx >= 0.1) return <Badge variant="outline" className="border-amber-500 text-amber-700">Fair</Badge>;
    return <Badge variant="outline" className="border-red-500 text-red-700">Poor</Badge>;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Question Performance Details</CardTitle>
        <CardDescription>Click column headers to sort</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="cursor-pointer select-none whitespace-nowrap" onClick={() => handleSort('number')}>
                  # <SortIcon active={sortKey === 'number'} asc={sortAsc} />
                </TableHead>
                <TableHead className="min-w-50">Question</TableHead>
                <TableHead className="text-center">Type</TableHead>
                <TableHead className="text-center">Marks</TableHead>
                <TableHead className="cursor-pointer select-none text-center whitespace-nowrap" onClick={() => handleSort('accuracy')}>
                  Accuracy <SortIcon active={sortKey === 'accuracy'} asc={sortAsc} />
                </TableHead>
                <TableHead className="text-center">Correct</TableHead>
                <TableHead className="text-center">Partial</TableHead>
                <TableHead className="text-center">Wrong</TableHead>
                <TableHead className="text-center">Skipped</TableHead>
                <TableHead className="text-center whitespace-nowrap">Avg Marks</TableHead>
                <TableHead className="cursor-pointer select-none text-center whitespace-nowrap" onClick={() => handleSort('difficulty')}>
                  Difficulty <SortIcon active={sortKey === 'difficulty'} asc={sortAsc} />
                </TableHead>
                <TableHead className="cursor-pointer select-none text-center whitespace-nowrap" onClick={() => handleSort('discrimination')}>
                  Discrim. <SortIcon active={sortKey === 'discrimination'} asc={sortAsc} />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((q) => (
                <TableRow key={q.examQuestionId}>
                  <TableCell className="font-medium">Q{q.questionNumber}</TableCell>
                  <TableCell className="max-w-62.5 truncate text-sm">
                    {q.title}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary" className="text-xs">{q.type.replace('_', ' ')}</Badge>
                  </TableCell>
                  <TableCell className="text-center">{q.maxMarks}</TableCell>
                  <TableCell className="text-center font-medium">
                    <span className={cn(
                      q.accuracyRate >= 70 ? 'text-green-600' :
                      q.accuracyRate >= 40 ? 'text-amber-600' : 'text-red-600',
                    )}>
                      {q.accuracyRate.toFixed(1)}%
                    </span>
                  </TableCell>
                  <TableCell className="text-center text-green-600">{q.correctCount}</TableCell>
                  <TableCell className="text-center text-amber-600">{q.partialCount}</TableCell>
                  <TableCell className="text-center text-red-600">{q.wrongCount}</TableCell>
                  <TableCell className="text-center text-muted-foreground">{q.unansweredCount}</TableCell>
                  <TableCell className="text-center">
                    {q.avgMarksAwarded.toFixed(1)} / {q.maxMarks}
                  </TableCell>
                  <TableCell className="text-center">{getDifficultyBadge(q.difficultyIndex)}</TableCell>
                  <TableCell className="text-center">{getDiscriminationBadge(q.discriminationIndex)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// Time Analytics Section
// ============================================

function TimeAnalytics({ data }: { data: ExamDetailedAnalytics }) {
  if (data.avgCompletionTime == null) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No time data available for this exam.
        </CardContent>
      </Card>
    );
  }

  const questionTimeData = data.questions
    .filter((q) => q.avgTimeSpent != null)
    .map((q) => ({
      name: `Q${q.questionNumber}`,
      seconds: Number((q.avgTimeSpent! ).toFixed(0)),
      minutes: Number((q.avgTimeSpent! / 60).toFixed(1)),
    }));

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <KpiCard
          icon={<Clock className="h-4 w-4 text-blue-600" />}
          label="Average Time"
          value={`${data.avgCompletionTime.toFixed(1)} min`}
          variant="default"
        />
        <KpiCard
          icon={<ArrowDown className="h-4 w-4 text-green-600" />}
          label="Fastest"
          value={`${data.fastestTime!.toFixed(1)} min`}
          variant="success"
        />
        <KpiCard
          icon={<ArrowUp className="h-4 w-4 text-red-600" />}
          label="Slowest"
          value={`${data.slowestTime!.toFixed(1)} min`}
          variant="danger"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Completion Time Distribution */}
        {data.timeDistribution.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Completion Time Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.timeDistribution}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="range" fontSize={11} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis allowDecimals={false} fontSize={11} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                      labelStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Bar dataKey="count" fill={CHART_COLORS.blue} radius={[4, 4, 0, 0]} name="Students" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Average Time per Question */}
        {questionTimeData.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Avg. Time per Question</CardTitle>
              <CardDescription>Average seconds spent on each question</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={questionTimeData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="name" fontSize={11} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis allowDecimals={false} fontSize={11} tick={{ fill: 'hsl(var(--muted-foreground))' }} unit="s" />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                      labelStyle={{ color: 'hsl(var(--foreground))' }}
                      formatter={((value: number) => [`${value}s`, 'Avg. Time']) as never}
                    />
                    <Bar dataKey="seconds" fill={CHART_COLORS.teal} radius={[4, 4, 0, 0]} name="Avg. Time" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// ============================================
// Anti-Cheat Summary Section
// ============================================

function AntiCheatSummary({ data }: { data: ExamDetailedAnalytics }) {
  const hasAnyViolations =
    data.flaggedCount > 0 ||
    data.avgTabSwitches > 0 ||
    data.totalCopyPasteAttempts > 0 ||
    data.totalFullscreenExits > 0;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          icon={<ShieldAlert className="h-4 w-4 text-amber-600" />}
          label="Flagged Sessions"
          value={String(data.flaggedCount)}
          subtext={`of ${data.totalStudents} total`}
          variant={data.flaggedCount > 0 ? 'warning' : 'default'}
        />
        <KpiCard
          icon={<AlertTriangle className="h-4 w-4 text-amber-600" />}
          label="Avg. Tab Switches"
          value={data.avgTabSwitches.toFixed(1)}
          variant={data.avgTabSwitches > 2 ? 'warning' : 'default'}
        />
        <KpiCard
          icon={<AlertTriangle className="h-4 w-4 text-red-600" />}
          label="Copy/Paste Attempts"
          value={String(data.totalCopyPasteAttempts)}
          subtext="across all sessions"
          variant={data.totalCopyPasteAttempts > 0 ? 'danger' : 'default'}
        />
        <KpiCard
          icon={<AlertTriangle className="h-4 w-4 text-amber-600" />}
          label="Fullscreen Exits"
          value={String(data.totalFullscreenExits)}
          subtext="across all sessions"
          variant={data.totalFullscreenExits > 0 ? 'warning' : 'default'}
        />
      </div>

      {!hasAnyViolations && (
        <Card>
          <CardContent className="flex items-center justify-center gap-2 py-6 text-sm text-green-600">
            <CheckCircle2 className="h-4 w-4" />
            No anti-cheat violations detected for this exam.
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ============================================
// Question Difficulty Radar
// ============================================

function QuestionRadarChart({ questions }: { questions: QuestionAnalytics[] }) {
  if (questions.length < 3) return null;

  const radarData = questions.map((q) => ({
    question: `Q${q.questionNumber}`,
    accuracy: Number(q.accuracyRate.toFixed(1)),
    avgMarksPercent: q.maxMarks > 0 ? Number(((q.avgMarksAwarded / q.maxMarks) * 100).toFixed(1)) : 0,
  }));

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Question Performance Radar</CardTitle>
        <CardDescription>Accuracy rate vs average marks percentage per question</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid className="stroke-border" />
              <PolarAngleAxis dataKey="question" fontSize={11} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} fontSize={10} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
              <Radar name="Accuracy %" dataKey="accuracy" stroke={CHART_COLORS.green} fill={CHART_COLORS.green} fillOpacity={0.2} />
              <Radar name="Avg Marks %" dataKey="avgMarksPercent" stroke={CHART_COLORS.blue} fill={CHART_COLORS.blue} fillOpacity={0.1} />
              <Legend />
              <Tooltip
                contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// Main Component (Exported)
// ============================================

type Props = {
  analytics: ExamDetailedAnalytics;
};

export function ExamDetailedAnalyticsDashboard({ analytics }: Props) {
  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList className="flex-wrap">
        <TabsTrigger value="overview" className="gap-1.5">
          <BarChart3 className="h-3.5 w-3.5" /> Overview
        </TabsTrigger>
        <TabsTrigger value="questions" className="gap-1.5">
          <Target className="h-3.5 w-3.5" /> Questions
        </TabsTrigger>
        <TabsTrigger value="time" className="gap-1.5">
          <Clock className="h-3.5 w-3.5" /> Time
        </TabsTrigger>
        <TabsTrigger value="integrity" className="gap-1.5">
          <ShieldAlert className="h-3.5 w-3.5" /> Integrity
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-4">
        <ScoreOverview data={analytics} />
      </TabsContent>

      <TabsContent value="questions" className="space-y-4">
        <QuestionAccuracyChart questions={analytics.questions} />

        <div className="grid gap-4 lg:grid-cols-2">
          <DifficultyDiscriminationChart questions={analytics.questions} />
          <QuestionRadarChart questions={analytics.questions} />
        </div>

        <McqOptionBreakdown questions={analytics.questions} />
        <QuestionPerformanceTable questions={analytics.questions} />
      </TabsContent>

      <TabsContent value="time" className="space-y-4">
        <TimeAnalytics data={analytics} />
      </TabsContent>

      <TabsContent value="integrity" className="space-y-4">
        <AntiCheatSummary data={analytics} />
      </TabsContent>
    </Tabs>
  );
}
