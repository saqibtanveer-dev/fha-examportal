'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { PageHeader, EmptyState } from '@/components/shared';
import { ClassGrid, CreateClassDialog } from '@/modules/classes/components';

type Section = { id: string; name: string; isActive: boolean };
type ClassItem = {
  id: string;
  name: string;
  grade: number;
  isActive: boolean;
  sections: Section[];
  _count: { students: number };
};

type Props = { classes: ClassItem[] };

export function ClassesPageClient({ classes }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mode, setMode] = useState<'class' | 'section'>('class');

  function openDialog(m: 'class' | 'section') {
    setMode(m);
    setDialogOpen(true);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Classes & Sections"
        description="Manage school classes and their sections"
        breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Classes' }]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => openDialog('section')}>
              <Plus className="mr-2 h-4 w-4" />Add Section
            </Button>
            <Button onClick={() => openDialog('class')}>
              <Plus className="mr-2 h-4 w-4" />Add Class
            </Button>
          </div>
        }
      />
      {classes.length === 0 ? (
        <EmptyState
          title="No classes"
          description="Create your first class to get started."
          action={<Button onClick={() => openDialog('class')}><Plus className="mr-2 h-4 w-4" />Add Class</Button>}
        />
      ) : (
        <ClassGrid classes={classes} />
      )}
      <CreateClassDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={mode}
        classes={classes.map((c) => ({ id: c.id, name: c.name }))}
      />
    </div>
  );
}
