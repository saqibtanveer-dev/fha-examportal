'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus, Zap, Shield } from 'lucide-react';
import { PageHeader, EmptyState } from '@/components/shared';
import { SubjectTable, CreateSubjectDialog } from '@/modules/subjects/components';

type SubjectClassLink = {
  id: string;
  classId: string;
  isActive: boolean;
  isElective: boolean;
  electiveGroupName: string | null;
  class: { id: string; name: string; grade: number };
};

type Subject = {
  id: string;
  name: string;
  code: string;
  description: string | null;
  departmentId: string;
  isActive: boolean;
  department: { id: string; name: string };
  _count: { questions: number; exams: number; subjectClassLinks: number };
  subjectClassLinks: SubjectClassLink[];
};

type ClassInfo = { id: string; name: string; grade: number };

type Props = {
  subjects: Subject[];
  departments: { id: string; name: string }[];
  allClasses: ClassInfo[];
};

export function SubjectsView({ subjects, departments, allClasses }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Subjects"
        description="Manage academic subjects and their class assignments"
        breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Subjects' }]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/subjects/elective-enrollment">
                <Zap className="mr-1 h-4 w-4 text-amber-500" />Enrollment
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/subjects/integrity">
                <Shield className="mr-1 h-4 w-4" />Integrity
              </Link>
            </Button>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />Add Subject
            </Button>
          </div>
        }
      />
      {subjects.length === 0 ? (
        <EmptyState
          title="No subjects"
          description="Create a department first, then add subjects."
          action={<Button onClick={() => setDialogOpen(true)}><Plus className="mr-2 h-4 w-4" />Add Subject</Button>}
        />
      ) : (
        <SubjectTable subjects={subjects} departments={departments} allClasses={allClasses} />
      )}
      <CreateSubjectDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        departments={departments}
      />
    </div>
  );
}
