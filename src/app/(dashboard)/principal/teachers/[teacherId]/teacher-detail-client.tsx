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
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  BookOpen,
  ClipboardList,
  FileQuestion,
  TrendingUp,
  CheckCircle,
} from 'lucide-react';
import Link from 'next/link';

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

type TeacherData = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  teacherProfile: {
    id: string;
    employeeId: string;
    qualification: string | null;
    specialization: string | null;
    joiningDate: string;
    teacherSubjects: {
      subject: { id: string; name: string; code: string };
      class: { id: string; name: string; grade: number } | null;
    }[];
  };
  exams: {
    id: string;
    title: string;
    type: string;
    status: string;
    totalMarks: number;
    duration: number;
    scheduledStartAt: string | null;
    createdAt: string;
    subject: { name: string; code: string };
    _count: { examQuestions: number; examSessions: number; examResults: number };
  }[];
  questionStats: { type: string; count: number }[];
  gradingStats: { pendingGrading: number; gradedCount: number };
  performanceSummary: {
    totalResults: number;
    passedResults: number;
    failedResults: number;
    passRate: number;
    avgPercentage: number;
  };
};

type Props = { teacher: TeacherData };

export function TeacherDetailClient({ teacher }: Props) {
  const perf = teacher.performanceSummary;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/principal/teachers">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <PageHeader
          title={`${teacher.firstName} ${teacher.lastName}`}
          description={`Employee ID: ${teacher.teacherProfile.employeeId}`}
        />
      </div>

      {/* Profile Info + Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Profile Card */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow icon={Mail} label="Email" value={teacher.email} />
            <InfoRow icon={Phone} label="Phone" value={teacher.phone ?? 'Not provided'} />
            <InfoRow
              icon={Calendar}
              label="Joined"
              value={new Date(teacher.teacherProfile.joiningDate).toLocaleDateString()}
            />
            <InfoRow
              icon={BookOpen}
              label="Qualification"
              value={teacher.teacherProfile.qualification ?? 'Not specified'}
            />
            <InfoRow
              icon={TrendingUp}
              label="Specialization"
              value={teacher.teacherProfile.specialization ?? 'Not specified'}
            />
            <div className="flex items-center gap-2 pt-2">
              <span className="text-xs text-muted-foreground">Status:</span>
              <Badge variant={teacher.isActive ? 'default' : 'secondary'}>
                {teacher.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            {teacher.lastLoginAt && (
              <p className="text-xs text-muted-foreground">
                Last login: {new Date(teacher.lastLoginAt).toLocaleString()}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Performance Stats */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Performance Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              <StatBox label="Exams Created" value={String(teacher.exams.length)} icon={ClipboardList} />
              <StatBox
                label="Questions"
                value={String(teacher.questionStats.reduce((s, q) => s + q.count, 0))}
                icon={FileQuestion}
              />
              <StatBox label="Results" value={String(perf.totalResults)} icon={CheckCircle} />
              <StatBox label="Pass Rate" value={`${perf.passRate}%`} icon={TrendingUp} />
              <StatBox label="Avg Score" value={`${perf.avgPercentage}%`} icon={TrendingUp} />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <Card className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950">
                <CardContent className="py-3 text-center">
                  <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                    {teacher.gradingStats.pendingGrading}
                  </p>
                  <p className="text-xs text-amber-600 dark:text-amber-400">Pending Grading</p>
                </CardContent>
              </Card>
              <Card className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
                <CardContent className="py-3 text-center">
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                    {teacher.gradingStats.gradedCount}
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400">Graded</p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Question Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Question Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              {teacher.questionStats.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={teacher.questionStats}
                      dataKey="count"
                      nameKey="type"
                      cx="50%"
                      cy="50%"
                      outerRadius="75%"
                      label={({ type, count }: any) => `${type}: ${count}`}
                    >
                      {teacher.questionStats.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  No questions created
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Exam Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Exam Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              {perf.totalResults > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { label: 'Passed', value: perf.passedResults },
                      { label: 'Failed', value: perf.failedResults },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="label" fontSize={12} />
                    <YAxis allowDecimals={false} fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      <Cell fill="hsl(var(--chart-2))" />
                      <Cell fill="hsl(var(--chart-1))" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  No exam results yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subjects Assigned */}
      {teacher.teacherProfile.teacherSubjects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Assigned Subjects ({teacher.teacherProfile.teacherSubjects.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {teacher.teacherProfile.teacherSubjects.map((ts, i) => (
                <Badge key={i} variant="outline" className="px-3 py-1">
                  {ts.subject.name} ({ts.subject.code})
                  {ts.class && ` — ${ts.class.name}`}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Exams Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Exams Created ({teacher.exams.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {/* Mobile cards */}
          <div className="space-y-3 p-4 md:hidden">
            {teacher.exams.map((exam) => (
              <Link key={exam.id} href={`/principal/exams/${exam.id}`}>
                <div className="rounded-lg border p-3 transition-colors hover:bg-accent">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{exam.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {exam.subject.code} &bull; {exam.type}
                      </p>
                    </div>
                    <Badge variant="outline" className="shrink-0 text-[10px]">
                      {exam.status}
                    </Badge>
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-2 text-center text-xs">
                    <div>
                      <p className="font-semibold">{exam._count.examQuestions}</p>
                      <p className="text-muted-foreground">Questions</p>
                    </div>
                    <div>
                      <p className="font-semibold">{exam._count.examSessions}</p>
                      <p className="text-muted-foreground">Sessions</p>
                    </div>
                    <div>
                      <p className="font-semibold">{exam._count.examResults}</p>
                      <p className="text-muted-foreground">Results</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
            {teacher.exams.length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No exams created yet
              </p>
            )}
          </div>

          {/* Desktop table */}
          <div className="hidden overflow-x-auto md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Questions</TableHead>
                  <TableHead className="text-center">Sessions</TableHead>
                  <TableHead className="text-center">Results</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teacher.exams.map((exam) => (
                  <TableRow key={exam.id}>
                    <TableCell>
                      <Link
                        href={`/principal/exams/${exam.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {exam.title}
                      </Link>
                    </TableCell>
                    <TableCell>{exam.subject.code}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{exam.type}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{exam.status}</Badge>
                    </TableCell>
                    <TableCell className="text-center">{exam._count.examQuestions}</TableCell>
                    <TableCell className="text-center">{exam._count.examSessions}</TableCell>
                    <TableCell className="text-center">{exam._count.examResults}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(exam.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
                {teacher.exams.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                      No exams created yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
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

function StatBox({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.FC<{ className?: string }>;
}) {
  return (
    <div className="rounded-lg border p-3 text-center">
      <Icon className="mx-auto mb-1 h-4 w-4 text-muted-foreground" />
      <p className="text-lg font-bold">{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}
