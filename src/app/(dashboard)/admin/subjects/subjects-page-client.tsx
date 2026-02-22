'use client';

import { useSubjectsList } from '@/modules/subjects/hooks/use-subjects-query';
import { useDepartmentsList } from '@/modules/departments/hooks/use-departments-query';
import { useActiveClasses } from '@/modules/classes/hooks/use-classes-query';
import { SubjectsListSkeleton } from './subjects-skeleton';
import { SubjectsView } from './subjects-view';

export function SubjectsPageClient() {
  const { data: subjects, isLoading: subjectsLoading } = useSubjectsList();
  const { data: departments, isLoading: departmentsLoading } = useDepartmentsList();
  const { data: classes, isLoading: classesLoading } = useActiveClasses();

  const isLoading = subjectsLoading || departmentsLoading || classesLoading;

  if (isLoading || !subjects || !departments || !classes) {
    return <SubjectsListSkeleton />;
  }

  return (
    <SubjectsView
      subjects={subjects}
      departments={departments.map((d: any) => ({ id: d.id, name: d.name }))}
      allClasses={classes.map((c: any) => ({ id: c.id, name: c.name, grade: c.grade }))}
    />
  );
}
