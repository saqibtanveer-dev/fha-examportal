'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ArrowLeft, Users, ClipboardList, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import type { ClassDetailData } from './class-detail.types';
import { ClassStudentsTable } from './class-students-table';
import { ClassExamsTable } from './class-exams-table';

type Props = { classData: ClassDetailData };

export function ClassDetailClient({ classData }: Props) {
  const stats = classData.classStats;

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
      <ClassStudentsTable students={classData.studentsWithPerformance} />

      {/* Assigned Exams */}
      <ClassExamsTable exams={classData.assignedExams} />
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
