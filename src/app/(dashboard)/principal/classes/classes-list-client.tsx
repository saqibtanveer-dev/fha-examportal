'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Users, BookOpen, ClipboardList, TrendingUp } from 'lucide-react';

type ClassOverview = {
  id: string;
  name: string;
  grade: number;
  isActive: boolean;
  totalStudents: number;
  totalSections: number;
  sectionNames: string[];
  totalExams: number;
  avgPercentage: number;
  passRate: number;
};

type Props = { classes: ClassOverview[] };

export function ClassesListClient({ classes }: Props) {
  const chartData = classes.map((c) => ({
    name: c.name,
    avgScore: c.avgPercentage,
    passRate: c.passRate,
    students: c.totalStudents,
  }));

  return (
    <div className="space-y-6">
      {/* Overview Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Class-wise Performance Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 sm:h-72">
            {classes.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" fontSize={11} />
                  <YAxis domain={[0, 100]} fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid hsl(var(--border))',
                      backgroundColor: 'hsl(var(--card))',
                    }}
                  />
                  <Bar
                    dataKey="avgScore"
                    fill="hsl(var(--chart-1))"
                    radius={[4, 4, 0, 0]}
                    name="Avg Score %"
                  />
                  <Bar
                    dataKey="passRate"
                    fill="hsl(var(--chart-2))"
                    radius={[4, 4, 0, 0]}
                    name="Pass Rate %"
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                No class data available
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Class Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {classes.map((cls) => (
          <Link key={cls.id} href={`/principal/classes/${cls.id}`}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{cls.name}</CardTitle>
                  <Badge variant="outline">Grade {cls.grade}</Badge>
                </div>
                <div className="flex flex-wrap gap-1">
                  {cls.sectionNames.map((s) => (
                    <Badge key={s} variant="secondary" className="text-[10px]">
                      {s}
                    </Badge>
                  ))}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="flex items-center justify-center gap-1">
                      <Users className="h-3 w-3 text-muted-foreground" />
                      <span className="text-lg font-bold">{cls.totalStudents}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">Students</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-1">
                      <ClipboardList className="h-3 w-3 text-muted-foreground" />
                      <span className="text-lg font-bold">{cls.totalExams}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">Exams</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-1">
                      <TrendingUp className="h-3 w-3 text-muted-foreground" />
                      <span className="text-lg font-bold">{cls.avgPercentage}%</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">Avg Score</p>
                  </div>
                </div>

                <div>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Pass Rate</span>
                    <span className="font-medium">{cls.passRate}%</span>
                  </div>
                  <Progress value={cls.passRate} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
        {classes.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="py-8 text-center text-muted-foreground">
              No classes found
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
