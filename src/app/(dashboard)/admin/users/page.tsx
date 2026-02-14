export const dynamic = 'force-dynamic';

import { listUsers } from '@/modules/users/user-queries';
import { listSubjects } from '@/modules/subjects/subject-queries';
import { listActiveClasses } from '@/modules/classes/class-queries';
import { UsersPageClient } from './users-page-client';

type Props = {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    search?: string;
    role?: string;
  }>;
};

export default async function UsersPage({ searchParams }: Props) {
  const params = await searchParams;

  const page = Math.max(1, parseInt(params.page ?? '1', 10));
  const pageSize = Math.min(50, Math.max(1, parseInt(params.pageSize ?? '20', 10)));
  const role = params.role as 'ADMIN' | 'PRINCIPAL' | 'TEACHER' | 'STUDENT' | undefined;

  const [result, subjects, classes] = await Promise.all([
    listUsers({ page, pageSize }, { search: params.search, role }),
    listSubjects(),
    listActiveClasses(),
  ]);

  const allSubjects = subjects.map((s) => ({ id: s.id, name: s.name, code: s.code }));
  const allClasses = classes.map((c) => ({
    id: c.id,
    name: c.name,
    grade: c.grade,
    sections: c.sections.map((s) => ({ id: s.id, name: s.name })),
  }));

  return <UsersPageClient result={result} allSubjects={allSubjects} allClasses={allClasses} />;
}
