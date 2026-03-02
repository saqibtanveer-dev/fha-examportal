'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { GraduationCap } from 'lucide-react';
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
import type { ClassAnalytics } from '../analytics-types';

type Props = { classAnalytics: ClassAnalytics[] };

export function ClassesTab({ classAnalytics }: Props) {
  return (
    <div className="space-y-6">
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
          <div className="hidden overflow-x-auto md:block">
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
                      <span className={c.avgPercentage >= 50 ? 'text-green-600' : 'text-red-600'}>{c.avgPercentage}%</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={c.passRate >= 50 ? 'text-green-600' : 'text-red-600'}>{c.passRate}%</span>
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
