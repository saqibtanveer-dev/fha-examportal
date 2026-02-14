'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { MoreHorizontal, Pencil, Power, Trash2 } from 'lucide-react';
import { formatDate } from '@/utils/format';
import { toggleUserActiveAction, deleteUserAction } from '@/modules/users/user-actions';
import { EditUserDialog } from './edit-user-dialog';
import { TeacherSubjectAssigner } from './teacher-subject-assigner';
import { toast } from 'sonner';
import type { UserWithProfile } from '@/modules/users/user-queries';

type SubjectInfo = { id: string; name: string; code: string };

type UserTableProps = {
  users: UserWithProfile[];
  allSubjects?: SubjectInfo[];
};

const roleBadgeVariant: Record<string, 'default' | 'secondary' | 'outline'> = {
  ADMIN: 'default',
  TEACHER: 'secondary',
  STUDENT: 'outline',
};

export function UserTable({ users, allSubjects = [] }: UserTableProps) {
  const [isPending, startTransition] = useTransition();
  const [editingUser, setEditingUser] = useState<UserWithProfile | null>(null);
  const router = useRouter();

  function handleToggleActive(userId: string) {
    startTransition(async () => {
      const result = await toggleUserActiveAction(userId);
      if (result.success) {
        toast.success('User status updated');
        router.refresh();
      } else {
        toast.error(result.error ?? 'Failed');
      }
    });
  }

  function handleDelete(userId: string) {
    startTransition(async () => {
      const result = await deleteUserAction(userId);
      if (result.success) {
        toast.success('User deleted');
        router.refresh();
      } else {
        toast.error(result.error ?? 'Failed');
      }
    });
  }

  return (
  <>
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Class / Info</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Subjects</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">
                {user.firstName} {user.lastName}
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Badge variant={roleBadgeVariant[user.role] ?? 'outline'}>{user.role}</Badge>
              </TableCell>
              <TableCell>
                {user.role === 'STUDENT' && user.studentProfile ? (
                  <div className="text-xs">
                    <span className="font-medium">{user.studentProfile.class?.name}</span>
                    {user.studentProfile.section && (
                      <span className="text-muted-foreground"> - {user.studentProfile.section.name}</span>
                    )}
                    <div className="text-muted-foreground">Roll: {user.studentProfile.rollNumber}</div>
                  </div>
                ) : user.role === 'STUDENT' ? (
                  <Badge variant="destructive" className="text-xs">No class</Badge>
                ) : user.role === 'TEACHER' && user.teacherProfile ? (
                  <span className="text-xs text-muted-foreground">ID: {user.teacherProfile.employeeId}</span>
                ) : user.role === 'TEACHER' ? (
                  <Badge variant="destructive" className="text-xs">No profile</Badge>
                ) : (
                  <span className="text-muted-foreground text-xs">—</span>
                )}
              </TableCell>
              <TableCell>
                <Badge variant={user.isActive ? 'default' : 'destructive'}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </TableCell>
              <TableCell>
                {user.role === 'TEACHER' && user.teacherProfile ? (
                  <TeacherSubjectAssigner
                    teacherProfileId={user.teacherProfile.id}
                    teacherName={user.email}
                    currentAssignments={
                      user.teacherProfile.teacherSubjects?.map((ts: any) => ({
                        subjectId: ts.subject.id,
                        subject: {
                          id: ts.subject.id,
                          name: ts.subject.name,
                          code: ts.subject.code,
                        },
                      })) ?? []
                    }
                    allSubjects={allSubjects}
                  />
                ) : (
                  <span className="text-muted-foreground text-xs">—</span>
                )}
              </TableCell>
              <TableCell>{formatDate(user.createdAt)}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" disabled={isPending}>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setEditingUser(user)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleToggleActive(user.id)}>
                      <Power className="mr-2 h-4 w-4" />
                      {user.isActive ? 'Deactivate' : 'Activate'}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => handleDelete(user.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>

    {editingUser && (
      <EditUserDialog
        open
        onOpenChange={(open) => !open && setEditingUser(null)}
        user={editingUser}
      />
    )}
  </>
  );
}
