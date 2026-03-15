'use client';

import { useState, useTransition } from 'react';
import { useInvalidateCache } from '@/lib/cache-utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pencil, Trash2, Users } from 'lucide-react';
import { deleteClassAction, deleteSectionAction } from '@/modules/classes/class-actions';
import { EditClassDialog } from './edit-class-dialog';
import { ConfirmDialog } from '@/components/shared';
import { toast } from 'sonner';

type Section = {
  id: string;
  name: string;
  isActive: boolean;
};

type ClassItem = {
  id: string;
  name: string;
  grade: number;
  isActive: boolean;
  sections: Section[];
  _count: { students: number };
};

type Props = { classes: ClassItem[] };

export function ClassGrid({ classes }: Props) {
  const [isPending, startTransition] = useTransition();
  const [editingClass, setEditingClass] = useState<ClassItem | null>(null);
  const [deleteClassConfirm, setDeleteClassConfirm] = useState<ClassItem | null>(null);
  const [deleteSectionConfirm, setDeleteSectionConfirm] = useState<{ id: string; name: string; className: string } | null>(null);
  const invalidate = useInvalidateCache();

  function handleDeleteClass(cls: ClassItem) {
    startTransition(async () => {
      const result = await deleteClassAction(cls.id);
      if (result.success) {
        toast.success('Class deleted');
        await invalidate.classes();
      } else {
        toast.error(result.error ?? 'Failed');
      }
      setDeleteClassConfirm(null);
    });
  }

  function handleDeleteSection(sec: { id: string; name: string; className: string }) {
    startTransition(async () => {
      const result = await deleteSectionAction(sec.id);
      if (result.success) {
        toast.success('Section deleted');
        await invalidate.classes();
      } else {
        toast.error(result.error ?? 'Failed');
      }
      setDeleteSectionConfirm(null);
    });
  }

  return (
  <>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {classes.map((cls) => (
        <Card key={cls.id}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">{cls.name}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Grade {cls.grade}</Badge>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setEditingClass(cls)}
                disabled={isPending}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive"
                onClick={() => setDeleteClassConfirm(cls)}
                disabled={isPending}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{cls._count.students} students</span>
            </div>
            <div className="mt-3 space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Sections:</p>
              {cls.sections.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">No sections</p>
              ) : (
                <div className="flex flex-wrap gap-1">
                  {cls.sections.map((sec) => (
                    <Badge key={sec.id} variant="outline" className="gap-1">
                      {sec.name}
                      <button
                        onClick={() => setDeleteSectionConfirm({ id: sec.id, name: sec.name, className: cls.name })}
                        className="ml-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive/80"
                        disabled={isPending}
                        aria-label={`Remove section ${sec.name}`}
                      >
                        &times;
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>

    {editingClass && (
      <EditClassDialog
        open
        onOpenChange={(open) => !open && setEditingClass(null)}
        classItem={editingClass}
      />
    )}

    <ConfirmDialog
      open={!!deleteClassConfirm}
      onOpenChange={(o) => !o && setDeleteClassConfirm(null)}
      title="Delete Class"
      description={deleteClassConfirm ? `Are you sure you want to delete "${deleteClassConfirm.name}"? It has ${deleteClassConfirm._count.students} student(s) and ${deleteClassConfirm.sections.length} section(s). This action cannot be undone.` : ''}
      onConfirm={() => deleteClassConfirm && handleDeleteClass(deleteClassConfirm)}
      isLoading={isPending}
      variant="destructive"
      confirmLabel="Delete Class"
    />

    <ConfirmDialog
      open={!!deleteSectionConfirm}
      onOpenChange={(o) => !o && setDeleteSectionConfirm(null)}
      title="Delete Section"
      description={deleteSectionConfirm ? `Are you sure you want to delete section "${deleteSectionConfirm.name}" from ${deleteSectionConfirm.className}?` : ''}
      onConfirm={() => deleteSectionConfirm && handleDeleteSection(deleteSectionConfirm)}
      isLoading={isPending}
      variant="destructive"
      confirmLabel="Delete Section"
    />
  </>
  );
}
