'use client';

// ============================================
// Family Upcoming Exams Page — Client Component
// ============================================

import { PageHeader } from '@/components/shared';
import { EmptyState } from '@/components/shared';
import { SkeletonDashboard } from '@/components/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ClipboardList } from 'lucide-react';
import { useSelectedChild, useChildUpcomingExams } from '@/modules/family/hooks';
import { ChildSelector } from './child-selector';

export function FamilyExamsClient() {
  const { children, selectedChild, selectedChildId, isLoading: childrenLoading } = useSelectedChild();
  const { data: upcomingData, isLoading, error } = useChildUpcomingExams(selectedChildId ?? '', !!selectedChildId);

  if (childrenLoading || isLoading) return <SkeletonDashboard />;

  if (!selectedChild) {
    return <EmptyState icon={<ClipboardList className="h-12 w-12 text-muted-foreground" />} title="No Children" description="No students linked to your account." />;
  }

  if (error) {
    return <EmptyState icon={<ClipboardList className="h-12 w-12 text-muted-foreground" />} title="Error" description="Failed to load upcoming exams. Please try again." />;
  }

  const upcoming = upcomingData?.success ? upcomingData.data ?? [] : [];

  return (
    <div>
      <PageHeader title="Upcoming Exams" description={`${selectedChild.studentName}'s upcoming exam schedule`} />
      <div className="mb-4">
        <ChildSelector children={children} selectedChildId={selectedChildId} />
      </div>

      {upcoming.length === 0 ? (
        <EmptyState icon={<ClipboardList className="h-12 w-12 text-muted-foreground" />} title="No Upcoming Exams" description="No exams are currently scheduled." />
      ) : (
        <div className="space-y-3">
          {upcoming.map((exam) => (
            <Card key={exam.examId}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{exam.title}</CardTitle>
                  <Badge variant="outline">{exam.type}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm">
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Subject: <span className="font-medium text-foreground">{exam.subject}</span></p>
                    <p className="text-muted-foreground">Total Marks: <span className="font-medium text-foreground">{exam.totalMarks}</span></p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Scheduled</p>
                    <p className="font-medium">
                      {exam.scheduledAt ? new Date(exam.scheduledAt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : 'TBD'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
