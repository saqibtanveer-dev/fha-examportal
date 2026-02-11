'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Search } from 'lucide-react';
import { PageHeader, EmptyState } from '@/components/shared';
import { UserTable, CreateUserDialog } from '@/modules/users/components';
import type { PaginatedResult } from '@/utils/pagination';
import type { UserWithProfile } from '@/modules/users/user-queries';

type Props = {
  result: PaginatedResult<UserWithProfile>;
};

export function UsersPageClient({ result }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSearch = searchParams.get('search') ?? '';
  const currentRole = searchParams.get('role') ?? '';

  function updateFilters(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete('page');
    router.push(`/admin/users?${params.toString()}`);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management"
        description="Manage admins, teachers, and students"
        breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Users' }]}
        actions={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            defaultValue={currentSearch}
            onChange={(e) => {
              const timer = setTimeout(() => updateFilters('search', e.target.value), 400);
              return () => clearTimeout(timer);
            }}
            className="pl-9"
          />
        </div>
        <Select
          value={currentRole}
          onValueChange={(val) => updateFilters('role', val === 'ALL' ? '' : val)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Roles</SelectItem>
            <SelectItem value="ADMIN">Admin</SelectItem>
            <SelectItem value="TEACHER">Teacher</SelectItem>
            <SelectItem value="STUDENT">Student</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      {result.data.length === 0 ? (
        <EmptyState
          title="No users found"
          description="Create your first user to get started."
          action={
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          }
        />
      ) : (
        <UserTable users={result.data} />
      )}

      {/* Pagination info */}
      {result.pagination.totalCount > 0 && (
        <p className="text-sm text-muted-foreground">
          Showing {result.data.length} of {result.pagination.totalCount} users
          (page {result.pagination.page} of {result.pagination.totalPages})
        </p>
      )}

      <CreateUserDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
