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
import { BookOpen } from 'lucide-react';
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
import type { SubjectAnalytics } from '../analytics-types';

type Props = { subjectAnalytics: SubjectAnalytics[] };

export function SubjectsTab({ subjectAnalytics }: Props) {
  return (
    <div className="space-y-6">
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
                <YAxis type="category" dataKey="subjectName" tick={{ fontSize: 11 }} width={100} />
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
          <div className="hidden overflow-x-auto md:block">
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
                      <span className={s.avgPercentage >= 50 ? 'text-green-600' : 'text-red-600'}>{s.avgPercentage}%</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={s.passRate >= 50 ? 'text-green-600' : 'text-red-600'}>{s.passRate}%</span>
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
