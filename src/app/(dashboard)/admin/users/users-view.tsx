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
import dynamic from 'next/dynamic';
import { Plus, Search } from 'lucide-react';
import { PageHeader, EmptyState, PaginationControls } from '@/components/shared';
import { CsvImportDialog } from '@/components/shared/csv-import-dialog';
import { UserTable } from '@/modules/users/components';

const CreateUserDialog = dynamic(
  () => import('@/modules/users/components/create-user-dialog').then(m => ({ default: m.CreateUserDialog })),
  { ssr: false },
);
import { importUsersFromCsvAction } from '@/modules/users/import-actions';
import type { PaginatedResult } from '@/utils/pagination';
import type { UserWithProfile } from '@/modules/users/user-queries';

const USER_CSV_SAMPLE =
  'email,firstName,lastName,role,phone,password,classId,sectionId,rollNumber,registrationNo,employeeId\njohn@school.com,John,Doe,STUDENT,03001234567,Temp@1234,<class-id>,<section-id>,101,STU-2026-001,\njane@school.com,Jane,Smith,TEACHER,,,,,,,EMP-001\nadmin@school.com,Admin,User,ADMIN,,,,,,,';


type SubjectInfo = { id: string; name: string; code: string };
type ClassInfo = {
  id: string;
  name: string;
  grade: number;
  sections: { id: string; name: string }[];
};

type SubjectClassLinkInfo = { subjectId: string; classId: string; className: string };

type Props = {
  result: PaginatedResult<UserWithProfile>;
  allSubjects?: SubjectInfo[];
  allClasses?: ClassInfo[];
  subjectClassLinks?: SubjectClassLinkInfo[];
};

export function UsersView({ result, allSubjects = [], allClasses = [], subjectClassLinks = [] }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
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

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    updateFilters('search', searchValue);
  }

  function goToPage(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(page));
    router.push(`/admin/users?${params.toString()}`);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management"
        description="Manage admins, principals, teachers, and students"
        breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Users' }]}
        actions={
          <div className="flex gap-2">
            <CsvImportDialog
              title="Import Users"
              description="Upload a CSV file to bulk-create users. Students require classId, sectionId, rollNumber, registrationNo. Teachers require employeeId."
              requiredColumns={['email', 'firstName', 'lastName', 'role']}
              optionalColumns={['phone', 'password', 'classId', 'sectionId', 'rollNumber', 'registrationNo', 'employeeId', 'qualification', 'specialization', 'guardianName', 'guardianPhone']}
              sampleCsv={USER_CSV_SAMPLE}
              onImport={async (rows) => {
                const res = await importUsersFromCsvAction(rows);
                if (!res.success) throw new Error(res.error);
                return res.data!;
              }}
            />
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </div>
        }
      />

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              defaultValue={currentSearch}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button type="submit" size="sm">
            Search
          </Button>
        </form>
        <Select
          value={currentRole}
          onValueChange={(val) => updateFilters('role', val === 'ALL' ? '' : val)}
        >
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Roles</SelectItem>
            <SelectItem value="ADMIN">Admin</SelectItem>
            <SelectItem value="PRINCIPAL">Principal</SelectItem>
            <SelectItem value="TEACHER">Teacher</SelectItem>
            <SelectItem value="STUDENT">Student</SelectItem>
            <SelectItem value="FAMILY">Family</SelectItem>
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
        <UserTable users={result.data} allSubjects={allSubjects} allClasses={allClasses} subjectClassLinks={subjectClassLinks} />
      )}

      {/* Pagination */}
      <PaginationControls
        currentPage={result.pagination.page}
        totalPages={result.pagination.totalPages}
        totalCount={result.pagination.totalCount}
        pageSize={result.pagination.pageSize}
        onPageChange={goToPage}
      />

      <CreateUserDialog open={dialogOpen} onOpenChange={setDialogOpen} classes={allClasses} />
    </div>
  );
}
