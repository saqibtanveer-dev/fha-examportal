import { listSubjects } from '@/modules/subjects/subject-queries';
import { listDepartments } from '@/modules/departments/department-queries';
import { SubjectsPageClient } from './subjects-page-client';

export default async function SubjectsPage() {
  const [subjects, departments] = await Promise.all([
    listSubjects(),
    listDepartments(),
  ]);

  return (
    <SubjectsPageClient
      subjects={subjects}
      departments={departments.map((d) => ({ id: d.id, name: d.name }))}
    />
  );
}
