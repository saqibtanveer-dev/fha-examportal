'use client';

import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ArrowLeft,
  Users,
  BarChart3,
  Clock,
  FileText,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Shield,
  TrendingUp,
  Award,
  Target,
} from 'lucide-react';
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
  Legend,
} from 'recharts';
import { ROUTES } from '@/lib/constants';
import type { ExamDetailedAnalytics } from '@/modules/results/result-queries';

type ExamInfo = {
  id: string;
  title: string;
  description: string | null;
  type: string;
  status: string;
  totalMarks: number;
  passingMarks: number;
  duration: number;
  instructions: string | null;
  shuffleQuestions: boolean;
  allowReview: boolean;
  maxAttempts: number;
  scheduledStartAt: string | null;
  scheduledEndAt: string | null;
  createdAt: string;
  updatedAt: string;
  subject: { id: string; name: string; code: string };
  createdBy: { id: string; firstName: string; lastName: string };
  _count: { examQuestions: number; examResults: number };
  examClassAssignments: {
    class: { id: string; name: string };
    section: { id: string; name: string } | null;
  }[];
};

type Props = {
  exam: ExamInfo;
  analytics: ExamDetailedAnalytics | null;
};

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  PUBLISHED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  ACTIVE: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  COMPLETED: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  ARCHIVED: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
};

const typeLabels: Record<string, string> = {
  QUIZ: 'Quiz',
  MIDTERM: 'Midterm',
  FINAL: 'Final',
  PRACTICE: 'Practice',
  CUSTOM: 'Custom',
};

export function ExamDetailClient({ exam, analytics }: Props) {
  const router = useRouter();

  const formatDate = (iso: string | null) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(ROUTES.PRINCIPAL.EXAMS)}
            className="mt-0.5 shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{exam.title}</h1>
            <p className="text-muted-foreground text-sm">
              {exam.subject.name} ({exam.subject.code}) · Created by{' '}
              {exam.createdBy.firstName} {exam.createdBy.lastName}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={statusColors[exam.status] ?? ''} variant="secondary">
            {exam.status}
          </Badge>
          <Badge variant="outline">{typeLabels[exam.type] ?? exam.type}</Badge>
        </div>
      </div>

      {/* Exam Info Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <InfoCard icon={FileText} label="Questions" value={exam._count.examQuestions} />
        <InfoCard icon={Users} label="Attempts" value={exam._count.examResults} />
        <InfoCard icon={Target} label="Total Marks" value={exam.totalMarks} />
        <InfoCard icon={Award} label="Passing" value={exam.passingMarks} />
        <InfoCard icon={Clock} label="Duration" value={`${exam.duration}m`} />
        <InfoCard icon={TrendingUp} label="Max Attempts" value={exam.maxAttempts} />
      </div>

      {/* Exam Configuration + Scheduling */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <ConfigRow label="Shuffle Questions" value={exam.shuffleQuestions ? 'Yes' : 'No'} />
              <ConfigRow label="Allow Review" value={exam.allowReview ? 'Yes' : 'No'} />
              <ConfigRow label="Scheduled Start" value={formatDate(exam.scheduledStartAt)} />
              <ConfigRow label="Scheduled End" value={formatDate(exam.scheduledEndAt)} />
              <ConfigRow label="Created" value={formatDate(exam.createdAt)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Assigned Classes</CardTitle>
            <CardDescription>
              {exam.examClassAssignments.length} class assignment{exam.examClassAssignments.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {exam.examClassAssignments.length === 0 ? (
              <p className="text-muted-foreground text-sm">No class assignments</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {exam.examClassAssignments.map((a, i) => (
                  <Badge key={i} variant="outline" className="text-sm">
                    {a.class.name}
                    {a.section && ` - ${a.section.name}`}
                  </Badge>
                ))}
              </div>
            )}
            {exam.description && (
              <div className="mt-4 border-t pt-3">
                <p className="text-muted-foreground text-xs font-medium uppercase">Description</p>
                <p className="mt-1 text-sm">{exam.description}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Analytics Section */}
      {analytics ? (
        <AnalyticsSection analytics={analytics} />
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <BarChart3 className="text-muted-foreground mx-auto mb-3 h-12 w-12" />
            <h3 className="text-lg font-semibold">No Analytics Available</h3>
            <p className="text-muted-foreground text-sm">
              Analytics will appear once students submit their exams.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────

function InfoCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-4 text-center">
        <Icon className="text-muted-foreground mb-1 h-5 w-5" />
        <p className="text-muted-foreground text-xs">{label}</p>
        <p className="text-lg font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}

function ConfigRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

// ── Analytics Section ───────────────────────────────────────────

function AnalyticsSection({ analytics }: { analytics: ExamDetailedAnalytics }) {
  return (
    <div className="space-y-6">
      {/* Overall Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard
          label="Total Students"
          value={analytics.totalStudents}
          icon={Users}
        />
        <StatCard
          label="Passed"
          value={analytics.passed}
          icon={CheckCircle2}
          color="text-green-600"
        />
        <StatCard
          label="Failed"
          value={analytics.failed}
          icon={XCircle}
          color="text-red-600"
        />
        <StatCard
          label="Pass Rate"
          value={`${Math.round(analytics.passRate)}%`}
          icon={TrendingUp}
          color={analytics.passRate >= 50 ? 'text-green-600' : 'text-red-600'}
        />
        <StatCard
          label="Average"
          value={`${Math.round(analytics.avgPercentage * 10) / 10}%`}
          icon={BarChart3}
        />
        <StatCard
          label="Median"
          value={`${Math.round(analytics.medianPercentage * 10) / 10}%`}
          icon={Target}
        />
      </div>

      {/* Statistical Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Statistical Summary</CardTitle>
          <CardDescription>Distribution metrics and quartile analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
            <div>
              <p className="text-muted-foreground">Std Deviation</p>
              <p className="text-lg font-bold">{Math.round(analytics.stdDeviation * 100) / 100}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Min Score</p>
              <p className="text-lg font-bold">{Math.round(analytics.minPercentage * 10) / 10}%</p>
            </div>
            <div>
              <p className="text-muted-foreground">Max Score</p>
              <p className="text-lg font-bold">{Math.round(analytics.maxPercentage * 10) / 10}%</p>
            </div>
            <div>
              <p className="text-muted-foreground">IQR (Q1–Q3)</p>
              <p className="text-lg font-bold">
                {Math.round(analytics.q1Percentage)}% – {Math.round(analytics.q3Percentage)}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Score Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Score Distribution</CardTitle>
            <CardDescription>Student count by percentage range</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={analytics.scoreDistribution}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="range" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Students" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Grade Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Grade Distribution</CardTitle>
            <CardDescription>Breakdown by grade</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.gradeDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={analytics.gradeDistribution}
                    dataKey="count"
                    nameKey="grade"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={((entry: any) => `${entry.grade}: ${entry.count}`) as any}
                  >
                    {analytics.gradeDistribution.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground py-12 text-center text-sm">No grade data</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Time Analytics */}
      {analytics.avgCompletionTime !== null && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Time Analytics</CardTitle>
              <CardDescription>Completion time statistics (in minutes)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <p className="text-muted-foreground">Fastest</p>
                  <p className="text-xl font-bold text-green-600">
                    {analytics.fastestTime !== null ? `${Math.round(analytics.fastestTime)}m` : '—'}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground">Average</p>
                  <p className="text-xl font-bold">
                    {Math.round(analytics.avgCompletionTime)}m
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground">Slowest</p>
                  <p className="text-xl font-bold text-red-600">
                    {analytics.slowestTime !== null ? `${Math.round(analytics.slowestTime)}m` : '—'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {analytics.timeDistribution.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Time Distribution</CardTitle>
                <CardDescription>Student count by completion time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={analytics.timeDistribution}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="range" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Students" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Anti-Cheat Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-4 w-4" />
            Anti-Cheat Summary
          </CardTitle>
          <CardDescription>Integrity monitoring statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
            <div className="text-center">
              <p className="text-muted-foreground">Flagged Sessions</p>
              <p className={`text-2xl font-bold ${analytics.flaggedCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {analytics.flaggedCount}
              </p>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground">Avg Tab Switches</p>
              <p className={`text-2xl font-bold ${analytics.avgTabSwitches > 3 ? 'text-yellow-600' : ''}`}>
                {Math.round(analytics.avgTabSwitches * 10) / 10}
              </p>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground">Copy/Paste Attempts</p>
              <p className={`text-2xl font-bold ${analytics.totalCopyPasteAttempts > 0 ? 'text-yellow-600' : ''}`}>
                {analytics.totalCopyPasteAttempts}
              </p>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground">Fullscreen Exits</p>
              <p className={`text-2xl font-bold ${analytics.totalFullscreenExits > 3 ? 'text-yellow-600' : ''}`}>
                {analytics.totalFullscreenExits}
              </p>
            </div>
          </div>
          {analytics.flaggedCount > 0 && (
            <div className="mt-4 flex items-center gap-2 rounded-md border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-700 dark:text-red-400">
                {analytics.flaggedCount} session{analytics.flaggedCount > 1 ? 's' : ''} flagged for
                suspicious activity. Review recommended.
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Per-Question Analytics */}
      {analytics.questions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Per-Question Analytics</CardTitle>
            <CardDescription>
              Detailed breakdown of each question&apos;s performance, difficulty, and discrimination
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Mobile View */}
            <div className="space-y-4 lg:hidden">
              {analytics.questions.map((q) => (
                <div key={q.examQuestionId} className="rounded-lg border p-4">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium">Q{q.questionNumber}</p>
                      <p className="text-muted-foreground max-w-62.5 truncate text-xs">
                        {q.title}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Badge variant="outline" className="text-[10px]">{q.type}</Badge>
                      <Badge variant="outline" className="text-[10px]">{q.difficulty}</Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center">
                      <p className="text-muted-foreground">Accuracy</p>
                      <p className="font-bold">{Math.round(q.accuracyRate)}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-muted-foreground">Avg Marks</p>
                      <p className="font-bold">
                        {Math.round(q.avgMarksAwarded * 10) / 10}/{q.maxMarks}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-muted-foreground">Attempted</p>
                      <p className="font-bold">
                        {q.attemptedCount}/{q.totalStudents}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <Progress value={q.accuracyRate} className="h-1.5" />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[10px]">
                    <span>
                      DI: {Math.round(q.difficultyIndex * 100)}% · Disc:{' '}
                      {Math.round(q.discriminationIndex * 100) / 100}
                    </span>
                    {q.avgTimeSpent !== null && (
                      <span>{Math.round(q.avgTimeSpent)}s avg</span>
                    )}
                  </div>
                  {/* MCQ Option Analysis */}
                  {q.optionAnalysis.length > 0 && (
                    <div className="mt-2 space-y-1 border-t pt-2">
                      {q.optionAnalysis.map((opt) => (
                        <div key={opt.label} className="flex items-center gap-2 text-xs">
                          <span
                            className={`w-6 text-center font-medium ${
                              opt.isCorrect ? 'text-green-600' : ''
                            }`}
                          >
                            {opt.label}
                          </span>
                          <div className="bg-muted h-2 flex-1 overflow-hidden rounded-full">
                            <div
                              className={`h-full rounded-full ${
                                opt.isCorrect ? 'bg-green-500' : 'bg-gray-400'
                              }`}
                              style={{ width: `${Math.min(opt.selectionPercentage, 100)}%` }}
                            />
                          </div>
                          <span className="text-muted-foreground w-10 text-right">
                            {Math.round(opt.selectionPercentage)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Desktop Table */}
            <div className="hidden lg:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Question</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Difficulty</TableHead>
                    <TableHead className="text-center">Marks</TableHead>
                    <TableHead className="text-center">Attempted</TableHead>
                    <TableHead className="text-center">Correct</TableHead>
                    <TableHead className="text-center">Partial</TableHead>
                    <TableHead className="text-center">Wrong</TableHead>
                    <TableHead className="text-right">Accuracy</TableHead>
                    <TableHead className="text-right">DI</TableHead>
                    <TableHead className="text-right">Disc.</TableHead>
                    <TableHead className="text-right">Avg Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analytics.questions.map((q) => (
                    <TableRow key={q.examQuestionId}>
                      <TableCell className="font-medium">Q{q.questionNumber}</TableCell>
                      <TableCell>
                        <span className="block max-w-62.5 truncate text-sm">{q.title}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px]">{q.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <DifficultyBadge difficulty={q.difficulty} />
                      </TableCell>
                      <TableCell className="text-center">
                        {Math.round(q.avgMarksAwarded * 10) / 10}/{q.maxMarks}
                      </TableCell>
                      <TableCell className="text-center">
                        {q.attemptedCount}/{q.totalStudents}
                      </TableCell>
                      <TableCell className="text-center text-green-600">{q.correctCount}</TableCell>
                      <TableCell className="text-center text-yellow-600">{q.partialCount}</TableCell>
                      <TableCell className="text-center text-red-600">{q.wrongCount}</TableCell>
                      <TableCell className="text-right">
                        <span className={q.accuracyRate >= 50 ? 'text-green-600' : 'text-red-600'}>
                          {Math.round(q.accuracyRate)}%
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {Math.round(q.difficultyIndex * 100)}%
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={
                            q.discriminationIndex >= 0.3
                              ? 'text-green-600'
                              : q.discriminationIndex >= 0.1
                                ? 'text-yellow-600'
                                : 'text-red-600'
                          }
                        >
                          {Math.round(q.discriminationIndex * 100) / 100}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-right">
                        {q.avgTimeSpent !== null ? `${Math.round(q.avgTimeSpent)}s` : '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ── Helpers ─────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color?: string;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-4 text-center">
        <Icon className={`mb-1 h-5 w-5 ${color ?? 'text-muted-foreground'}`} />
        <p className="text-muted-foreground text-xs">{label}</p>
        <p className={`text-lg font-bold ${color ?? ''}`}>{value}</p>
      </CardContent>
    </Card>
  );
}

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const color =
    difficulty === 'HARD'
      ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      : difficulty === 'MEDIUM'
        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
        : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';

  return (
    <Badge className={color} variant="secondary">
      {difficulty}
    </Badge>
  );
}
