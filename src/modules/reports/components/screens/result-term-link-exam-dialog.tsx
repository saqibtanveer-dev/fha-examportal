import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import type { AvailableExam } from './result-term-detail-shared';

type Props = {
  open: boolean;
  selectedGroupName?: string;
  isPending: boolean;
  examSearch: string;
  examTypeFilter: string;
  examTypes: string[];
  unlinkedExamsCount: number;
  filteredExams: AvailableExam[];
  onClose: () => void;
  onSearchChange: (value: string) => void;
  onTypeFilterChange: (type: string) => void;
  onLinkExam: (examId: string) => void;
};

export function ResultTermLinkExamDialog({
  open,
  selectedGroupName,
  isPending,
  examSearch,
  examTypeFilter,
  examTypes,
  unlinkedExamsCount,
  filteredExams,
  onClose,
  onSearchChange,
  onTypeFilterChange,
  onLinkExam,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Link Exam to "{selectedGroupName}"</DialogTitle>
        </DialogHeader>
        {unlinkedExamsCount === 0 ? (
          <p className="text-sm text-muted-foreground py-4">
            All available exams are already linked. Add more exams to this class first.
          </p>
        ) : (
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title, subject, or code..."
                value={examSearch}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-9"
              />
            </div>
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
                    onClick={() => onTypeFilterChange(type)}
                  >
                    {type === 'all' ? 'All Types' : type}
                  </button>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              {filteredExams.length} of {unlinkedExamsCount} exams
            </p>
            <div className="max-h-72 overflow-y-auto space-y-1.5">
              {filteredExams.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No exams match your search</p>
              ) : (
                filteredExams.map((exam) => (
                  <button
                    key={exam.id}
                    className="w-full text-left rounded-md border px-3 py-2.5 text-sm hover:bg-accent active:bg-accent transition-colors"
                    onClick={() => onLinkExam(exam.id)}
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
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
