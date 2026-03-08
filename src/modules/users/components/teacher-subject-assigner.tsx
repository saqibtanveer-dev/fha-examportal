'use client';

import { useState, useMemo, useTransition } from 'react';
import { useInvalidateCache } from '@/lib/cache-utils';
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
import { bulkAssignTeacherSubjectsAction } from '@/modules/subjects/subject-actions';
import { toast } from 'sonner';
import { BookOpen, Plus } from 'lucide-react';

type SubjectInfo = { id: string; name: string; code: string };
type ClassInfo = { id: string; name: string };
type SectionInfo = { id: string; name: string };
type SubjectClassLink = { subjectId: string; classId: string; className: string };
type ClassInfoWithSections = { id: string; name: string; grade: number; sections: SectionInfo[] };
type TeacherSubjectAssignment = {
  subjectId: string;
  classId: string;
  sectionId: string;
  subject: SubjectInfo;
  class: ClassInfo;
  section?: SectionInfo;
};

type Props = {
  teacherProfileId: string;
  teacherName: string;
  currentAssignments: TeacherSubjectAssignment[];
  allSubjects: SubjectInfo[];
  allClasses?: ClassInfoWithSections[];
  subjectClassLinks: SubjectClassLink[];
};

export function TeacherSubjectAssigner({
  teacherProfileId,
  teacherName,
  currentAssignments,
  allSubjects,
  allClasses = [],
  subjectClassLinks,
}: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const invalidate = useInvalidateCache();

  // Group links by subject for organized display, include sections per class
  const classMap = useMemo(() => new Map(allClasses.map((c) => [c.id, c])), [allClasses]);

  const subjectGroups = useMemo(() => {
    const subjectMap = new Map(allSubjects.map((s) => [s.id, s]));
    const grouped = new Map<string, { classId: string; className: string; sections: SectionInfo[] }[]>();

    for (const link of subjectClassLinks) {
      if (!subjectMap.has(link.subjectId)) continue;
      const arr = grouped.get(link.subjectId) ?? [];
      const cls = classMap.get(link.classId);
      arr.push({ classId: link.classId, className: link.className, sections: cls?.sections ?? [] });
      grouped.set(link.subjectId, arr);
    }

    const groups: { subject: SubjectInfo; classes: { classId: string; className: string; sections: SectionInfo[] }[] }[] = [];
    for (const [subjectId, classes] of grouped) {
      const subject = subjectMap.get(subjectId);
      if (subject) {
        groups.push({ subject, classes: classes.sort((a, b) => a.className.localeCompare(b.className)) });
      }
    }

    return groups.sort((a, b) => a.subject.name.localeCompare(b.subject.name));
  }, [allSubjects, subjectClassLinks, classMap]);

  function makeKey(subjectId: string, classId: string, sectionId: string) {
    return `${subjectId}:${classId}:${sectionId}`;
  }

  function handleOpenChange(isOpen: boolean) {
    setOpen(isOpen);
    if (isOpen) {
      setSelectedKeys(new Set(currentAssignments.map((a) => makeKey(a.subjectId, a.classId, a.sectionId))));
    }
  }

  function togglePair(subjectId: string, classId: string, sectionId: string) {
    const key = makeKey(subjectId, classId, sectionId);
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function handleSave() {
    startTransition(async () => {
      const assignments = Array.from(selectedKeys).map((key) => {
        const [subjectId, classId, sectionId] = key.split(':');
        return { subjectId: subjectId!, classId: classId!, sectionId: sectionId! };
      });

      const result = await bulkAssignTeacherSubjectsAction({
        teacherId: teacherProfileId,
        assignments,
      });
      if (result.success) {
        toast.success('Subject-class assignments updated');
        setOpen(false);
        await invalidate.users();
      } else {
        toast.error(result.error ?? 'Failed to update');
      }
    });
  }

  return (
    <div>
      <div className="flex items-center gap-2 flex-wrap">
        {currentAssignments.length > 0 ? (
          currentAssignments.map((a) => (
            <Badge key={makeKey(a.subjectId, a.classId, a.sectionId)} variant="outline" className="text-xs">
              {a.subject.name} — {a.class.name}{a.section ? ` (${a.section.name})` : ''}
            </Badge>
          ))
        ) : (
          <span className="text-xs text-muted-foreground">No subjects assigned</span>
        )}
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenChange(true)}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Assign Subjects — {teacherName}
            </DialogTitle>
            <DialogDescription>
              Select which subjects, classes, and sections this teacher teaches.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 max-h-[400px] overflow-y-auto py-2">
            {subjectGroups.map(({ subject, classes }) => (
              <div key={subject.id} className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{subject.name}</span>
                  <code className="text-xs text-muted-foreground">{subject.code}</code>
                </div>
                <div className="space-y-1 pl-2">
                  {classes.map((cls) => (
                    <div key={cls.classId} className="space-y-1">
                      <span className="text-xs font-medium text-muted-foreground">{cls.className}</span>
                      <div className="grid grid-cols-2 gap-2 pl-2">
                        {cls.sections.map((sec) => {
                          const key = makeKey(subject.id, cls.classId, sec.id);
                          return (
                            <div key={key} className="flex items-center gap-2 rounded-md border p-2">
                              <Checkbox
                                id={`pair-${key}`}
                                checked={selectedKeys.has(key)}
                                onCheckedChange={() => togglePair(subject.id, cls.classId, sec.id)}
                                disabled={isPending}
                              />
                              <Label htmlFor={`pair-${key}`} className="flex-1 cursor-pointer text-sm">
                                {sec.name}
                              </Label>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {subjectGroups.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No subject-class links found. Assign subjects to classes first.
              </p>
            )}
          </div>

          <div className="flex justify-between items-center pt-2">
            <span className="text-sm text-muted-foreground">
              {selectedKeys.size} assignment{selectedKeys.size !== 1 ? 's' : ''} selected
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
