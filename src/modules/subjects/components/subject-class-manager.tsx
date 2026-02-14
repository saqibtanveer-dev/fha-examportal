'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Spinner } from '@/components/shared';
import { bulkAssignSubjectToClassesAction } from '@/modules/subjects/subject-actions';
import { toast } from 'sonner';
import { Link2, Plus, X } from 'lucide-react';

type ClassInfo = { id: string; name: string; grade: number };
type SubjectClassLink = {
  id: string;
  classId: string;
  isActive: boolean;
  class: { id: string; name: string; grade: number };
};

type Props = {
  subjectId: string;
  subjectName: string;
  currentLinks: SubjectClassLink[];
  allClasses: ClassInfo[];
};

export function SubjectClassManager({ subjectId, subjectName, currentLinks, allClasses }: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>(
    currentLinks.filter((l) => l.isActive).map((l) => l.classId),
  );
  const router = useRouter();

  const activeLinks = currentLinks.filter((l) => l.isActive);

  function handleOpenChange(isOpen: boolean) {
    setOpen(isOpen);
    if (isOpen) {
      setSelectedClassIds(activeLinks.map((l) => l.classId));
    }
  }

  function toggleClass(classId: string) {
    setSelectedClassIds((prev) =>
      prev.includes(classId) ? prev.filter((id) => id !== classId) : [...prev, classId],
    );
  }

  function handleSave() {
    startTransition(async () => {
      const result = await bulkAssignSubjectToClassesAction({
        subjectId,
        classIds: selectedClassIds,
      });
      if (result.success) {
        toast.success('Class assignments updated');
        setOpen(false);
        router.refresh();
      } else {
        toast.error(result.error ?? 'Failed to update');
      }
    });
  }

  return (
    <div>
      <div className="flex items-center gap-2 flex-wrap">
        {activeLinks.length > 0 ? (
          activeLinks.map((link) => (
            <Badge key={link.id} variant="secondary" className="text-xs">
              {link.class.name}
            </Badge>
          ))
        ) : (
          <span className="text-xs text-muted-foreground">No classes assigned</span>
        )}
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenChange(true)}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5" />
              Assign Classes — {subjectName}
            </DialogTitle>
            <DialogDescription>
              Select classes where this subject is taught.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 max-h-[300px] overflow-y-auto py-2">
            {allClasses.map((cls) => (
              <div key={cls.id} className="flex items-center gap-3 rounded-md border p-3">
                <Checkbox
                  id={`class-${cls.id}`}
                  checked={selectedClassIds.includes(cls.id)}
                  onCheckedChange={() => toggleClass(cls.id)}
                  disabled={isPending}
                />
                <Label htmlFor={`class-${cls.id}`} className="flex-1 cursor-pointer">
                  {cls.name}
                </Label>
                <Badge variant="outline" className="text-xs">
                  Grade {cls.grade}
                </Badge>
              </div>
            ))}
            {allClasses.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No classes found. Create classes first.
              </p>
            )}
          </div>

          <div className="flex justify-between items-center pt-2">
            <span className="text-sm text-muted-foreground">
              {selectedClassIds.length} class{selectedClassIds.length !== 1 ? 'es' : ''} selected
            </span>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isPending}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isPending}>
                {isPending && <Spinner size="sm" className="mr-2" />}
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
