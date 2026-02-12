'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Spinner } from '@/components/shared';
import {
  createAcademicSessionAction,
  setCurrentAcademicSessionAction,
  deleteAcademicSessionAction,
} from '@/modules/academic-sessions/session-actions';
import { toast } from 'sonner';
import { CalendarDays, Plus, Star, Trash2 } from 'lucide-react';

type AcademicSession = {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  isCurrent: boolean;
  _count: { exams: number };
};

type Props = {
  sessions: AcademicSession[];
};

export function AcademicSessionManager({ sessions }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleCreate(formData: FormData) {
    startTransition(async () => {
      const name = formData.get('name') as string;
      const startDate = formData.get('startDate') as string;
      const endDate = formData.get('endDate') as string;

      const result = await createAcademicSessionAction({
        name,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        isCurrent: sessions.length === 0, // First session is auto current
      });

      if (result.success) {
        toast.success('Academic session created');
        setDialogOpen(false);
        router.refresh();
      } else {
        toast.error(result.error ?? 'Failed');
      }
    });
  }

  function handleSetCurrent(id: string) {
    startTransition(async () => {
      const result = await setCurrentAcademicSessionAction(id);
      if (result.success) {
        toast.success('Current session updated');
        router.refresh();
      } else {
        toast.error(result.error ?? 'Failed');
      }
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteAcademicSessionAction(id);
      if (result.success) {
        toast.success('Session deleted');
        router.refresh();
      } else {
        toast.error(result.error ?? 'Failed');
      }
    });
  }

  function formatDate(date: Date) {
    return new Date(date).toLocaleDateString('en-PK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Academic Sessions
            </CardTitle>
            <CardDescription>
              Manage academic year sessions. All exams are linked to the current active session.
            </CardDescription>
          </div>
          <Button size="sm" onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />New Session
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {sessions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            No academic sessions created yet. Create one to start organizing exams by year.
          </p>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <div
                key={session.id}
                className={`flex items-center justify-between rounded-lg border p-4 ${
                  session.isCurrent ? 'border-primary bg-primary/5' : ''
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{session.name}</span>
                    {session.isCurrent && (
                      <Badge variant="default" className="text-xs">
                        <Star className="mr-1 h-3 w-3" />Current
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatDate(session.startDate)} — {formatDate(session.endDate)} · {session._count.exams} exam{session._count.exams !== 1 ? 's' : ''}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!session.isCurrent && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetCurrent(session.id)}
                        disabled={isPending}
                      >
                        Set Current
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => handleDelete(session.id)}
                        disabled={isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Academic Session</DialogTitle>
              <DialogDescription>
                Add a new academic year/session (e.g., 2025-2026).
              </DialogDescription>
            </DialogHeader>
            <form action={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sessionName">Session Name</Label>
                <Input
                  id="sessionName"
                  name="name"
                  placeholder="e.g. 2025-2026"
                  required
                  disabled={isPending}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    name="startDate"
                    type="date"
                    required
                    disabled={isPending}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    name="endDate"
                    type="date"
                    required
                    disabled={isPending}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending && <Spinner size="sm" className="mr-2" />}
                  Create
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
