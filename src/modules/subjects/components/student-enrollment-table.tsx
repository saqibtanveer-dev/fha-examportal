'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/shared';
import {
  enrollStudentInSubjectAction,
  bulkEnrollStudentsAction,
} from '@/modules/subjects/enrollment-actions';
import { toast } from 'sonner';
import { UserPlus, Users, Wand2 } from 'lucide-react';

type SubjectInfo = { id: string; name: string; code: string; enrolledCount: number };
type StudentInfo = {
  id: string;
  rollNumber: string | null;
  user: { firstName: string; lastName: string };
};

type Props = {
  subjects: SubjectInfo[];
  unassignedStudents: StudentInfo[];
  classId: string;
  sessionId: string;
  onRefresh: () => void;
};

export function StudentEnrollmentTable({
  subjects,
  unassignedStudents,
  classId,
  sessionId,
  onRefresh,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [assignments, setAssignments] = useState<Record<string, string>>({});

  function setStudentSubject(studentId: string, subjectId: string) {
    setAssignments((prev) => ({ ...prev, [studentId]: subjectId }));
  }

  // Quick assign ALL unassigned students to one subject
  function quickAssignAll(subjectId: string) {
    const bulk: Record<string, string> = {};
    for (const s of unassignedStudents) bulk[s.id] = subjectId;
    setAssignments(bulk);
  }

  function handleEnrollOne(studentId: string) {
    const subjectId = assignments[studentId];
    if (!subjectId) { toast.error('Select a subject first'); return; }

    startTransition(async () => {
      const result = await enrollStudentInSubjectAction({
        studentProfileId: studentId,
        subjectId,
        classId,
        academicSessionId: sessionId,
      });
      if (result.success) {
        toast.success('Student enrolled');
        onRefresh();
      } else {
        toast.error(result.error ?? 'Enrollment failed');
      }
    });
  }

  function handleBulkEnroll() {
    const bySubject = new Map<string, string[]>();
    for (const [studentId, subjectId] of Object.entries(assignments)) {
      if (!subjectId) continue;
      const existing = bySubject.get(subjectId) ?? [];
      existing.push(studentId);
      bySubject.set(subjectId, existing);
    }

    if (bySubject.size === 0) { toast.error('No assignments made'); return; }

    startTransition(async () => {
      let total = 0;
      for (const [subjectId, studentIds] of bySubject) {
        const result = await bulkEnrollStudentsAction({
          studentProfileIds: studentIds,
          subjectId,
          classId,
          academicSessionId: sessionId,
        });
        if (result.success) {
          total += result.data?.count ?? 0;
        } else {
          toast.error(result.error ?? 'Bulk enrollment failed');
          return;
        }
      }
      toast.success(`${total} student${total !== 1 ? 's' : ''} enrolled`);
      setAssignments({});
      onRefresh();
    });
  }

  const assignedCount = Object.values(assignments).filter(Boolean).length;

  if (unassignedStudents.length === 0) {
    return (
      <div className="text-center py-4 space-y-1">
        <Users className="h-8 w-8 mx-auto text-green-500" />
        <p className="text-sm font-medium text-green-700 dark:text-green-400">All students assigned!</p>
        <p className="text-xs text-muted-foreground">
          Every student has been enrolled in an elective from this group.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Quick assign bar */}
      <div className="rounded-md bg-muted/50 p-2.5 space-y-2">
        <p className="text-xs font-medium flex items-center gap-1.5">
          <Wand2 className="h-3.5 w-3.5 text-primary" />
          Quick: assign all {unassignedStudents.length} students to one subject
        </p>
        <div className="flex flex-wrap gap-1.5">
          {subjects.map((subj) => (
            <Button
              key={subj.id}
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => quickAssignAll(subj.id)}
              disabled={isPending}
            >
              All → {subj.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <Badge variant="outline" className="gap-1">
          <UserPlus className="h-3 w-3" />
          {unassignedStudents.length} unassigned
        </Badge>
        {assignedCount > 0 && (
          <Button size="sm" onClick={handleBulkEnroll} disabled={isPending}>
            {isPending && <Spinner size="sm" className="mr-1" />}
            Enroll {assignedCount} student{assignedCount !== 1 ? 's' : ''}
          </Button>
        )}
      </div>

      {/* Student list */}
      <div className="space-y-1.5">
        {unassignedStudents.map((student) => (
          <div key={student.id} className="flex items-center gap-2 rounded-md border p-2">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {student.user.firstName} {student.user.lastName}
              </p>
              {student.rollNumber && (
                <p className="text-xs text-muted-foreground">Roll #{student.rollNumber}</p>
              )}
            </div>
            <Select
              value={assignments[student.id] ?? ''}
              onValueChange={(v) => setStudentSubject(student.id, v)}
              disabled={isPending}
            >
              <SelectTrigger className="w-36 sm:w-40 h-8 text-xs">
                <SelectValue placeholder="Pick subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subj) => (
                  <SelectItem key={subj.id} value={subj.id}>{subj.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={() => handleEnrollOne(student.id)}
              disabled={isPending || !assignments[student.id]}
            >
              <UserPlus className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
