'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Spinner, EmptyState } from '@/components/shared';
import { toast } from 'sonner';
import { useInvalidateCache } from '@/lib/cache-utils';
import { assignClassTeacherAction } from '../class-teacher-actions';
import { useSectionsWithClassTeachers, useTeacherProfiles } from '../hooks/use-timetable';
import { UserMinus } from 'lucide-react';

type SectionWithClassTeacher = {
  id: string;
  name: string;
  class: { id: string; name: string; grade: number };
  classTeacher: {
    id: string;
    firstName: string;
    lastName: string;
    teacherProfile: { employeeId: string } | null;
  } | null;
};

type TeacherOption = {
  id: string;
  employeeId: string;
  user: { id: string; firstName: string; lastName: string };
};

export function ClassTeacherManager() {
  const { data: sections, isLoading: sectionsLoading } = useSectionsWithClassTeachers();
  const { data: teachers, isLoading: teachersLoading } = useTeacherProfiles();

  if (sectionsLoading || teachersLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!sections || (sections as SectionWithClassTeacher[]).length === 0) {
    return (
      <EmptyState
        title="No sections found"
        description="Create classes and sections first before assigning class teachers."
      />
    );
  }

  // Group sections by class
  const grouped = new Map<string, { className: string; grade: number; sections: SectionWithClassTeacher[] }>();
  for (const section of sections as SectionWithClassTeacher[]) {
    const key = section.class.id;
    if (!grouped.has(key)) {
      grouped.set(key, { className: section.class.name, grade: section.class.grade, sections: [] });
    }
    grouped.get(key)!.sections.push(section);
  }

  const sortedClasses = [...grouped.entries()].sort((a, b) => a[1].grade - b[1].grade);

  return (
    <div className="space-y-4">
      {sortedClasses.map(([classId, { className, sections: classSections }]) => (
        <Card key={classId}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{className}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {classSections.map((section) => (
              <SectionTeacherRow
                key={section.id}
                section={section}
                teachers={(teachers as TeacherOption[]) ?? []}
              />
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function SectionTeacherRow({
  section,
  teachers,
}: {
  section: SectionWithClassTeacher;
  teachers: TeacherOption[];
}) {
  const [isPending, startTransition] = useTransition();
  const invalidate = useInvalidateCache();
  const [selectedUserId, setSelectedUserId] = useState(section.classTeacher?.id ?? '');

  const currentTeacher = section.classTeacher;
  const hasChanged = selectedUserId !== (currentTeacher?.id ?? '');

  function handleAssign() {
    startTransition(async () => {
      const userId = selectedUserId || null;
      const result = await assignClassTeacherAction(section.id, userId);
      if (result.success) {
        toast.success(userId ? 'Class teacher assigned' : 'Class teacher removed');
        await invalidate.afterTimetableMutation();
      } else {
        toast.error(result.error ?? 'Failed to assign class teacher');
      }
    });
  }

  function handleRemove() {
    startTransition(async () => {
      const result = await assignClassTeacherAction(section.id, null);
      if (result.success) {
        toast.success('Class teacher removed');
        setSelectedUserId('');
        await invalidate.afterTimetableMutation();
      } else {
        toast.error(result.error ?? 'Failed to remove class teacher');
      }
    });
  }

  return (
    <div className="flex items-center gap-3 rounded-lg border p-3">
      <div className="min-w-[80px]">
        <Badge variant="outline">{section.name}</Badge>
      </div>

      <Select value={selectedUserId} onValueChange={setSelectedUserId}>
        <SelectTrigger className="w-64">
          <SelectValue placeholder="Select teacher..." />
        </SelectTrigger>
        <SelectContent>
          {teachers.map((t) => (
            <SelectItem key={t.user.id} value={t.user.id}>
              {t.user.firstName} {t.user.lastName} ({t.employeeId})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex items-center gap-2 ml-auto">
        {hasChanged && (
          <Button size="sm" onClick={handleAssign} disabled={isPending}>
            {isPending && <Spinner size="sm" className="mr-1" />}
            Save
          </Button>
        )}
        {currentTeacher && (
          <Button
            size="sm"
            variant="ghost"
            onClick={handleRemove}
            disabled={isPending}
            title="Remove class teacher"
          >
            <UserMinus className="h-4 w-4 text-destructive" />
          </Button>
        )}
      </div>
    </div>
  );
}
