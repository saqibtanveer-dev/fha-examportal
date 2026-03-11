'use client';

import { useState, useTransition } from 'react';
import { useInvalidateCache } from '@/lib/cache-utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Spinner } from '@/components/shared';
import {
  bulkAssignSubjectToClassesAction,
  updateSubjectClassElectiveAction,
} from '@/modules/subjects/subject-actions';
import { toast } from 'sonner';
import { Link2, Plus, Zap } from 'lucide-react';

type ClassInfo = { id: string; name: string; grade: number };
type SubjectClassLink = {
  id: string;
  classId: string;
  isActive: boolean;
  isElective?: boolean;
  electiveGroupName?: string | null;
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
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
  const [electiveConfig, setElectiveConfig] = useState<Record<string, { isElective: boolean; groupName: string }>>({});
  const invalidate = useInvalidateCache();

  const activeLinks = currentLinks.filter((l) => l.isActive);

  function handleOpenChange(isOpen: boolean) {
    setOpen(isOpen);
    if (isOpen) {
      setSelectedClassIds(activeLinks.map((l) => l.classId));
      const config: Record<string, { isElective: boolean; groupName: string }> = {};
      for (const link of activeLinks) {
        config[link.classId] = {
          isElective: link.isElective ?? false,
          groupName: link.electiveGroupName ?? '',
        };
      }
      setElectiveConfig(config);
    }
  }

  function toggleClass(classId: string) {
    setSelectedClassIds((prev) =>
      prev.includes(classId) ? prev.filter((id) => id !== classId) : [...prev, classId],
    );
  }

  function toggleElective(classId: string, checked: boolean) {
    setElectiveConfig((prev) => ({
      ...prev,
      [classId]: { isElective: checked, groupName: prev[classId]?.groupName ?? '' },
    }));
  }

  function setGroupName(classId: string, name: string) {
    setElectiveConfig((prev) => ({
      ...prev,
      [classId]: { isElective: prev[classId]?.isElective ?? false, groupName: name },
    }));
  }

  function handleSave() {
    startTransition(async () => {
      // Step 1: Save class assignments
      const result = await bulkAssignSubjectToClassesAction({ subjectId, classIds: selectedClassIds });
      if (!result.success) { toast.error(result.error ?? 'Failed to update'); return; }

      // Step 2: Update elective config for each selected class
      for (const classId of selectedClassIds) {
        const config = electiveConfig[classId];
        if (config) {
          await updateSubjectClassElectiveAction({
            subjectId,
            classId,
            isElective: config.isElective,
            electiveGroupName: config.isElective ? config.groupName || null : null,
          });
        }
      }

      toast.success('Class assignments updated');
      setOpen(false);
      await invalidate.subjects();
    });
  }

  return (
    <div>
      <div className="flex items-center gap-1.5 flex-wrap">
        {activeLinks.length > 0 ? (
          activeLinks.map((link) => (
            <Badge
              key={link.id}
              variant={link.isElective ? 'outline' : 'secondary'}
              className="text-xs gap-1"
            >
              {link.isElective && <Zap className="h-3 w-3 text-amber-500" />}
              {link.class.name}
            </Badge>
          ))
        ) : (
          <span className="text-xs text-muted-foreground">No classes</span>
        )}
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleOpenChange(true)}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5" />
              Assign Classes — {subjectName}
            </DialogTitle>
            <DialogDescription>
              Select classes where this subject is taught. Turn on &quot;Elective&quot; if not all students take it.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 max-h-100 overflow-y-auto py-2">
            {allClasses.map((cls) => {
              const isSelected = selectedClassIds.includes(cls.id);
              const config = electiveConfig[cls.id];
              return (
                <div key={cls.id} className="rounded-md border p-3 space-y-2">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id={`class-${cls.id}`}
                      checked={isSelected}
                      onCheckedChange={() => toggleClass(cls.id)}
                      disabled={isPending}
                    />
                    <Label htmlFor={`class-${cls.id}`} className="flex-1 cursor-pointer">
                      {cls.name}
                    </Label>
                    <Badge variant="outline" className="text-xs">Grade {cls.grade}</Badge>
                  </div>
                  {isSelected && (
                    <div className="ml-7 space-y-2">
                      <div className="flex items-center gap-2">
                        <Switch
                          id={`elective-${cls.id}`}
                          checked={config?.isElective ?? false}
                          onCheckedChange={(c) => toggleElective(cls.id, c)}
                          disabled={isPending}
                        />
                        <Label htmlFor={`elective-${cls.id}`} className="text-xs cursor-pointer flex items-center gap-1">
                          <Zap className="h-3 w-3 text-amber-500" />
                          Elective <span className="text-muted-foreground font-normal">(only some students take it)</span>
                        </Label>
                      </div>
                      {config?.isElective && (
                        <div className="space-y-1">
                          <Input
                            placeholder='Group name (e.g. "Science Elective")'
                            value={config.groupName}
                            onChange={(e) => setGroupName(cls.id, e.target.value)}
                            className="h-8 text-xs"
                            maxLength={50}
                            disabled={isPending}
                          />
                          <p className="text-[10px] text-muted-foreground">
                            Subjects with the same group name are alternatives — a student picks one.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
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
