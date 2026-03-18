'use client';

import { useState, useTransition, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Plus, Zap, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import type { AvailableExam, GroupFormState } from './result-term-detail-shared';
import { ResultTermAddGroupDialog } from './result-term-add-group-dialog';
import { ResultTermLinkExamDialog } from './result-term-link-exam-dialog';
import { ResultTermGroupCard } from './result-term-group-card';

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
  const [groupForm, setGroupForm] = useState<GroupFormState>({
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
            <Button size="sm" onClick={() => setAddGroupOpen(true)} disabled={term.isPublished || isPending} className="flex-1 sm:flex-initial">
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
            <ResultTermGroupCard
              key={group.id}
              group={group}
              isPending={isPending}
              isPublished={term.isPublished}
              onLinkExam={setLinkExamGroupId}
              onRemoveGroup={setRemoveGroupId}
              onUnlinkExam={handleUnlink}
            />
          ))}
        </div>
      )}

      <ResultTermAddGroupDialog
        open={addGroupOpen}
        isPending={isPending}
        groupForm={groupForm}
        setOpen={setAddGroupOpen}
        setGroupForm={setGroupForm}
        onAddGroup={handleAddGroup}
      />

      <ResultTermLinkExamDialog
        open={!!linkExamGroupId}
        selectedGroupName={selectedGroup?.name}
        isPending={isPending}
        examSearch={examSearch}
        examTypeFilter={examTypeFilter}
        examTypes={examTypes}
        unlinkedExamsCount={unlinkedExams.length}
        filteredExams={filteredExams}
        onClose={() => {
          setLinkExamGroupId(null);
          setExamSearch('');
          setExamTypeFilter('all');
        }}
        onSearchChange={setExamSearch}
        onTypeFilterChange={setExamTypeFilter}
        onLinkExam={handleLinkExam}
      />

      <ConfirmDialog
        open={!!removeGroupId}
        onOpenChange={(o) => !o && setRemoveGroupId(null)}
        title="Remove Exam Group"
        description="This will remove the group and unlink all exams in it."
        onConfirm={() => removeGroupId && handleRemoveGroup(removeGroupId)}
        variant="destructive"
        confirmLabel="Remove"
        isLoading={isPending}
      />
    </div>
  );
}
