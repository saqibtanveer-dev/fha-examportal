'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  User,
  GraduationCap,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import Link from 'next/link';

type StudentData = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  studentProfile: {
    id: string;
    rollNumber: string;
    registrationNo: string;
    status: string;
    gender: string | null;
    guardianName: string | null;
    guardianPhone: string | null;
    dateOfBirth: string | null;
    enrollmentDate: string;
    class: { id: string; name: string; grade: number };
    section: { id: string; name: string };
  };
  results: {
    id: string;
    totalMarks: number;
    obtainedMarks: number;
    percentage: number;
    grade: string | null;
    isPassed: boolean;
    rank: number | null;
    createdAt: string;
    exam: {
      id: string;
      title: string;
      type: string;
      subject: { name: string; code: string };
      createdBy: { firstName: string; lastName: string };
    };
  }[];
  sessions: {
    id: string;
    status: string;
    startedAt: string | null;
    submittedAt: string | null;
    timeSpent: number | null;
    tabSwitchCount: number;
    isFlagged: boolean;
    exam: { title: string; duration: number };
  }[];
  performance: {
    totalExams: number;
    passedExams: number;
    failedExams: number;
    passRate: number;
    avgPercentage: number;
    highestPercentage: number;
    lowestPercentage: number;
  };
  subjectPerformance: {
    subject: string;
    exams: number;
    avgPercentage: number;
    passRate: number;
  }[];
  timeline: {
    date: string;
    percentage: number;
    exam: string;
    subject: string;
  }[];
};

type Props = { student: StudentData };

export function StudentDetailClient({ student }: Props) {
  const perf = student.performance;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/principal/students">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <PageHeader
          title={`${student.firstName} ${student.lastName}`}
          description={`${student.studentProfile.class.name} - Section ${student.studentProfile.section.name} | Roll: ${student.studentProfile.rollNumber}`}
        />
      </div>

      {/* Profile + Performance */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Student Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow icon={Mail} label="Email" value={student.email} />
            <InfoRow icon={Phone} label="Phone" value={student.phone ?? 'Not provided'} />
            <InfoRow icon={User} label="Gender" value={student.studentProfile.gender ?? 'Not specified'} />
            <InfoRow
              icon={Calendar}
              label="Date of Birth"
              value={
                student.studentProfile.dateOfBirth
                  ? new Date(student.studentProfile.dateOfBirth).toLocaleDateString()
                  : 'Not specified'
              }
            />
            <InfoRow
              icon={GraduationCap}
              label="Registration"
              value={student.studentProfile.registrationNo}
            />
            <InfoRow
              icon={Calendar}
              label="Enrolled"
              value={new Date(student.studentProfile.enrollmentDate).toLocaleDateString()}
            />
            {student.studentProfile.guardianName && (
              <InfoRow icon={User} label="Guardian" value={student.studentProfile.guardianName} />
            )}
            {student.studentProfile.guardianPhone && (
              <InfoRow icon={Phone} label="Guardian Phone" value={student.studentProfile.guardianPhone} />
            )}
            <div className="flex items-center gap-2 pt-2">
              <span className="text-xs text-muted-foreground">Status:</span>
              <Badge variant={student.studentProfile.status === 'ACTIVE' ? 'default' : 'secondary'}>
                {student.studentProfile.status}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Performance Summary */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Performance Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard label="Exams Taken" value={String(perf.totalExams)} color="text-foreground" />
              <StatCard label="Pass Rate" value={`${perf.passRate}%`} color={perf.passRate >= 60 ? 'text-green-600' : 'text-red-600'} />
              <StatCard label="Avg Score" value={`${perf.avgPercentage}%`} color={perf.avgPercentage >= 60 ? 'text-green-600' : 'text-amber-600'} />
              <StatCard label="Highest" value={`${perf.highestPercentage}%`} color="text-green-600" />
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3">
              <Card className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
                <CardContent className="flex items-center gap-2 py-3">
                  <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
                  <div>
                    <p className="text-lg font-bold text-green-700 dark:text-green-300">{perf.passedExams}</p>
                    <p className="text-[10px] text-green-600 dark:text-green-400">Passed</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
                <CardContent className="flex items-center gap-2 py-3">
                  <XCircle className="h-4 w-4 text-red-600 shrink-0" />
                  <div>
                    <p className="text-lg font-bold text-red-700 dark:text-red-300">{perf.failedExams}</p>
                    <p className="text-[10px] text-red-600 dark:text-red-400">Failed</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
                <CardContent className="flex items-center gap-2 py-3">
                  <TrendingDown className="h-4 w-4 text-blue-600 shrink-0" />
                  <div>
                    <p className="text-lg font-bold text-blue-700 dark:text-blue-300">{perf.lowestPercentage}%</p>
                    <p className="text-[10px] text-blue-600 dark:text-blue-400">Lowest</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Performance Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Performance Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {student.timeline.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={student.timeline}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="exam" fontSize={10} angle={-20} textAnchor="end" />
                    <YAxis domain={[0, 100]} fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '8px',
                        border: '1px solid hsl(var(--border))',
                        backgroundColor: 'hsl(var(--card))',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="percentage"
                      stroke="hsl(var(--chart-1))"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      name="Score %"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  No exam data yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Subject Performance Radar */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Subject Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {student.subjectPerformance.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  {student.subjectPerformance.length >= 3 ? (
                    <RadarChart data={student.subjectPerformance}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" fontSize={11} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} fontSize={10} />
                      <Radar
                        name="Avg Score"
                        dataKey="avgPercentage"
                        stroke="hsl(var(--chart-1))"
                        fill="hsl(var(--chart-1))"
                        fillOpacity={0.3}
                      />
                    </RadarChart>
                  ) : (
                    <BarChart data={student.subjectPerformance}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="subject" fontSize={12} />
                      <YAxis domain={[0, 100]} fontSize={12} />
                      <Tooltip />
                      <Bar
                        dataKey="avgPercentage"
                        fill="hsl(var(--chart-1))"
                        radius={[4, 4, 0, 0]}
                        name="Avg %"
                      />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  No subject data yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subject Performance Table */}
      {student.subjectPerformance.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Subject-wise Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {student.subjectPerformance.map((sp) => (
                <div key={sp.subject} className="rounded-lg border p-3">
                  <p className="font-medium text-sm">{sp.subject}</p>
                  <div className="mt-2 flex gap-4 text-xs">
                    <span>Exams: <b>{sp.exams}</b></span>
                    <span>Avg: <b className={sp.avgPercentage >= 60 ? 'text-green-600' : 'text-red-600'}>{sp.avgPercentage}%</b></span>
                    <span>Pass: <b>{sp.passRate}%</b></span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Exam Results ({student.results.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {/* Mobile view */}
          <div className="space-y-3 p-4 md:hidden">
            {student.results.map((result) => (
              <div key={result.id} className="rounded-lg border p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{result.exam.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {result.exam.subject.code} &bull; {result.exam.type}
                    </p>
                  </div>
                  {result.isPassed ? (
                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                      Passed
                    </Badge>
                  ) : (
                    <Badge variant="destructive">Failed</Badge>
                  )}
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2 text-center text-xs">
                  <div>
                    <p className="font-semibold">{result.obtainedMarks}/{result.totalMarks}</p>
                    <p className="text-muted-foreground">Marks</p>
                  </div>
                  <div>
                    <p className="font-semibold">{result.percentage}%</p>
                    <p className="text-muted-foreground">Score</p>
                  </div>
                  <div>
                    <p className="font-semibold">{result.grade ?? '—'}</p>
                    <p className="text-muted-foreground">Grade</p>
                  </div>
                </div>
              </div>
            ))}
            {student.results.length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">No results yet</p>
            )}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Exam</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-center">Marks</TableHead>
                  <TableHead className="text-center">Score</TableHead>
                  <TableHead className="text-center">Grade</TableHead>
                  <TableHead className="text-center">Rank</TableHead>
                  <TableHead>Result</TableHead>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {student.results.map((result) => (
                  <TableRow key={result.id}>
                    <TableCell>
                      <Link
                        href={`/principal/exams/${result.exam.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {result.exam.title}
                      </Link>
                    </TableCell>
                    <TableCell>{result.exam.subject.code}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{result.exam.type}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {result.obtainedMarks}/{result.totalMarks}
                    </TableCell>
                    <TableCell className="text-center font-semibold">
                      {result.percentage}%
                    </TableCell>
                    <TableCell className="text-center">{result.grade ?? '—'}</TableCell>
                    <TableCell className="text-center">{result.rank ?? '—'}</TableCell>
                    <TableCell>
                      {result.isPassed ? (
                        <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                          Pass
                        </Badge>
                      ) : (
                        <Badge variant="destructive">Fail</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {result.exam.createdBy.firstName} {result.exam.createdBy.lastName}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(result.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
                {student.results.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} className="py-8 text-center text-muted-foreground">
                      No results yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Flagged Sessions */}
      {student.sessions.some((s) => s.isFlagged) && (
        <Card className="border-amber-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-amber-700">
              <AlertTriangle className="h-4 w-4" />
              Flagged Exam Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {student.sessions
                .filter((s) => s.isFlagged)
                .map((session) => (
                  <div key={session.id} className="flex items-center justify-between rounded-md border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950">
                    <div>
                      <p className="text-sm font-medium">{session.exam.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Tab switches: {session.tabSwitchCount}
                      </p>
                    </div>
                    <Badge variant="outline" className="border-amber-500 text-amber-700">
                      Flagged
                    </Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.FC<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate text-sm">{value}</p>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-lg border p-3 text-center">
      <p className={`text-xl font-bold ${color}`}>{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}
