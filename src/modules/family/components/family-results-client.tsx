'use client';

// ============================================
// Family Results Page — Client Component
// ============================================

import { PageHeader } from '@/components/shared';
import { EmptyState } from '@/components/shared';
import { SkeletonDashboard } from '@/components/shared';
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
import { BarChart3, ClipboardList } from 'lucide-react';
import { useSelectedChild, useChildExamResults, useChildUpcomingExams } from '@/modules/family/hooks';
import { ChildSelector } from './child-selector';

export function FamilyResultsClient() {
  const { children, selectedChild, selectedChildId, isLoading: childrenLoading } = useSelectedChild();
  const { data: resultsData, isLoading: resultsLoading } = useChildExamResults(selectedChildId ?? '', !!selectedChildId);
  const { data: upcomingData, isLoading: upcomingLoading } = useChildUpcomingExams(selectedChildId ?? '', !!selectedChildId);

  if (childrenLoading || resultsLoading || upcomingLoading) return <SkeletonDashboard />;

  if (!selectedChild) {
    return <EmptyState icon={<BarChart3 className="h-12 w-12 text-muted-foreground" />} title="No Children" description="No students linked to your account." />;
  }

  const results = resultsData?.success ? resultsData.data ?? [] : [];
  const upcoming = upcomingData?.success ? upcomingData.data ?? [] : [];

  return (
    <div>
      <PageHeader title="Exams & Results" description={`${selectedChild.studentName}'s academic performance`} />
      <div className="mb-4">
        <ChildSelector children={children} selectedChildId={selectedChildId} />
      </div>

      <div className="space-y-6">
        {/* Upcoming Exams */}
        {upcoming.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ClipboardList className="h-4 w-4" /> Upcoming Exams
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {upcoming.map((exam) => (
                  <div key={exam.examId} className="flex items-center justify-between rounded-md border p-3">
                    <div>
                      <p className="font-medium">{exam.title}</p>
                      <p className="text-sm text-muted-foreground">{exam.subject}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">{exam.type}</Badge>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {exam.scheduledAt ? new Date(exam.scheduledAt).toLocaleDateString() : 'TBD'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results Table */}
        {results.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChart3 className="h-4 w-4" /> Exam Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Exam</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Marks</TableHead>
                    <TableHead className="text-right">%</TableHead>
                    <TableHead>Grade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((r) => (
                    <TableRow key={r.examId}>
                      <TableCell className="font-medium">{r.examTitle}</TableCell>
                      <TableCell>{r.subjectName}</TableCell>
                      <TableCell><Badge variant="outline">{r.examType}</Badge></TableCell>
                      <TableCell className="text-right">
                        {r.obtainedMarks !== null ? `${r.obtainedMarks}/${r.totalMarks}` : '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        {r.percentage !== null ? `${r.percentage}%` : '—'}
                      </TableCell>
                      <TableCell>
                        <GradeBadge grade={r.grade} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          <EmptyState icon={<BarChart3 className="h-12 w-12 text-muted-foreground" />} title="No Results Yet" description="No exam results available." />
        )}
      </div>
    </div>
  );
}

function GradeBadge({ grade }: { grade: string | null }) {
  if (!grade) return <span className="text-muted-foreground">—</span>;

  const colorMap: Record<string, string> = {
    'A+': 'bg-green-100 text-green-800',
    A: 'bg-green-100 text-green-700',
    'B+': 'bg-blue-100 text-blue-700',
    B: 'bg-blue-100 text-blue-600',
    C: 'bg-yellow-100 text-yellow-700',
    D: 'bg-orange-100 text-orange-700',
    F: 'bg-red-100 text-red-700',
  };

  return (
    <span className={`rounded px-2 py-0.5 text-xs font-semibold ${colorMap[grade] ?? 'bg-gray-100 text-gray-700'}`}>
      {grade}
    </span>
  );
}
