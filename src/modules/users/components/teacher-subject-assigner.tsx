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
import { bulkAssignTeacherSubjectsAction } from '@/modules/subjects/subject-actions';
import { toast } from 'sonner';
import { BookOpen, Plus } from 'lucide-react';

type SubjectInfo = { id: string; name: string; code: string };
type TeacherSubjectAssignment = { subjectId: string; subject: SubjectInfo };

type Props = {
  teacherProfileId: string;
  teacherName: string;
  currentAssignments: TeacherSubjectAssignment[];
  allSubjects: SubjectInfo[];
};

export function TeacherSubjectAssigner({
  teacherProfileId,
  teacherName,
  currentAssignments,
  allSubjects,
}: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>(
    currentAssignments.map((a) => a.subjectId),
  );
  const router = useRouter();

  function handleOpenChange(isOpen: boolean) {
    setOpen(isOpen);
    if (isOpen) {
      setSelectedSubjectIds(currentAssignments.map((a) => a.subjectId));
    }
  }

  function toggleSubject(subjectId: string) {
    setSelectedSubjectIds((prev) =>
      prev.includes(subjectId) ? prev.filter((id) => id !== subjectId) : [...prev, subjectId],
    );
  }

  function handleSave() {
    startTransition(async () => {
      const result = await bulkAssignTeacherSubjectsAction({
        teacherId: teacherProfileId,
        subjectIds: selectedSubjectIds,
      });
      if (result.success) {
        toast.success('Subject assignments updated');
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
        {currentAssignments.length > 0 ? (
          currentAssignments.map((a) => (
            <Badge key={a.subjectId} variant="outline" className="text-xs">
              {a.subject.name}
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Assign Subjects — {teacherName}
            </DialogTitle>
            <DialogDescription>
              Select subjects this teacher is responsible for.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 max-h-[300px] overflow-y-auto py-2">
            {allSubjects.map((subject) => (
              <div key={subject.id} className="flex items-center gap-3 rounded-md border p-3">
                <Checkbox
                  id={`subject-${subject.id}`}
                  checked={selectedSubjectIds.includes(subject.id)}
                  onCheckedChange={() => toggleSubject(subject.id)}
                  disabled={isPending}
                />
                <Label htmlFor={`subject-${subject.id}`} className="flex-1 cursor-pointer">
                  {subject.name}
                </Label>
                <code className="text-xs text-muted-foreground">{subject.code}</code>
              </div>
            ))}
            {allSubjects.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No subjects found. Create subjects first.
              </p>
            )}
          </div>

          <div className="flex justify-between items-center pt-2">
            <span className="text-sm text-muted-foreground">
              {selectedSubjectIds.length} subject{selectedSubjectIds.length !== 1 ? 's' : ''} selected
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
