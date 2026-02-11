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
import { toast } from 'sonner';
import type { UserWithProfile } from '@/modules/users/user-queries';

type UserTableProps = {
  users: UserWithProfile[];
};

const roleBadgeVariant: Record<string, 'default' | 'secondary' | 'outline'> = {
  ADMIN: 'default',
  TEACHER: 'secondary',
  STUDENT: 'outline',
};

export function UserTable({ users }: UserTableProps) {
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
            <TableHead>Status</TableHead>
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
                <Badge variant={user.isActive ? 'default' : 'destructive'}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </Badge>
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

    <EditUserDialog
      open={!!editingUser}
      onOpenChange={(open) => !open && setEditingUser(null)}
      user={editingUser!}
    />
  </>
  );
}
