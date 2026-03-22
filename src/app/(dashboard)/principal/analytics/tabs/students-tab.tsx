'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants';
import type { StudentPerformance } from '../analytics-types';

type Props = {
  topStudents: StudentPerformance[];
  bottomStudents: StudentPerformance[];
};

export function StudentsTab({ topStudents, bottomStudents }: Props) {
  return (
    <div className="space-y-6">
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
                <Bar dataKey="avgPercentage" name="Avg %" radius={[4, 4, 0, 0]}>
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
    </div>
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
                <p className={`text-lg font-bold ${variant === 'top' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {s.avgPercentage}%
                </p>
                <p className="text-muted-foreground text-[10px]">Pass: {s.passRate}%</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
      {/* Desktop */}
      <div className="hidden overflow-x-auto md:block">
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
                  <span className={s.avgPercentage >= 50 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>{s.avgPercentage}%</span>
                </TableCell>
                <TableCell className="text-right">
                  <span className={s.passRate >= 50 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>{s.passRate}%</span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
