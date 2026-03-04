'use client';

// ============================================
// Family Diary Page — Client Component
// ============================================

import { PageHeader } from '@/components/shared';
import { EmptyState } from '@/components/shared';
import { SkeletonDashboard } from '@/components/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpenText, Check } from 'lucide-react';
import { useSelectedChild, useChildDiary, useMarkDiaryAsRead } from '@/modules/family/hooks';
import { ChildSelector } from './child-selector';

export function FamilyDiaryClient() {
  const { children, selectedChild, selectedChildId, isLoading: childrenLoading } = useSelectedChild();
  const { data, isLoading } = useChildDiary(selectedChildId ?? '', undefined, undefined, undefined, !!selectedChildId);
  const { execute: markAsRead, isPending: markingRead } = useMarkDiaryAsRead(selectedChildId ?? '');

  if (childrenLoading || isLoading) return <SkeletonDashboard />;

  if (!selectedChild) {
    return <EmptyState icon={<BookOpenText className="h-12 w-12 text-muted-foreground" />} title="No Children" description="No students linked." />;
  }

  const entries = data?.success ? data.data ?? [] : [];

  return (
    <div>
      <PageHeader title="Diary / Homework" description={`${selectedChild.studentName}'s diary entries`} />
      <div className="mb-4">
        <ChildSelector children={children} selectedChildId={selectedChildId} />
      </div>

      {entries.length === 0 ? (
        <EmptyState icon={<BookOpenText className="h-12 w-12 text-muted-foreground" />} title="No Diary Entries" description="No diary entries found." />
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <Card key={entry.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base">{entry.title}</CardTitle>
                    <Badge variant="outline">{entry.subjectName}</Badge>
                    {!entry.isRead && <Badge variant="destructive">Unread</Badge>}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(entry.date).toLocaleDateString()}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm text-muted-foreground">{entry.content}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">By {entry.teacherName}</span>
                  {!entry.isRead && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={markingRead}
                      onClick={() => markAsRead(entry.id)}
                    >
                      <Check className="mr-1 h-3 w-3" /> Mark as Read
                    </Button>
                  )}
                  {entry.isRead && (
                    <Badge variant="secondary" className="gap-1">
                      <Check className="h-3 w-3" /> Read
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
