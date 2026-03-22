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
import { Users } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants';
import type { TeacherAnalytics } from '../analytics-types';

type Props = { teacherAnalytics: TeacherAnalytics[] };

export function TeachersTab({ teacherAnalytics }: Props) {
  return (
    <div className="space-y-6">
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
                <YAxis type="category" dataKey="teacherName" tick={{ fontSize: 11 }} width={100} />
                <Tooltip formatter={(v: any) => `${Math.round(Number(v) * 10) / 10}%`} />
                <Legend />
                <Bar dataKey="avgPercentage" name="Avg %" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={16} />
                <Bar dataKey="passRate" name="Pass Rate %" fill="#10b981" radius={[0, 4, 4, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

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
                      <div className="h-full rounded-full bg-green-500" style={{ width: `${Math.min(t.passRate, 100)}%` }} />
                    </div>
                    <span className="text-xs font-medium">{t.passRate}%</span>
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
                      <span className={t.avgPercentage >= 50 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>{t.avgPercentage}%</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={t.passRate >= 50 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>{t.passRate}%</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
