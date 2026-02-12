export const dynamic = 'force-dynamic';

import { listSubjects } from '@/modules/subjects/subject-queries';
import { listDepartments } from '@/modules/departments/department-queries';
import { listActiveClasses } from '@/modules/classes/class-queries';
import { SubjectsPageClient } from './subjects-page-client';

export default async function SubjectsPage() {
  const [subjects, departments, classes] = await Promise.all([
    listSubjects(),
    listDepartments(),
    listActiveClasses(),
  ]);

  return (
    <SubjectsPageClient
      subjects={subjects}
      departments={departments.map((d) => ({ id: d.id, name: d.name }))}
      allClasses={classes.map((c) => ({ id: c.id, name: c.name, grade: c.grade }))}
    />
  );
}
