'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useReferenceStore } from '@/stores';
import { PageHeader, EmptyState, SkeletonPage } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useDatesheetList } from '@/modules/datesheet/hooks/use-datesheet';
import { useDatesheetMutations } from '@/modules/datesheet/hooks/use-datesheet-mutations';
import { DatesheetList, DatesheetForm } from '@/modules/datesheet/components';
import { ROUTES } from '@/lib/constants';
import type { ExamType } from '@prisma/client';

export function DatesheetListClient() {
  const router = useRouter();
  const { academicSessions } = useReferenceStore();
  const currentSession = academicSessions.find((s) => s.isCurrent);
  const [createOpen, setCreateOpen] = useState(false);

  const { data: datesheets, isLoading } = useDatesheetList(currentSession?.id ?? '');
  const { createDatesheet, publishDatesheet, archiveDatesheet, deleteDatesheet } = useDatesheetMutations();

  if (!currentSession) {
    return (
      <EmptyState
        title="No Active Academic Session"
        description="Please set an active academic session before managing datesheets."
      />
    );
  }

  if (isLoading) return <SkeletonPage />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Exam Datesheets"
        description="Create and manage exam datesheets for the current session."
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Datesheets' },
        ]}
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> New Datesheet
          </Button>
        }
      />

      {datesheets && datesheets.length > 0 ? (
        <DatesheetList
          datesheets={datesheets}
          onPublish={(id) => publishDatesheet.mutate(id)}
          onArchive={(id) => archiveDatesheet.mutate(id)}
          onDelete={(id) => deleteDatesheet.mutate(id)}
          isPending={publishDatesheet.isPending || archiveDatesheet.isPending || deleteDatesheet.isPending}
        />
      ) : (
        <EmptyState
          title="No Datesheets"
          description="Create your first exam datesheet to get started."
        />
      )}

      <DatesheetForm
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        academicSessions={academicSessions}
        currentSessionId={currentSession.id}
        onSubmit={(data) => {
          createDatesheet.mutate(
            { ...data, examType: data.examType as ExamType },
            {
              onSuccess: (result) => {
                if (result.success) {
                  setCreateOpen(false);
                  if (result.data?.id) router.push(`${ROUTES.ADMIN.DATESHEET}/${result.data.id}`);
                }
              },
            },
          );
        }}
        isPending={createDatesheet.isPending}
      />
    </div>
  );
}
