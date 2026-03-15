'use client';

import { useState, useCallback } from 'react';
import { useInvalidateCache } from '@/lib/cache-utils';
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
import { MoreHorizontal, Pencil, Power, Trash2, Link2, Loader2 } from 'lucide-react';
import { formatDate } from '@/utils/format';
import { toggleUserActiveAction, deleteUserAction } from '@/modules/users/user-actions';
import { EditUserDialog } from './edit-user-dialog';
import { ManageFamilyLinksDialog } from './manage-family-links-dialog';
import { TeacherSubjectAssigner } from './teacher-subject-assigner';
import { ConfirmDialog } from '@/components/shared';
import { toast } from 'sonner';
import type { UserWithProfile } from '@/modules/users/user-queries';

type SubjectInfo = { id: string; name: string; code: string };
type SubjectClassLinkInfo = { subjectId: string; classId: string; className: string };
type ClassInfoWithSections = { id: string; name: string; grade: number; sections: { id: string; name: string }[] };

type UserTableProps = {
  users: UserWithProfile[];
  allSubjects?: SubjectInfo[];
  allClasses?: ClassInfoWithSections[];
  subjectClassLinks?: SubjectClassLinkInfo[];
};

const roleBadgeVariant: Record<string, 'default' | 'secondary' | 'outline'> = {
  ADMIN: 'default',
  PRINCIPAL: 'default',
  TEACHER: 'secondary',
  STUDENT: 'outline',
  FAMILY: 'outline',
};

type ActionKey = `${string}:${'toggle' | 'delete'}`;

export function UserTable({ users, allSubjects = [], allClasses = [], subjectClassLinks = [] }: UserTableProps) {
  const [loadingKeys, setLoadingKeys] = useState<Set<ActionKey>>(new Set());
  const [editingUser, setEditingUser] = useState<UserWithProfile | null>(null);
  const [familyLinkUser, setFamilyLinkUser] = useState<UserWithProfile | null>(null);
  const [toggleConfirm, setToggleConfirm] = useState<UserWithProfile | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<UserWithProfile | null>(null);
  const invalidate = useInvalidateCache();

  const isRowBusy = useCallback((userId: string) => {
    return loadingKeys.has(`${userId}:toggle`) || loadingKeys.has(`${userId}:delete`);
  }, [loadingKeys]);

  async function handleToggleActive(user: UserWithProfile) {
    const key: ActionKey = `${user.id}:toggle`;
    setLoadingKeys((prev) => new Set(prev).add(key));
    try {
      const result = await toggleUserActiveAction(user.id);
      if (result.success) {
        toast.success(`${user.firstName} ${user.isActive ? 'deactivated' : 'activated'}`);
        await invalidate.users();
      } else {
        toast.error(result.error ?? 'Failed');
      }
    } finally {
      setLoadingKeys((prev) => { const n = new Set(prev); n.delete(key); return n; });
      setToggleConfirm(null);
    }
  }

  async function handleDelete(user: UserWithProfile) {
    const key: ActionKey = `${user.id}:delete`;
    setLoadingKeys((prev) => new Set(prev).add(key));
    try {
      const result = await deleteUserAction(user.id);
      if (result.success) {
        toast.success(`${user.firstName} deleted`);
        await invalidate.users();
      } else {
        toast.error(result.error ?? 'Failed');
      }
    } finally {
      setLoadingKeys((prev) => { const n = new Set(prev); n.delete(key); return n; });
      setDeleteConfirm(null);
    }
  }

  return (
  <>
    {/* ── Mobile Card View ──────────────────────────────────── */}
    <div className="space-y-3 md:hidden">
      {users.map((user) => (
        <div key={user.id} className="rounded-lg border bg-card p-3 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="font-medium text-sm truncate">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <Badge variant={user.isActive ? 'default' : 'destructive'} className="text-[10px] px-1.5">
                {user.isActive ? 'Active' : 'Inactive'}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isRowBusy(user.id)}>
                    {isRowBusy(user.id) ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setEditingUser(user)}>
                    <Pencil className="mr-2 h-4 w-4" /> Edit
                  </DropdownMenuItem>
                  {user.role === 'FAMILY' && user.familyProfile && (
                    <DropdownMenuItem onClick={() => setFamilyLinkUser(user)}>
                      <Link2 className="mr-2 h-4 w-4" /> Manage Children
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => setToggleConfirm(user)}>
                    <Power className="mr-2 h-4 w-4" /> {user.isActive ? 'Deactivate' : 'Activate'}
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive" onClick={() => setDeleteConfirm(user)}>
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant={roleBadgeVariant[user.role] ?? 'outline'} className="text-[10px]">{user.role}</Badge>
            {user.role === 'STUDENT' && user.studentProfile && (
              <span className="text-[10px] text-muted-foreground">
                {user.studentProfile.class?.name}
                {user.studentProfile.section && ` - ${user.studentProfile.section.name}`}
                {user.studentProfile.rollNumber && ` (Roll: ${user.studentProfile.rollNumber})`}
              </span>
            )}
            {user.role === 'TEACHER' && user.teacherProfile && (
              <span className="text-[10px] text-muted-foreground">ID: {user.teacherProfile.employeeId}</span>
            )}
            {user.role === 'FAMILY' && user.familyProfile && (
              <span className="text-[10px] text-muted-foreground">
                {user.familyProfile.relationship} · {user.familyProfile.studentLinks.length} child{user.familyProfile.studentLinks.length !== 1 ? 'ren' : ''}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>

    {/* ── Desktop Table View ────────────────────────────────── */}
    <div className="hidden md:block overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead className="hidden md:table-cell">Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="hidden sm:table-cell">Class / Info</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden lg:table-cell">Subjects</TableHead>
            <TableHead className="hidden lg:table-cell">Created</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">
                {user.firstName} {user.lastName}
              </TableCell>
              <TableCell className="hidden md:table-cell">{user.email}</TableCell>
              <TableCell>
                <Badge variant={roleBadgeVariant[user.role] ?? 'outline'}>{user.role}</Badge>
              </TableCell>
              <TableCell className="hidden sm:table-cell">
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
                ) : user.role === 'FAMILY' && user.familyProfile ? (
                  <div className="text-xs">
                    <span className="font-medium">{user.familyProfile.relationship}</span>
                    <div className="text-muted-foreground">
                      {user.familyProfile.studentLinks.length} child{user.familyProfile.studentLinks.length !== 1 ? 'ren' : ''} linked
                    </div>
                  </div>
                ) : user.role === 'FAMILY' ? (
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
              <TableCell className="hidden lg:table-cell">
                {user.role === 'TEACHER' && user.teacherProfile ? (
                  <TeacherSubjectAssigner
                    teacherProfileId={user.teacherProfile.id}
                    teacherName={user.email}
                    currentAssignments={
                      user.teacherProfile.teacherSubjects?.filter((ts: any) => ts.class && ts.subject && ts.section).map((ts: any) => ({
                        subjectId: ts.subject.id,
                        classId: ts.class.id,
                        sectionId: ts.section.id,
                        subject: {
                          id: ts.subject.id,
                          name: ts.subject.name,
                          code: ts.subject.code,
                        },
                        class: {
                          id: ts.class.id,
                          name: ts.class.name,
                        },
                        section: { id: ts.section.id, name: ts.section.name },
                      })) ?? []
                    }
                    allSubjects={allSubjects}
                    allClasses={allClasses}
                    subjectClassLinks={subjectClassLinks}
                  />
                ) : (
                  <span className="text-muted-foreground text-xs">—</span>
                )}
              </TableCell>
              <TableCell className="hidden lg:table-cell">{formatDate(user.createdAt)}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" disabled={isRowBusy(user.id)}>
                      {isRowBusy(user.id) ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setEditingUser(user)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    {user.role === 'FAMILY' && user.familyProfile && (
                      <DropdownMenuItem onClick={() => setFamilyLinkUser(user)}>
                        <Link2 className="mr-2 h-4 w-4" />
                        Manage Children
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => setToggleConfirm(user)}>
                      <Power className="mr-2 h-4 w-4" />
                      {user.isActive ? 'Deactivate' : 'Activate'}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => setDeleteConfirm(user)}
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

    <ConfirmDialog
      open={!!toggleConfirm}
      onOpenChange={(o) => !o && setToggleConfirm(null)}
      title={toggleConfirm?.isActive ? 'Deactivate User' : 'Activate User'}
      description={toggleConfirm ? `Are you sure you want to ${toggleConfirm.isActive ? 'deactivate' : 'activate'} ${toggleConfirm.firstName} ${toggleConfirm.lastName}? ${toggleConfirm.isActive ? 'They will lose access to the system.' : 'They will regain access to the system.'}` : ''}
      onConfirm={() => toggleConfirm && handleToggleActive(toggleConfirm)}
      isLoading={toggleConfirm ? isRowBusy(toggleConfirm.id) : false}
      variant={toggleConfirm?.isActive ? 'destructive' : 'default'}
      confirmLabel={toggleConfirm?.isActive ? 'Deactivate' : 'Activate'}
    />

    <ConfirmDialog
      open={!!deleteConfirm}
      onOpenChange={(o) => !o && setDeleteConfirm(null)}
      title="Delete User"
      description={deleteConfirm ? `Are you sure you want to delete ${deleteConfirm.firstName} ${deleteConfirm.lastName}? This action cannot be easily undone.` : ''}
      onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)}
      isLoading={deleteConfirm ? isRowBusy(deleteConfirm.id) : false}
      variant="destructive"
      confirmLabel="Delete"
    />

    {familyLinkUser && familyLinkUser.familyProfile && (
      <ManageFamilyLinksDialog
        open
        onOpenChange={(open) => !open && setFamilyLinkUser(null)}
        familyProfileId={familyLinkUser.familyProfile.id}
        familyUserName={`${familyLinkUser.firstName} ${familyLinkUser.lastName}`}
        linkedStudents={familyLinkUser.familyProfile.studentLinks.map((link) => ({
          linkId: link.id,
          studentProfileId: link.studentProfile.id,
          studentName: `${link.studentProfile.user.firstName} ${link.studentProfile.user.lastName}`,
          className: link.studentProfile.class.name,
          sectionName: link.studentProfile.section.name,
          relationship: link.relationship,
          isPrimary: link.isPrimary,
        }))}
      />
    )}
  </>
  );
}
