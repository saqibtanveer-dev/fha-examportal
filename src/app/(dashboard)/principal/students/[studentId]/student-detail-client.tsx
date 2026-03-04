'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/shared';
import {
  ArrowLeft, Mail, Phone, Calendar, User, GraduationCap,
  TrendingDown, CheckCircle, XCircle,
} from 'lucide-react';
import Link from 'next/link';
import type { StudentData } from './student-detail.types';
import { StudentPerformanceCharts } from './student-performance-charts';
import { StudentExamDetails } from './student-exam-details';
import { StudentAttendanceSection } from './student-attendance-section';

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
              value={student.studentProfile.dateOfBirth ? new Date(student.studentProfile.dateOfBirth).toLocaleDateString() : 'Not specified'}
            />
            <InfoRow icon={GraduationCap} label="Registration" value={student.studentProfile.registrationNo} />
            <InfoRow icon={Calendar} label="Enrolled" value={new Date(student.studentProfile.enrollmentDate).toLocaleDateString()} />
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
              <MiniStatusCard icon={CheckCircle} value={perf.passedExams} label="Passed" scheme="green" />
              <MiniStatusCard icon={XCircle} value={perf.failedExams} label="Failed" scheme="red" />
              <MiniStatusCard icon={TrendingDown} value={`${perf.lowestPercentage}%`} label="Lowest" scheme="blue" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs: Academic Performance | Attendance */}
      <Tabs defaultValue="academic" className="space-y-4">
        <TabsList>
          <TabsTrigger value="academic">Academic Performance</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
        </TabsList>

        <TabsContent value="academic" className="space-y-4">
          <StudentPerformanceCharts
            timeline={student.timeline}
            subjectPerformance={student.subjectPerformance}
          />
          <StudentExamDetails
            results={student.results}
            sessions={student.sessions}
            subjectPerformance={student.subjectPerformance}
          />
        </TabsContent>

        <TabsContent value="attendance">
          <StudentAttendanceSection studentProfileId={student.studentProfile.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ---------- helpers ---------- */

function InfoRow({ icon: Icon, label, value }: { icon: React.FC<{ className?: string }>; label: string; value: string }) {
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

const COLOR_SCHEMES = {
  green: { border: 'border-green-200 dark:border-green-900', bg: 'bg-green-50 dark:bg-green-950', icon: 'text-green-600', value: 'text-green-700 dark:text-green-300', label: 'text-green-600 dark:text-green-400' },
  red: { border: 'border-red-200 dark:border-red-900', bg: 'bg-red-50 dark:bg-red-950', icon: 'text-red-600', value: 'text-red-700 dark:text-red-300', label: 'text-red-600 dark:text-red-400' },
  blue: { border: 'border-blue-200 dark:border-blue-900', bg: 'bg-blue-50 dark:bg-blue-950', icon: 'text-blue-600', value: 'text-blue-700 dark:text-blue-300', label: 'text-blue-600 dark:text-blue-400' },
} as const;

function MiniStatusCard({ icon: Icon, value, label, scheme }: { icon: React.FC<{ className?: string }>; value: number | string; label: string; scheme: keyof typeof COLOR_SCHEMES }) {
  const c = COLOR_SCHEMES[scheme];
  return (
    <Card className={`${c.border} ${c.bg}`}>
      <CardContent className="flex items-center gap-2 py-3">
        <Icon className={`h-4 w-4 ${c.icon} shrink-0`} />
        <div>
          <p className={`text-lg font-bold ${c.value}`}>{value}</p>
          <p className={`text-[10px] ${c.label}`}>{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
