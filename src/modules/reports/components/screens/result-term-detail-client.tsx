'use client';

import { useState, useTransition, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Plus, Trash2, Link2, Link2Off, Zap, AlertTriangle, CheckCircle2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ConfirmDialog } from '@/components/shared';
import {
  addExamGroupAction,
  removeExamGroupAction,
  linkExamToGroupAction,
  unlinkExamFromGroupAction,
  autoLinkExamsByTypeAction,
} from '@/modules/reports/actions/result-exam-group-actions';
import type { ResultTermWithGroups } from '@/modules/reports/types/report-types';
import { REQUIRED_TOTAL_WEIGHT } from '@/modules/reports/engine/report-constants';

type AvailableExam = {
  id: string; title: string; type: string; status: string;
  totalMarks: number; subjectId: string;
  subject: { name: string; code: string };
};

type Props = {
  term: ResultTermWithGroups;
  availableExams: AvailableExam[];
};

export function ResultTermDetailClient({ term, availableExams }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [addGroupOpen, setAddGroupOpen] = useState(false);
  const [linkExamGroupId, setLinkExamGroupId] = useState<string | null>(null);
  const [removeGroupId, setRemoveGroupId] = useState<string | null>(null);
  const [examSearch, setExamSearch] = useState('');
  const [examTypeFilter, setExamTypeFilter] = useState<string>('all');
  const [groupForm, setGroupForm] = useState({
    name: '', weight: '', aggregateMode: 'SINGLE', bestOfCount: '',
  });

  const totalWeight = term.examGroups.reduce((s, g) => s + g.weight, 0);
  const weightOk = Math.abs(totalWeight - REQUIRED_TOTAL_WEIGHT) < 0.01;

  function handleAddGroup() {
    const weight = parseFloat(groupForm.weight);
    if (!groupForm.name.trim() || isNaN(weight)) {
      toast.error('Name and weight are required');
      return;
    }
    const sortOrder = term.examGroups.length;
    startTransition(async () => {
      const res = await addExamGroupAction({
        resultTermId: term.id,
        name: groupForm.name,
        weight,
        aggregateMode: groupForm.aggregateMode as 'SINGLE' | 'AVERAGE' | 'BEST_OF' | 'SUM',
        bestOfCount: groupForm.bestOfCount ? parseInt(groupForm.bestOfCount) : undefined,
        sortOrder,
      });
      if (res.success) {
        toast.success('Exam group added');
        setAddGroupOpen(false);
        setGroupForm({ name: '', weight: '', aggregateMode: 'SINGLE', bestOfCount: '' });
        router.refresh();
      } else {
        toast.error(res.error ?? 'Failed to add group');
      }
    });
  }

  function handleRemoveGroup(groupId: string) {
    startTransition(async () => {
      const res = await removeExamGroupAction(groupId);
      if (res.success) { toast.success('Group removed'); router.refresh(); }
      else toast.error(res.error ?? 'Failed');
      setRemoveGroupId(null);
    });
  }

  function handleLinkExam(examId: string) {
    if (!linkExamGroupId) return;
    startTransition(async () => {
      const res = await linkExamToGroupAction({ examGroupId: linkExamGroupId, examId });
      if (res.success) { toast.success('Exam linked'); router.refresh(); }
      else toast.error(res.error ?? 'Failed to link');
    });
  }

  function handleUnlink(linkId: string) {
    startTransition(async () => {
      const res = await unlinkExamFromGroupAction(linkId);
      if (res.success) { toast.success('Exam unlinked'); router.refresh(); }
      else toast.error(res.error ?? 'Failed');
    });
  }

  function handleAutoLink() {
    startTransition(async () => {
      const res = await autoLinkExamsByTypeAction(term.id);
      if (res.success) {
        toast.success(`Auto-linked ${res.data?.linked ?? 0} exams`);
        router.refresh();
      } else {
        toast.error(res.error ?? 'Auto-link failed');
      }
    });
  }

  const linkedExamIds = new Set(
    term.examGroups.flatMap((g) => g.examLinks.map((l) => l.exam.id)),
  );

  const selectedGroup = linkExamGroupId
    ? term.examGroups.find((g) => g.id === linkExamGroupId)
    : null;

  const unlinkedExams = availableExams.filter((e) => !linkedExamIds.has(e.id));

  const examTypes = useMemo(() => {
    const types = new Set(unlinkedExams.map((e) => e.type));
    return ['all', ...Array.from(types).sort()];
  }, [unlinkedExams]);

  const filteredExams = useMemo(() => {
    let list = unlinkedExams;
    if (examTypeFilter !== 'all') {
      list = list.filter((e) => e.type === examTypeFilter);
    }
    if (examSearch.trim()) {
      const q = examSearch.toLowerCase();
      list = list.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.subject.name.toLowerCase().includes(q) ||
          e.subject.code.toLowerCase().includes(q),
      );
    }
    return list;
  }, [unlinkedExams, examTypeFilter, examSearch]);

  return (
    <div className="space-y-6">
      {/* Weight Status Bar */}
      <Card className={weightOk ? 'border-green-500/50' : 'border-amber-500/50'}>
        <CardContent className="flex flex-col gap-3 py-3 px-3 sm:px-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm">
            {weightOk
              ? <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
              : <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />}
            <span>
              Total weight: <strong>{totalWeight.toFixed(2)}%</strong>
              {!weightOk && <span className="text-amber-600 ml-2">Must equal 100%</span>}
            </span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleAutoLink} disabled={isPending} className="flex-1 sm:flex-initial">
              <Zap className="mr-1.5 h-3.5 w-3.5" /> Auto-link
            </Button>
            <Button size="sm" onClick={() => setAddGroupOpen(true)} disabled={term.isPublished} className="flex-1 sm:flex-initial">
              <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Group
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Exam Groups */}
      {term.examGroups.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p className="mb-3">No exam groups yet.</p>
            <Button onClick={() => setAddGroupOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add First Group
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {term.examGroups.map((group) => (
            <Card key={group.id}>
              <CardHeader className="pb-2">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2 flex-wrap">
                    <CardTitle className="text-base">{group.name}</CardTitle>
                    <Badge variant="outline">{group.weight}%</Badge>
                    <Badge variant="secondary" className="text-xs">{group.aggregateMode}</Badge>
                    {group.bestOfCount && (
                      <Badge variant="secondary" className="text-xs">Best of {group.bestOfCount}</Badge>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setLinkExamGroupId(group.id)}
                      disabled={term.isPublished || isPending}
                    >
                      <Link2 className="mr-1.5 h-3.5 w-3.5" /> Link Exam
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => setRemoveGroupId(group.id)}
                      disabled={term.isPublished}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {group.examLinks.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">No exams linked</p>
                ) : (
                  <div className="space-y-1.5">
                    {group.examLinks.map((link) => (
                      <div
                        key={link.id}
                        className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                      >
                        <div>
                          <span className="font-medium">{link.exam.title}</span>
                          <span className="ml-2 text-muted-foreground">
                            {link.exam.subjectName} · {link.exam.totalMarks} marks · {link.exam.type}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground"
                          onClick={() => handleUnlink(link.id)}
                          disabled={term.isPublished || isPending}
                        >
                          <Link2Off className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Group Dialog */}
      <Dialog open={addGroupOpen} onOpenChange={setAddGroupOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Exam Group</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Group Name *</Label>
              <Input
                placeholder="e.g. Midterm, Final, Quizzes"
                value={groupForm.name}
                onChange={(e) => setGroupForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Weight (%) *</Label>
                <Input
                  type="number" min={0.01} max={100} step={0.01}
                  placeholder="e.g. 30"
                  value={groupForm.weight}
                  onChange={(e) => setGroupForm((f) => ({ ...f, weight: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Aggregate Mode</Label>
                <Select
                  value={groupForm.aggregateMode}
                  onValueChange={(v) => setGroupForm((f) => ({ ...f, aggregateMode: v }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SINGLE">Single Exam</SelectItem>
                    <SelectItem value="AVERAGE">Average All</SelectItem>
                    <SelectItem value="BEST_OF">Best of N</SelectItem>
                    <SelectItem value="SUM">Sum All</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {groupForm.aggregateMode === 'BEST_OF' && (
              <div className="space-y-1.5">
                <Label>Best of Count *</Label>
                <Input
                  type="number" min={1}
                  placeholder="e.g. 2"
                  value={groupForm.bestOfCount}
                  onChange={(e) => setGroupForm((f) => ({ ...f, bestOfCount: e.target.value }))}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddGroupOpen(false)}>Cancel</Button>
            <Button onClick={handleAddGroup} disabled={isPending}>
              {isPending ? 'Adding...' : 'Add Group'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Link Exam Dialog */}
      <Dialog
        open={!!linkExamGroupId}
        onOpenChange={(o) => {
          if (!o) {
            setLinkExamGroupId(null);
            setExamSearch('');
            setExamTypeFilter('all');
          }
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Link Exam to "{selectedGroup?.name}"</DialogTitle>
          </DialogHeader>
          {unlinkedExams.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">
              All available exams are already linked. Add more exams to this class first.
            </p>
          ) : (
            <div className="space-y-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by title, subject, or code..."
                  value={examSearch}
                  onChange={(e) => setExamSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              {/* Type filter */}
              {examTypes.length > 2 && (
                <div className="flex gap-1.5 flex-wrap">
                  {examTypes.map((type) => (
                    <button
                      key={type}
                      className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                        examTypeFilter === type
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'hover:bg-accent'
                      }`}
                      onClick={() => setExamTypeFilter(type)}
                    >
                      {type === 'all' ? 'All Types' : type}
                    </button>
                  ))}
                </div>
              )}
              {/* Results count */}
              <p className="text-xs text-muted-foreground">
                {filteredExams.length} of {unlinkedExams.length} exams
              </p>
              {/* Exam list */}
              <div className="max-h-72 overflow-y-auto space-y-1.5">
                {filteredExams.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    No exams match your search
                  </p>
                ) : (
                  filteredExams.map((exam) => (
                    <button
                      key={exam.id}
                      className="w-full text-left rounded-md border px-3 py-2.5 text-sm hover:bg-accent active:bg-accent transition-colors"
                      onClick={() => handleLinkExam(exam.id)}
                      disabled={isPending}
                    >
                      <p className="font-medium">{exam.title}</p>
                      <p className="text-muted-foreground text-xs mt-0.5">
                        {exam.subject.name} ({exam.subject.code}) · {exam.type} · {exam.totalMarks} marks
                      </p>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setLinkExamGroupId(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!removeGroupId}
        onOpenChange={(o) => !o && setRemoveGroupId(null)}
        title="Remove Exam Group"
        description="This will remove the group and unlink all exams in it."
        onConfirm={() => removeGroupId && handleRemoveGroup(removeGroupId)}
        variant="destructive"
        confirmLabel="Remove"
      />
    </div>
  );
}
