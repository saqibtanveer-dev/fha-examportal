'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { PageHeader, EmptyState } from '@/components/shared';
import { SubjectTable, CreateSubjectDialog } from '@/modules/subjects/components';

type Subject = {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
  department: { id: string; name: string };
  _count: { questions: number; exams: number };
};

type Props = {
  subjects: Subject[];
  departments: { id: string; name: string }[];
};

export function SubjectsPageClient({ subjects, departments }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Subjects"
        description="Manage academic subjects"
        breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Subjects' }]}
        actions={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />Add Subject
          </Button>
        }
      />
      {subjects.length === 0 ? (
        <EmptyState
          title="No subjects"
          description="Create a department first, then add subjects."
          action={<Button onClick={() => setDialogOpen(true)}><Plus className="mr-2 h-4 w-4" />Add Subject</Button>}
        />
      ) : (
        <SubjectTable subjects={subjects} />
      )}
      <CreateSubjectDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        departments={departments}
      />
    </div>
  );
}
