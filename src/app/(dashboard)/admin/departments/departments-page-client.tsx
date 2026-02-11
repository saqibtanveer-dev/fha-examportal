'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { PageHeader, EmptyState } from '@/components/shared';
import { DepartmentTable, CreateDepartmentDialog } from '@/modules/departments/components';

type Department = {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  _count: { subjects: number };
};

type Props = { departments: Department[] };

export function DepartmentsPageClient({ departments }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Departments"
        description="Manage academic departments"
        breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Departments' }]}
        actions={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />Add Department
          </Button>
        }
      />
      {departments.length === 0 ? (
        <EmptyState
          title="No departments"
          description="Create your first department to organize subjects."
          action={<Button onClick={() => setDialogOpen(true)}><Plus className="mr-2 h-4 w-4" />Add Department</Button>}
        />
      ) : (
        <DepartmentTable departments={departments} />
      )}
      <CreateDepartmentDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
