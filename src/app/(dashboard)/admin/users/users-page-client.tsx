'use client';

import { useSearchParams } from 'next/navigation';
import { useUsersList } from '@/modules/users/hooks/use-users-query';
import { useSubjectsList } from '@/modules/subjects/hooks/use-subjects-query';
import { useActiveClasses } from '@/modules/classes/hooks/use-classes-query';
import { UsersListSkeleton } from './users-skeleton';
import { UsersView } from './users-view';
import type { UserRole } from '@prisma/client';

import type { PaginatedResult } from '@/utils/pagination';
import type { UserWithProfile } from '@/modules/users/user-queries';

export function UsersPageClient() {
  const searchParams = useSearchParams();
  
  const search = searchParams.get('search') ?? '';
  const role = (searchParams.get('role') as UserRole) || undefined;
  const page = Number(searchParams.get('page')) || 1;
  const pageSize = Number(searchParams.get('pageSize')) || 20;

  const { data: usersResult, isLoading: usersLoading } = useUsersList({
    search: search || undefined,
    role,
    page,
    pageSize: Math.min(50, Math.max(1, pageSize)),
  });

  const { data: subjects, isLoading: subjectsLoading } = useSubjectsList();
  const { data: classes, isLoading: classesLoading } = useActiveClasses();

  const isLoading = usersLoading || subjectsLoading || classesLoading;

  if (isLoading || !usersResult || !subjects || !classes) {
    return <UsersListSkeleton />;
  }

  return (
    <UsersView
      // Serialized data is structurally compatible (Date→string for unused fields)
      result={usersResult as unknown as PaginatedResult<UserWithProfile>}
      allSubjects={subjects.map((s) => ({ id: s.id, name: s.name, code: s.code }))}
      allClasses={classes.map((c) => ({
        id: c.id,
        name: c.name,
        grade: c.grade,
        sections: c.sections?.map((s) => ({ id: s.id, name: s.name })) ?? [],
      }))}
      subjectClassLinks={subjects.flatMap((s) =>
        (s.subjectClassLinks ?? [])
          .filter((link) => link.isActive !== false && link.class)
          .map((link) => ({
            subjectId: s.id,
            classId: link.class.id,
            className: link.class.name,
          })),
      )}
    />
  );
}
