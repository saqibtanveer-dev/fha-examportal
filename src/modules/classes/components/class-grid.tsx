'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pencil, Trash2, Users } from 'lucide-react';
import { deleteClassAction, deleteSectionAction } from '@/modules/classes/class-actions';
import { EditClassDialog } from './edit-class-dialog';
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
  const router = useRouter();

  function handleDeleteClass(id: string) {
    startTransition(async () => {
      const result = await deleteClassAction(id);
      if (result.success) {
        toast.success('Class deleted');
        router.refresh();
      } else {
        toast.error(result.error ?? 'Failed');
      }
    });
  }

  function handleDeleteSection(id: string) {
    startTransition(async () => {
      const result = await deleteSectionAction(id);
      if (result.success) {
        toast.success('Section deleted');
        router.refresh();
      } else {
        toast.error(result.error ?? 'Failed');
      }
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
                className="h-7 w-7"
                onClick={() => setEditingClass(cls)}
                disabled={isPending}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive"
                onClick={() => handleDeleteClass(cls.id)}
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
                        onClick={() => handleDeleteSection(sec.id)}
                        className="ml-1 text-destructive hover:text-destructive/80"
                        disabled={isPending}
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

    <EditClassDialog
      open={!!editingClass}
      onOpenChange={(open) => !open && setEditingClass(null)}
      classItem={editingClass!}
    />
  </>
  );
}
