import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { GroupFormState } from './result-term-detail-shared';

type Props = {
  open: boolean;
  isPending: boolean;
  groupForm: GroupFormState;
  setOpen: (open: boolean) => void;
  setGroupForm: (updater: (prev: GroupFormState) => GroupFormState) => void;
  onAddGroup: () => void;
};

export function ResultTermAddGroupDialog({
  open,
  isPending,
  groupForm,
  setOpen,
  setGroupForm,
  onAddGroup,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Exam Group</DialogTitle>
        </DialogHeader>
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
                type="number"
                min={0.01}
                max={100}
                step={0.01}
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
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
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
                type="number"
                min={1}
                placeholder="e.g. 2"
                value={groupForm.bestOfCount}
                onChange={(e) => setGroupForm((f) => ({ ...f, bestOfCount: e.target.value }))}
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={onAddGroup} disabled={isPending}>
            {isPending ? 'Adding...' : 'Add Group'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
