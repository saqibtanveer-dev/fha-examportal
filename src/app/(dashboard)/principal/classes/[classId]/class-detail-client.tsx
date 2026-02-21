'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared';
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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ArrowLeft, Users, ClipboardList, TrendingUp, Eye } from 'lucide-react';
import Link from 'next/link';

type ClassDetailData = {
  id: string;
  name: string;
  grade: number;
  isActive: boolean;
  sections: {
    id: string;
    name: string;
    students: {
      userId: string;
      rollNumber: string;
      status: string;
      user: { firstName: string; lastName: string; email: string; isActive: boolean };
    }[];
  }[];
  subjectClassLinks: {
    subject: { id: string; name: string; code: string };
  }[];
  teacherSubjects: {
    teacher: { user: { id: string; firstName: string; lastName: string } };
    subject: { name: string; code: string };
  }[];
  assignedExams: {
    id: string;
    title: string;
    type: string;
    status: string;
    totalMarks: number;
    scheduledStartAt: string | null;
    subject: { name: string; code: string };
    createdBy: { firstName: string; lastName: string };
    resultsCount: number;
    avgPercentage: number;
    passRate: number;
  }[];
  classStats: {
    totalStudents: number;
    totalResults: number;
    passedCount: number;
    failedCount: number;
    avgPercentage: number;
    passRate: number;
  };
  subjectPerformance: {
    subject: string;
    avgPercentage: number;
    passRate: number;
    totalResults: number;
  }[];
  studentsWithPerformance: {
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    rollNumber: string;
    section: string;
    status: string;
    isActive: boolean;
    examsTaken: number;
    avgPercentage: number;
    passRate: number;
  }[];
};

type Props = { classData: ClassDetailData };

export function ClassDetailClient({ classData }: Props) {
  const stats = classData.classStats;

  const sortedStudents = [...classData.studentsWithPerformance].sort(
    (a, b) => b.avgPercentage - a.avgPercentage,
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/principal/classes">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <PageHeader
          title={classData.name}
          description={`Grade ${classData.grade} — ${classData.sections.length} section(s)`}
        />
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={Users} label="Students" value={String(stats.totalStudents)} />
        <StatCard icon={ClipboardList} label="Results" value={String(stats.totalResults)} />
        <StatCard icon={TrendingUp} label="Avg Score" value={`${stats.avgPercentage}%`} />
        <StatCard icon={TrendingUp} label="Pass Rate" value={`${stats.passRate}%`} />
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Subject Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Subject Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {classData.subjectPerformance.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={classData.subjectPerformance} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" domain={[0, 100]} fontSize={11} />
                    <YAxis type="category" dataKey="subject" fontSize={11} width={80} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '8px',
                        border: '1px solid hsl(var(--border))',
                        backgroundColor: 'hsl(var(--card))',
                      }}
                    />
                    <Bar
                      dataKey="avgPercentage"
                      fill="hsl(var(--chart-1))"
                      radius={[0, 4, 4, 0]}
                      name="Avg %"
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  No subject data
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pass/Fail Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Pass/Fail Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6 py-4">
              <div>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-green-600">Passed: {stats.passedCount}</span>
                  <span className="text-red-600">Failed: {stats.failedCount}</span>
                </div>
                <div className="flex h-4 overflow-hidden rounded-full bg-muted">
                  {stats.totalResults > 0 && (
                    <>
                      <div
                        className="bg-green-500 transition-all"
                        style={{
                          width: `${(stats.passedCount / stats.totalResults) * 100}%`,
                        }}
                      />
                      <div
                        className="bg-red-500 transition-all"
                        style={{
                          width: `${(stats.failedCount / stats.totalResults) * 100}%`,
                        }}
                      />
                    </>
                  )}
                </div>
              </div>

              {/* Section Summary */}
              <div>
                <p className="mb-2 text-sm font-medium">Sections</p>
                <div className="flex flex-wrap gap-2">
                  {classData.sections.map((s) => (
                    <Badge key={s.id} variant="outline" className="px-3 py-1">
                      {s.name}: {s.students.length} students
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Subjects */}
              <div>
                <p className="mb-2 text-sm font-medium">Subjects</p>
                <div className="flex flex-wrap gap-2">
                  {classData.subjectClassLinks.map((sl) => (
                    <Badge key={sl.subject.id} variant="secondary">
                      {sl.subject.name} ({sl.subject.code})
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Teachers */}
              {classData.teacherSubjects.length > 0 && (
                <div>
                  <p className="mb-2 text-sm font-medium">Teachers</p>
                  <div className="space-y-1">
                    {classData.teacherSubjects.map((ts, i) => (
                      <Link
                        key={i}
                        href={`/principal/teachers/${ts.teacher.user.id}`}
                        className="block text-sm text-primary hover:underline"
                      >
                        {ts.teacher.user.firstName} {ts.teacher.user.lastName} — {ts.subject.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Students ({sortedStudents.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {/* Mobile */}
          <div className="space-y-3 p-4 md:hidden">
            {sortedStudents.map((student, idx) => (
              <Link key={student.userId} href={`/principal/students/${student.userId}`}>
                <div className="rounded-lg border p-3 transition-colors hover:bg-accent">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">#{idx + 1}</span>
                        <p className="truncate font-medium text-sm">
                          {student.firstName} {student.lastName}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Roll: {student.rollNumber} &bull; {student.section}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold">{student.avgPercentage}%</p>
                      <p className="text-[10px] text-muted-foreground">{student.examsTaken} exams</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
            {sortedStudents.length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">No students</p>
            )}
          </div>

          {/* Desktop */}
          <div className="hidden overflow-x-auto md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Roll No.</TableHead>
                  <TableHead>Section</TableHead>
                  <TableHead className="text-center">Exams</TableHead>
                  <TableHead className="text-center">Avg Score</TableHead>
                  <TableHead className="text-center">Pass Rate</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">View</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedStudents.map((student, idx) => (
                  <TableRow key={student.userId}>
                    <TableCell className="text-muted-foreground">{idx + 1}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {student.firstName} {student.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">{student.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{student.rollNumber}</TableCell>
                    <TableCell>{student.section}</TableCell>
                    <TableCell className="text-center">{student.examsTaken}</TableCell>
                    <TableCell className="text-center font-semibold">
                      {student.avgPercentage}%
                    </TableCell>
                    <TableCell className="text-center">{student.passRate}%</TableCell>
                    <TableCell>
                      <Badge variant={student.status === 'ACTIVE' ? 'default' : 'secondary'}>
                        {student.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/principal/students/${student.userId}`}>
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Assigned Exams */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Assigned Exams ({classData.assignedExams.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-3 p-4 md:hidden">
            {classData.assignedExams.map((exam) => (
              <Link key={exam.id} href={`/principal/exams/${exam.id}`}>
                <div className="rounded-lg border p-3 transition-colors hover:bg-accent">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{exam.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {exam.subject.code} &bull; by {exam.createdBy.firstName}
                      </p>
                    </div>
                    <Badge variant="outline" className="shrink-0 text-[10px]">{exam.status}</Badge>
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-2 text-center text-xs">
                    <div>
                      <p className="font-semibold">{exam.resultsCount}</p>
                      <p className="text-muted-foreground">Results</p>
                    </div>
                    <div>
                      <p className="font-semibold">{exam.avgPercentage}%</p>
                      <p className="text-muted-foreground">Avg</p>
                    </div>
                    <div>
                      <p className="font-semibold">{exam.passRate}%</p>
                      <p className="text-muted-foreground">Pass</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="hidden overflow-x-auto md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Exam</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Teacher</TableHead>
                  <TableHead className="text-center">Results</TableHead>
                  <TableHead className="text-center">Avg %</TableHead>
                  <TableHead className="text-center">Pass Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classData.assignedExams.map((exam) => (
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
                    <TableCell><Badge variant="outline">{exam.type}</Badge></TableCell>
                    <TableCell><Badge variant="outline">{exam.status}</Badge></TableCell>
                    <TableCell>{exam.createdBy.firstName} {exam.createdBy.lastName}</TableCell>
                    <TableCell className="text-center">{exam.resultsCount}</TableCell>
                    <TableCell className="text-center font-semibold">{exam.avgPercentage}%</TableCell>
                    <TableCell className="text-center">{exam.passRate}%</TableCell>
                  </TableRow>
                ))}
                {classData.assignedExams.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                      No exams assigned
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

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.FC<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 py-4">
        <Icon className="h-5 w-5 text-muted-foreground shrink-0" />
        <div>
          <p className="text-xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
