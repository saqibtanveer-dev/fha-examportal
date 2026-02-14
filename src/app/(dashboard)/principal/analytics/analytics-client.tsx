'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Users,
  GraduationCap,
  BookOpen,
  TrendingUp,
  TrendingDown,
  Award,
  AlertTriangle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants';

type TeacherAnalytics = {
  teacherId: string;
  teacherName: string;
  examsCreated: number;
  questionsCreated: number;
  totalResults: number;
  avgPercentage: number;
  passRate: number;
};

type ClassAnalytics = {
  classId: string;
  className: string;
  grade: number;
  totalStudents: number;
  totalResults: number;
  avgPercentage: number;
  passRate: number;
};

type SubjectAnalytics = {
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  department: string;
  totalExams: number;
  totalResults: number;
  avgPercentage: number;
  passRate: number;
};

type PerformanceTrend = {
  month: string;
  avgPercentage: number;
  passRate: number;
  totalExams: number;
};

type GradeDistItem = {
  grade: string;
  count: number;
};

type StudentPerformance = {
  studentId: string;
  studentName: string;
  rollNumber: string;
  className: string;
  section: string;
  examsTaken: number;
  avgPercentage: number;
  passRate: number;
};

type Props = {
  teacherAnalytics: TeacherAnalytics[];
  classAnalytics: ClassAnalytics[];
  subjectAnalytics: SubjectAnalytics[];
  performanceTrends: PerformanceTrend[];
  gradeDistribution: GradeDistItem[];
  topStudents: StudentPerformance[];
  bottomStudents: StudentPerformance[];
};

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#f97316'];

export function AnalyticsClient({
  teacherAnalytics,
  classAnalytics,
  subjectAnalytics,
  performanceTrends,
  gradeDistribution,
  topStudents,
  bottomStudents,
}: Props) {
  const [activeTab, setActiveTab] = useState('overview');

  const formatMonth = (m: string) => {
    const [year, month] = m.split('-');
    const date = new Date(Number(year), Number(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="teachers">Teachers</TabsTrigger>
        <TabsTrigger value="classes">Classes</TabsTrigger>
        <TabsTrigger value="subjects">Subjects</TabsTrigger>
        <TabsTrigger value="students" className="col-span-2 sm:col-span-1">Students</TabsTrigger>
      </TabsList>

      {/* ── OVERVIEW TAB ───────────────────────────────────────── */}
      <TabsContent value="overview" className="space-y-6">
        {/* Performance Trends */}
        {performanceTrends.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Performance Trends
              </CardTitle>
              <CardDescription>Monthly average percentage and pass rate across all exams</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={performanceTrends.map((t) => ({ ...t, monthLabel: formatMonth(t.month) }))}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="monthLabel" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value: any) => `${Math.round(Number(value) * 10) / 10}%`}
                    labelFormatter={(label) => `Month: ${label}`}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="avgPercentage"
                    name="Avg %"
                    stroke="#3b82f6"
                    fill="#3b82f680"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="passRate"
                    name="Pass Rate %"
                    stroke="#10b981"
                    fill="#10b98140"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Grade Distribution + Quick Stats */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {gradeDistribution.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Grade Distribution</CardTitle>
                <CardDescription>Overall grade breakdown across all results</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={gradeDistribution}
                      dataKey="count"
                      nameKey="grade"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={((entry: any) => `${entry.grade}: ${entry.count}`) as any}
                    >
                      {gradeDistribution.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-3">
            <SummaryCard
              icon={Users}
              label="Active Teachers"
              value={teacherAnalytics.length}
              subtext={`${teacherAnalytics.reduce((s, t) => s + t.examsCreated, 0)} exams created`}
            />
            <SummaryCard
              icon={GraduationCap}
              label="Classes"
              value={classAnalytics.length}
              subtext={`${classAnalytics.reduce((s, c) => s + c.totalStudents, 0)} students`}
            />
            <SummaryCard
              icon={BookOpen}
              label="Subjects"
              value={subjectAnalytics.length}
              subtext={`${subjectAnalytics.reduce((s, sub) => s + sub.totalExams, 0)} exams`}
            />
            <SummaryCard
              icon={Award}
              label="Top Avg"
              value={
                topStudents.length > 0
                  ? `${topStudents[0]!.avgPercentage}%`
                  : '—'
              }
              subtext={topStudents.length > 0 ? topStudents[0]!.studentName : 'No data'}
            />
           </div>
        </div>

        {/* Subject Radar Chart */}
        {subjectAnalytics.length >= 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Subject Performance Radar</CardTitle>
              <CardDescription>Average percentage and pass rate by subject</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <RadarChart data={subjectAnalytics.filter((s) => s.totalResults > 0).slice(0, 8)}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subjectName" tick={{ fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <Radar
                    name="Avg %"
                    dataKey="avgPercentage"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.3}
                  />
                  <Radar
                    name="Pass Rate %"
                    dataKey="passRate"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.2}
                  />
                  <Legend />
                  <Tooltip formatter={(v: any) => `${Math.round(Number(v) * 10) / 10}%`} />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      {/* ── TEACHERS TAB ──────────────────────────────────────── */}
      <TabsContent value="teachers" className="space-y-6">
        {/* Teacher Performance Chart */}
        {teacherAnalytics.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Teacher-wise Performance
              </CardTitle>
              <CardDescription>Average student percentage and pass rate per teacher&apos;s exams</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={Math.max(300, teacherAnalytics.length * 40)}>
                <BarChart data={teacherAnalytics} layout="vertical" margin={{ left: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} />
                  <YAxis
                    type="category"
                    dataKey="teacherName"
                    tick={{ fontSize: 11 }}
                    width={100}
                  />
                  <Tooltip formatter={(v: any) => `${Math.round(Number(v) * 10) / 10}%`} />
                  <Legend />
                  <Bar dataKey="avgPercentage" name="Avg %" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={16} />
                  <Bar dataKey="passRate" name="Pass Rate %" fill="#10b981" radius={[0, 4, 4, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Teacher Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Teacher Details</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Mobile */}
            <div className="space-y-3 md:hidden">
              {teacherAnalytics.map((t) => (
                <Link key={t.teacherId} href={`${ROUTES.PRINCIPAL.TEACHERS}/${t.teacherId}`}>
                  <div className="rounded-lg border p-3 transition-shadow hover:shadow-md">
                    <p className="font-semibold">{t.teacherName}</p>
                    <div className="text-muted-foreground mt-1 grid grid-cols-2 gap-1 text-xs">
                      <span>Exams: {t.examsCreated}</span>
                      <span>Questions: {t.questionsCreated}</span>
                      <span>Results: {t.totalResults}</span>
                      <span>Avg: {t.avgPercentage}%</span>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs">Pass Rate:</span>
                      <div className="bg-muted h-1.5 flex-1 overflow-hidden rounded-full">
                        <div
                          className="h-full rounded-full bg-green-500"
                          style={{ width: `${Math.min(t.passRate, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium">{t.passRate}%</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            {/* Desktop */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Teacher</TableHead>
                    <TableHead className="text-center">Exams</TableHead>
                    <TableHead className="text-center">Questions</TableHead>
                    <TableHead className="text-center">Results</TableHead>
                    <TableHead className="text-right">Avg %</TableHead>
                    <TableHead className="text-right">Pass Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teacherAnalytics.map((t) => (
                    <TableRow key={t.teacherId} className="cursor-pointer hover:bg-muted/50">
                      <TableCell>
                        <Link href={`${ROUTES.PRINCIPAL.TEACHERS}/${t.teacherId}`} className="font-medium hover:underline">
                          {t.teacherName}
                        </Link>
                      </TableCell>
                      <TableCell className="text-center">{t.examsCreated}</TableCell>
                      <TableCell className="text-center">{t.questionsCreated}</TableCell>
                      <TableCell className="text-center">{t.totalResults}</TableCell>
                      <TableCell className="text-right">
                        <span className={t.avgPercentage >= 50 ? 'text-green-600' : 'text-red-600'}>
                          {t.avgPercentage}%
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={t.passRate >= 50 ? 'text-green-600' : 'text-red-600'}>
                          {t.passRate}%
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* ── CLASSES TAB ───────────────────────────────────────── */}
      <TabsContent value="classes" className="space-y-6">
        {classAnalytics.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Class-wise Performance
              </CardTitle>
              <CardDescription>Comparison of average scores and pass rates across classes</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={classAnalytics}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="className" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v: any) => `${Math.round(Number(v) * 10) / 10}%`} />
                  <Legend />
                  <Bar dataKey="avgPercentage" name="Avg %" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="passRate" name="Pass Rate %" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Class Details</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Mobile */}
            <div className="space-y-3 md:hidden">
              {classAnalytics.map((c) => (
                <Link key={c.classId} href={`${ROUTES.PRINCIPAL.CLASSES}/${c.classId}`}>
                  <div className="rounded-lg border p-3 transition-shadow hover:shadow-md">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">{c.className}</p>
                      <Badge variant="outline">Grade {c.grade}</Badge>
                    </div>
                    <div className="text-muted-foreground mt-1 grid grid-cols-2 gap-1 text-xs">
                      <span>Students: {c.totalStudents}</span>
                      <span>Results: {c.totalResults}</span>
                      <span>Avg: {c.avgPercentage}%</span>
                      <span>Pass: {c.passRate}%</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            {/* Desktop */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Class</TableHead>
                    <TableHead className="text-center">Grade</TableHead>
                    <TableHead className="text-center">Students</TableHead>
                    <TableHead className="text-center">Results</TableHead>
                    <TableHead className="text-right">Avg %</TableHead>
                    <TableHead className="text-right">Pass Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {classAnalytics.map((c) => (
                    <TableRow key={c.classId} className="cursor-pointer hover:bg-muted/50">
                      <TableCell>
                        <Link href={`${ROUTES.PRINCIPAL.CLASSES}/${c.classId}`} className="font-medium hover:underline">
                          {c.className}
                        </Link>
                      </TableCell>
                      <TableCell className="text-center">{c.grade}</TableCell>
                      <TableCell className="text-center">{c.totalStudents}</TableCell>
                      <TableCell className="text-center">{c.totalResults}</TableCell>
                      <TableCell className="text-right">
                        <span className={c.avgPercentage >= 50 ? 'text-green-600' : 'text-red-600'}>
                          {c.avgPercentage}%
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={c.passRate >= 50 ? 'text-green-600' : 'text-red-600'}>
                          {c.passRate}%
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* ── SUBJECTS TAB ──────────────────────────────────────── */}
      <TabsContent value="subjects" className="space-y-6">
        {subjectAnalytics.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Subject-wise Performance
              </CardTitle>
              <CardDescription>Average scores and pass rates per subject</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={Math.max(300, subjectAnalytics.length * 40)}>
                <BarChart data={subjectAnalytics} layout="vertical" margin={{ left: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} />
                  <YAxis
                    type="category"
                    dataKey="subjectName"
                    tick={{ fontSize: 11 }}
                    width={100}
                  />
                  <Tooltip formatter={(v: any) => `${Math.round(Number(v) * 10) / 10}%`} />
                  <Legend />
                  <Bar dataKey="avgPercentage" name="Avg %" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={16} />
                  <Bar dataKey="passRate" name="Pass Rate %" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Subject Details</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Mobile */}
            <div className="space-y-3 md:hidden">
              {subjectAnalytics.map((s) => (
                <div key={s.subjectId} className="rounded-lg border p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{s.subjectName}</p>
                      <p className="text-muted-foreground text-xs">{s.subjectCode} · {s.department}</p>
                    </div>
                  </div>
                  <div className="text-muted-foreground mt-1 grid grid-cols-2 gap-1 text-xs">
                    <span>Exams: {s.totalExams}</span>
                    <span>Results: {s.totalResults}</span>
                    <span>Avg: {s.avgPercentage}%</span>
                    <span>Pass: {s.passRate}%</span>
                  </div>
                </div>
              ))}
            </div>
            {/* Desktop */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead className="text-center">Exams</TableHead>
                    <TableHead className="text-center">Results</TableHead>
                    <TableHead className="text-right">Avg %</TableHead>
                    <TableHead className="text-right">Pass Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subjectAnalytics.map((s) => (
                    <TableRow key={s.subjectId}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{s.subjectName}</p>
                          <p className="text-muted-foreground text-xs">{s.subjectCode}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">{s.department}</TableCell>
                      <TableCell className="text-center">{s.totalExams}</TableCell>
                      <TableCell className="text-center">{s.totalResults}</TableCell>
                      <TableCell className="text-right">
                        <span className={s.avgPercentage >= 50 ? 'text-green-600' : 'text-red-600'}>
                          {s.avgPercentage}%
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={s.passRate >= 50 ? 'text-green-600' : 'text-red-600'}>
                          {s.passRate}%
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* ── STUDENTS TAB ──────────────────────────────────────── */}
      <TabsContent value="students" className="space-y-6">
        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Top Performing Students
            </CardTitle>
            <CardDescription>Students with highest average percentage across all exams</CardDescription>
          </CardHeader>
          <CardContent>
            <StudentTable students={topStudents} variant="top" />
          </CardContent>
        </Card>

        {/* Bottom Performers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-600" />
              Students Needing Attention
            </CardTitle>
            <CardDescription>Students with lowest average percentage — may need intervention</CardDescription>
          </CardHeader>
          <CardContent>
            {bottomStudents.length > 0 ? (
              <>
                <div className="mb-4 flex items-center gap-2 rounded-md border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-800 dark:bg-yellow-900/20">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm text-yellow-700 dark:text-yellow-400">
                    These students may benefit from additional support or remedial measures.
                  </span>
                </div>
                <StudentTable students={bottomStudents} variant="bottom" />
              </>
            ) : (
              <p className="text-muted-foreground py-4 text-center text-sm">No student data available.</p>
            )}
          </CardContent>
        </Card>

        {/* Performance Comparison Chart */}
        {topStudents.length > 0 && bottomStudents.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Top vs Bottom Performance Comparison</CardTitle>
              <CardDescription>Visual comparison of top and bottom performers</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart
                  data={[
                    ...topStudents.slice(0, 5).map((s) => ({
                      name: s.studentName.split(' ').map(n => n[0]).join(''),
                      fullName: s.studentName,
                      avgPercentage: s.avgPercentage,
                      group: 'Top',
                    })),
                    ...bottomStudents.slice(0, 5).map((s) => ({
                      name: s.studentName.split(' ').map(n => n[0]).join(''),
                      fullName: s.studentName,
                      avgPercentage: s.avgPercentage,
                      group: 'Bottom',
                    })),
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(v: any) => `${v}%`}
                    labelFormatter={(_, payload) => {
                      if (payload && payload.length > 0) {
                        const item = payload[0]?.payload;
                        return `${item?.fullName} (${item?.group})`;
                      }
                      return '';
                    }}
                  />
                  <Bar
                    dataKey="avgPercentage"
                    name="Avg %"
                    radius={[4, 4, 0, 0]}
                  >
                    {[
                      ...topStudents.slice(0, 5).map(() => '#10b981'),
                      ...bottomStudents.slice(0, 5).map(() => '#ef4444'),
                    ].map((color, i) => (
                      <Cell key={i} fill={color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </TabsContent>
    </Tabs>
  );
}

// ── Sub-components ──────────────────────────────────────────────

function SummaryCard({
  icon: Icon,
  label,
  value,
  subtext,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  subtext: string;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-5 text-center">
        <Icon className="text-muted-foreground mb-2 h-6 w-6" />
        <p className="text-muted-foreground text-xs">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-muted-foreground mt-1 text-xs">{subtext}</p>
      </CardContent>
    </Card>
  );
}

function StudentTable({
  students,
  variant,
}: {
  students: StudentPerformance[];
  variant: 'top' | 'bottom';
}) {
  return (
    <>
      {/* Mobile */}
      <div className="space-y-2 md:hidden">
        {students.map((s, i) => (
          <Link key={s.studentId} href={`${ROUTES.PRINCIPAL.STUDENTS}/${s.studentId}`}>
            <div className="flex items-center gap-3 rounded-lg border p-3 transition-shadow hover:shadow-md">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${
                  variant === 'top' ? 'bg-green-500' : 'bg-red-500'
                }`}
              >
                {i + 1}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{s.studentName}</p>
                <p className="text-muted-foreground text-xs">
                  {s.className} · {s.section} · {s.examsTaken} exams
                </p>
              </div>
              <div className="text-right">
                <p className={`text-lg font-bold ${variant === 'top' ? 'text-green-600' : 'text-red-600'}`}>
                  {s.avgPercentage}%
                </p>
                <p className="text-muted-foreground text-[10px]">Pass: {s.passRate}%</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
      {/* Desktop */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">Rank</TableHead>
              <TableHead>Student</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Section</TableHead>
              <TableHead className="text-center">Exams</TableHead>
              <TableHead className="text-right">Avg %</TableHead>
              <TableHead className="text-right">Pass Rate</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((s, i) => (
              <TableRow key={s.studentId} className="cursor-pointer hover:bg-muted/50">
                <TableCell>
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white ${
                      variant === 'top' ? 'bg-green-500' : 'bg-red-500'
                    }`}
                  >
                    {i + 1}
                  </div>
                </TableCell>
                <TableCell>
                  <Link href={`${ROUTES.PRINCIPAL.STUDENTS}/${s.studentId}`} className="font-medium hover:underline">
                    {s.studentName}
                  </Link>
                  {s.rollNumber && (
                    <span className="text-muted-foreground ml-1 text-xs">({s.rollNumber})</span>
                  )}
                </TableCell>
                <TableCell>{s.className}</TableCell>
                <TableCell>{s.section}</TableCell>
                <TableCell className="text-center">{s.examsTaken}</TableCell>
                <TableCell className="text-right">
                  <span className={s.avgPercentage >= 50 ? 'text-green-600' : 'text-red-600'}>
                    {s.avgPercentage}%
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <span className={s.passRate >= 50 ? 'text-green-600' : 'text-red-600'}>
                    {s.passRate}%
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
