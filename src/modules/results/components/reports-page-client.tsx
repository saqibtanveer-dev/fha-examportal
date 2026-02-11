'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { formatPercentage } from '@/utils/format';
import type { DepartmentPerformance, SubjectPerformance } from '@/modules/results/report-queries';
import type { RecentExamSummary, GradeDistribution } from '@/modules/results/report-queries';

/* ─── Types ─── */

type SystemOverview = {
  totalStudents: number;
  totalTeachers: number;
  totalExams: number;
  totalResults: number;
  totalDepartments: number;
  totalSubjects: number;
  overallPassRate: number;
  overallAvgPercentage: number;
};

type Props = {
  overview: SystemOverview;
  departments: DepartmentPerformance[];
  subjects: SubjectPerformance[];
  recentExams: RecentExamSummary[];
  gradeDistribution: GradeDistribution[];
};

/* ─── KPI Card ─── */

function KpiCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}

/* ─── Main Component ─── */

export function ReportsPageClient({
  overview,
  departments,
  subjects,
  recentExams,
  gradeDistribution,
}: Props) {
  return (
    <div className="space-y-8">
      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total Students" value={overview.totalStudents} />
        <KpiCard label="Total Teachers" value={overview.totalTeachers} />
        <KpiCard label="Total Exams" value={overview.totalExams} />
        <KpiCard label="Total Results" value={overview.totalResults} />
        <KpiCard label="Departments" value={overview.totalDepartments} />
        <KpiCard label="Subjects" value={overview.totalSubjects} />
        <KpiCard label="Pass Rate" value={formatPercentage(overview.overallPassRate)} />
        <KpiCard label="Avg Score" value={formatPercentage(overview.overallAvgPercentage)} />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <DepartmentChart departments={departments} />
        <GradeChart distribution={gradeDistribution} />
      </div>

      {/* Tables */}
      <SubjectTable subjects={subjects} />
      <RecentExamsTable exams={recentExams} />
    </div>
  );
}

/* ─── Department Bar Chart ─── */

function DepartmentChart({ departments }: { departments: DepartmentPerformance[] }) {
  const data = departments.map((d) => ({
    name: d.departmentName,
    avg: d.avgPercentage,
    passRate: d.passRate,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Department Performance</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground">No data yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="avg" name="Avg %" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="passRate" name="Pass Rate %" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

/* ─── Grade Distribution Chart ─── */

function GradeChart({ distribution }: { distribution: GradeDistribution[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Grade Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        {distribution.length === 0 ? (
          <p className="text-sm text-muted-foreground">No grades recorded yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={distribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="grade" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" name="Students" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

/* ─── Subject Performance Table ─── */

function SubjectTable({ subjects }: { subjects: SubjectPerformance[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Subject Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Subject</TableHead>
              <TableHead>Code</TableHead>
              <TableHead className="text-center">Results</TableHead>
              <TableHead className="text-center">Avg %</TableHead>
              <TableHead className="text-center">Pass Rate</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subjects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No results yet.
                </TableCell>
              </TableRow>
            ) : (
              subjects.map((s) => (
                <TableRow key={s.subjectId}>
                  <TableCell className="font-medium">{s.subjectName}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{s.subjectCode}</Badge>
                  </TableCell>
                  <TableCell className="text-center">{s.resultCount}</TableCell>
                  <TableCell className="text-center">{formatPercentage(s.avgPercentage)}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={s.passRate >= 50 ? 'default' : 'destructive'}>
                      {formatPercentage(s.passRate)}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

/* ─── Recent Exams Table ─── */

function RecentExamsTable({ exams }: { exams: RecentExamSummary[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Exams</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Exam</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead className="text-center">Students</TableHead>
              <TableHead className="text-center">Avg %</TableHead>
              <TableHead className="text-center">Pass Rate</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {exams.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No published exams yet.
                </TableCell>
              </TableRow>
            ) : (
              exams.map((e) => (
                <TableRow key={e.examId}>
                  <TableCell className="font-medium">{e.examTitle}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{e.subjectCode}</Badge>
                  </TableCell>
                  <TableCell className="text-center">{e.totalStudents}</TableCell>
                  <TableCell className="text-center">{formatPercentage(e.avgPercentage)}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={e.passRate >= 50 ? 'default' : 'destructive'}>
                      {formatPercentage(e.passRate)}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
