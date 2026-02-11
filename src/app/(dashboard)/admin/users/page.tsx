export const dynamic = 'force-dynamic';

import { listUsers } from '@/modules/users/user-queries';
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
  const role = params.role as 'ADMIN' | 'TEACHER' | 'STUDENT' | undefined;

  const result = await listUsers(
    { page, pageSize },
    { search: params.search, role },
  );

  return <UsersPageClient result={result} />;
}
