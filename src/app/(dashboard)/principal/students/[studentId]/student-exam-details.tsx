'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';

type ResultRow = {
  id: string;
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  grade: string | null;
  isPassed: boolean;
  rank: number | null;
  createdAt: string;
  exam: {
    id: string;
    title: string;
    type: string;
    subject: { name: string; code: string };
    createdBy: { firstName: string; lastName: string };
  };
};

type SessionRow = {
  id: string;
  status: string;
  tabSwitchCount: number;
  isFlagged: boolean;
  exam: { title: string; duration: number };
};

type SubjectPerf = {
  subject: string;
  exams: number;
  avgPercentage: number;
  passRate: number;
};

type Props = {
  results: ResultRow[];
  sessions: SessionRow[];
  subjectPerformance: SubjectPerf[];
};

export function StudentExamDetails({ results, sessions, subjectPerformance }: Props) {
  return (
    <>
      {/* Subject Performance Cards */}
      {subjectPerformance.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Subject-wise Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {subjectPerformance.map((sp) => (
                <div key={sp.subject} className="rounded-lg border p-3">
                  <p className="font-medium text-sm">{sp.subject}</p>
                  <div className="mt-2 flex gap-4 text-xs">
                    <span>Exams: <b>{sp.exams}</b></span>
                    <span>Avg: <b className={sp.avgPercentage >= 60 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>{sp.avgPercentage}%</b></span>
                    <span>Pass: <b>{sp.passRate}%</b></span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Exam Results ({results.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {/* Mobile view */}
          <div className="space-y-3 p-4 md:hidden">
            {results.map((result) => (
              <div key={result.id} className="rounded-lg border p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{result.exam.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {result.exam.subject.code} &bull; {result.exam.type}
                    </p>
                  </div>
                  {result.isPassed ? (
                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">Passed</Badge>
                  ) : (
                    <Badge variant="destructive">Failed</Badge>
                  )}
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2 text-center text-xs">
                  <div>
                    <p className="font-semibold">{result.obtainedMarks}/{result.totalMarks}</p>
                    <p className="text-muted-foreground">Marks</p>
                  </div>
                  <div>
                    <p className="font-semibold">{result.percentage}%</p>
                    <p className="text-muted-foreground">Score</p>
                  </div>
                  <div>
                    <p className="font-semibold">{result.grade ?? '—'}</p>
                    <p className="text-muted-foreground">Grade</p>
                  </div>
                </div>
              </div>
            ))}
            {results.length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">No results yet</p>
            )}
          </div>

          {/* Desktop table */}
          <div className="hidden overflow-x-auto md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Exam</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-center">Marks</TableHead>
                  <TableHead className="text-center">Score</TableHead>
                  <TableHead className="text-center">Grade</TableHead>
                  <TableHead className="text-center">Rank</TableHead>
                  <TableHead>Result</TableHead>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((result) => (
                  <TableRow key={result.id}>
                    <TableCell>
                      <Link
                        href={`/principal/exams/${result.exam.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {result.exam.title}
                      </Link>
                    </TableCell>
                    <TableCell>{result.exam.subject.code}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{result.exam.type}</Badge>
                    </TableCell>
                    <TableCell className="text-center">{result.obtainedMarks}/{result.totalMarks}</TableCell>
                    <TableCell className="text-center font-semibold">{result.percentage}%</TableCell>
                    <TableCell className="text-center">{result.grade ?? '—'}</TableCell>
                    <TableCell className="text-center">{result.rank ?? '—'}</TableCell>
                    <TableCell>
                      {result.isPassed ? (
                        <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">Pass</Badge>
                      ) : (
                        <Badge variant="destructive">Fail</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {result.exam.createdBy.firstName} {result.exam.createdBy.lastName}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(result.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
                {results.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} className="py-8 text-center text-muted-foreground">
                      No results yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Flagged Sessions */}
      {sessions.some((s) => s.isFlagged) && (
        <Card className="border-amber-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-amber-700">
              <AlertTriangle className="h-4 w-4" />
              Flagged Exam Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {sessions
                .filter((s) => s.isFlagged)
                .map((session) => (
                  <div key={session.id} className="flex items-center justify-between rounded-md border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950">
                    <div>
                      <p className="text-sm font-medium">{session.exam.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Tab switches: {session.tabSwitchCount}
                      </p>
                    </div>
                    <Badge variant="outline" className="border-amber-500 text-amber-700">
                      Flagged
                    </Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
