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
  changeStudentEnrollmentAction,
  unenrollStudentFromSubjectAction,
} from '@/modules/subjects/enrollment-actions';
import { toast } from 'sonner';
import { ArrowRightLeft, Users, UserMinus } from 'lucide-react';

type SubjectInfo = { id: string; name: string; code: string; enrolledCount: number };
type EnrolledStudent = {
  studentId: string;
  rollNumber: string | null;
  firstName: string;
  lastName: string;
  subjectId: string;
  subjectName: string;
};

type Props = {
  subjects: SubjectInfo[];
  enrolledStudents: EnrolledStudent[];
  classId: string;
  sessionId: string;
  onRefresh: () => void;
};

export function EnrolledStudentsTable({
  subjects,
  enrolledStudents,
  classId,
  sessionId,
  onRefresh,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [changes, setChanges] = useState<Record<string, string>>({});

  function setNewSubject(studentId: string, newSubjectId: string) {
    setChanges((prev) => ({ ...prev, [studentId]: newSubjectId }));
  }

  function handleChange(student: EnrolledStudent) {
    const newSubjectId = changes[student.studentId];
    if (!newSubjectId || newSubjectId === student.subjectId) {
      toast.error('Select a different subject');
      return;
    }

    startTransition(async () => {
      const result = await changeStudentEnrollmentAction({
        studentProfileId: student.studentId,
        oldSubjectId: student.subjectId,
        newSubjectId,
        classId,
        academicSessionId: sessionId,
      });
      if (result.success) {
        toast.success('Enrollment changed');
        setChanges((prev) => {
          const next = { ...prev };
          delete next[student.studentId];
          return next;
        });
        onRefresh();
      } else {
        toast.error(result.error ?? 'Change failed');
      }
    });
  }

  function handleUnenroll(student: EnrolledStudent) {
    startTransition(async () => {
      const result = await unenrollStudentFromSubjectAction({
        studentProfileId: student.studentId,
        subjectId: student.subjectId,
        academicSessionId: sessionId,
      });
      if (result.success) {
        toast.success('Student unenrolled');
        onRefresh();
      } else {
        toast.error(result.error ?? 'Unenroll failed');
      }
    });
  }

  if (enrolledStudents.length === 0) {
    return (
      <div className="text-center py-4 space-y-1">
        <Users className="h-8 w-8 mx-auto text-muted-foreground" />
        <p className="text-sm text-muted-foreground">No students enrolled yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Badge variant="outline" className="gap-1">
          <Users className="h-3 w-3" />
          {enrolledStudents.length} enrolled
        </Badge>
      </div>

      <div className="space-y-1.5">
        {enrolledStudents.map((student) => {
          const otherSubjects = subjects.filter((s) => s.id !== student.subjectId);
          const selectedNew = changes[student.studentId];
          const hasChange = selectedNew && selectedNew !== student.subjectId;

          return (
            <div key={student.studentId} className="flex items-center gap-2 rounded-md border p-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {student.firstName} {student.lastName}
                </p>
                <div className="flex items-center gap-1.5">
                  {student.rollNumber && (
                    <span className="text-xs text-muted-foreground">Roll #{student.rollNumber}</span>
                  )}
                  <Badge variant="secondary" className="text-[10px] h-4">
                    {student.subjectName}
                  </Badge>
                </div>
              </div>

              {otherSubjects.length > 0 && (
                <Select
                  value={selectedNew ?? ''}
                  onValueChange={(v) => setNewSubject(student.studentId, v)}
                  disabled={isPending}
                >
                  <SelectTrigger className="w-32 sm:w-36 h-8 text-xs">
                    <SelectValue placeholder="Change to..." />
                  </SelectTrigger>
                  <SelectContent>
                    {otherSubjects.map((subj) => (
                      <SelectItem key={subj.id} value={subj.id}>{subj.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={() => handleChange(student)}
                disabled={isPending || !hasChange}
                title="Change subject"
              >
                <ArrowRightLeft className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 text-destructive hover:text-destructive"
                onClick={() => handleUnenroll(student)}
                disabled={isPending}
                title="Unenroll student"
              >
                <UserMinus className="h-4 w-4" />
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
