'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Plus, BookOpen, CheckCircle2, Clock, Trash2, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ConfirmDialog, EmptyState } from '@/components/shared';
import { createResultTermAction, deleteResultTermAction } from '@/modules/reports/actions/result-term-actions';
import { getSectionsForClassAction } from '@/modules/reports/actions/result-term-fetch-actions';
import type { ResultTermSummary } from '@/modules/reports/queries/result-term-queries';
import { format } from 'date-fns';

type Props = {
  terms: ResultTermSummary[];
  sessions: { id: string; name: string; isCurrent: boolean }[];
  classes: { id: string; name: string; grade: number }[];
};

export function ResultTermsClient({ terms, sessions, classes }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [scopeMode, setScopeMode] = useState<'ALL' | 'SECTION'>('ALL');
  const [classSections, setClassSections] = useState<{ id: string; name: string }[]>([]);
  const [form, setForm] = useState({
    name: '',
    description: '',
    academicSessionId: '',
    classId: '',
    sectionId: '',
  });
  const hasSessionOptions = sessions.length > 0;
  const hasClassOptions = classes.length > 0;
  const hasRequiredOptions = hasSessionOptions && hasClassOptions;

  function handleCreate() {
    if (!hasRequiredOptions) {
      toast.error('Required reference data is not available. Please refresh and try again.');
      return;
    }

    if (!form.name.trim() || !form.academicSessionId || !form.classId) {
      toast.error('Fill in all required fields');
      return;
    }
    if (scopeMode === 'SECTION' && !form.sectionId) {
      toast.error('Select section for section-wise term');
      return;
    }

    const payload = {
      ...form,
      sectionId: scopeMode === 'SECTION' ? form.sectionId : undefined,
    };

    startTransition(async () => {
      const res = await createResultTermAction(payload);
      if (res.success && res.data) {
        toast.success('Result term created');
        setCreateOpen(false);
        setScopeMode('ALL');
        setClassSections([]);
        setForm({ name: '', description: '', academicSessionId: '', classId: '', sectionId: '' });
        router.push(`/admin/reports/result-terms/${res.data.id}`);
      } else {
        toast.error(res.error ?? 'Failed to create');
      }
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const res = await deleteResultTermAction(id);
      if (res.success) {
        toast.success('Result term deleted');
        router.refresh();
      } else {
        toast.error(res.error ?? 'Failed to delete');
      }
      setDeleteId(null);
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Result Term
        </Button>
      </div>

      {terms.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="h-12 w-12 text-muted-foreground" />}
          title="No result terms"
          description="Create a result term to configure exam consolidation and generate DMCs"
          action={<Button onClick={() => setCreateOpen(true)}>Create Result Term</Button>}
        />
      ) : (
        <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {terms.map((term) => (
            <Card key={term.id} className="group">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base">{term.name}</CardTitle>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => router.push(`/admin/reports/result-terms/${term.id}`)}
                    >
                      <Settings className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={() => setDeleteId(term.id)}
                      disabled={isPending}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant={term.isPublished ? 'default' : 'secondary'}>
                    {term.isPublished ? 'Published' : 'Draft'}
                  </Badge>
                  <Badge variant="outline">
                    {term.section ? `Section: ${term.section.name}` : 'All Sections'}
                  </Badge>
                  {term.isComputing && <Badge variant="outline">Computing...</Badge>}
                </div>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-1">
                <p>{term.class.name} · {term.academicSession.name}</p>
                <p className="flex items-center gap-1">
                  <BookOpen className="h-3.5 w-3.5" />
                  {term._count.examGroups} groups · {term._count.consolidatedResults} results
                </p>
                {term.computedAt && (
                  <p className="flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                    Computed {format(term.computedAt, 'dd MMM yyyy')}
                  </p>
                )}
                {!term.computedAt && (
                  <p className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    Not computed
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Result Term</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {!hasRequiredOptions && (
              <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                Session/Class options are unavailable right now. This is usually a temporary server data issue.
              </div>
            )}
            <div className="space-y-1.5">
              <Label>Name *</Label>
              <Input
                placeholder="e.g. Annual Result 2025-26"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Academic Session *</Label>
              <Select
                value={form.academicSessionId}
                onValueChange={(v) => setForm((f) => ({ ...f, academicSessionId: v }))}
                disabled={!hasSessionOptions}
              >
                <SelectTrigger><SelectValue placeholder="Select session" /></SelectTrigger>
                <SelectContent>
                  {sessions.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} {s.isCurrent ? '(Current)' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Class *</Label>
              <Select
                value={form.classId}
                onValueChange={(v) => {
                  setForm((f) => ({ ...f, classId: v, sectionId: '' }));
                  setClassSections([]);
                  if (!v) return;
                  startTransition(async () => {
                    const sections = await getSectionsForClassAction(v);
                    setClassSections(sections);
                  });
                }}
                disabled={!hasClassOptions}
              >
                <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                <SelectContent>
                  {classes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Scope</Label>
              <Select value={scopeMode} onValueChange={(value) => {
                const next = value as 'ALL' | 'SECTION';
                setScopeMode(next);
                if (next === 'ALL') {
                  setForm((f) => ({ ...f, sectionId: '' }));
                }
              }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Sections (default)</SelectItem>
                  <SelectItem value="SECTION">Single Section</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Section {scopeMode === 'SECTION' ? '*' : '(optional)'}</Label>
              <Select
                value={form.sectionId}
                onValueChange={(v) => setForm((f) => ({ ...f, sectionId: v }))}
                disabled={scopeMode !== 'SECTION' || !form.classId || classSections.length === 0}
              >
                <SelectTrigger><SelectValue placeholder="Select section" /></SelectTrigger>
                <SelectContent>
                  {classSections.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Input
                placeholder="Optional description"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCreateOpen(false);
                setScopeMode('ALL');
                setClassSections([]);
                setForm({ name: '', description: '', academicSessionId: '', classId: '', sectionId: '' });
              }}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={isPending || !hasRequiredOptions}>
              {isPending ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Delete Result Term"
        description="This will permanently delete the result term and all its configuration. Computed results will be preserved only if there are none."
        onConfirm={() => deleteId && handleDelete(deleteId)}
        variant="destructive"
        confirmLabel="Delete"
        isLoading={isPending}
      />
    </div>
  );
}
