'use client';

import { useState, useMemo, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { StudentMarksForm } from './student-marks-form';
import { StudentListSidebar } from './student-list-sidebar';
import { Users, Search } from 'lucide-react';
import type { DeepSerialize } from '@/utils/serialize';
import type { WrittenExamSession, WrittenExamQuestion } from '@/modules/written-exams/written-exam-queries';

type Session = DeepSerialize<WrittenExamSession>;
type Question = DeepSerialize<WrittenExamQuestion>;

type Props = {
  examId: string;
  questions: Question[];
  sessions: Session[];
  isFinalized: boolean;
};

type FilterStatus = 'all' | 'completed' | 'in-progress' | 'absent' | 'pending';

export function PerStudentView({ examId, questions, sessions, isFinalized }: Props) {
  const [selectedSessionId, setSelectedSessionId] = useState<string>(sessions[0]?.id ?? '');
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [search, setSearch] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const filteredSessions = useMemo(() => {
    let result = sessions;

    if (filter !== 'all') {
      result = result.filter((s) => {
        if (filter === 'completed') return s.isComplete;
        if (filter === 'in-progress') return s.status === 'IN_PROGRESS';
        if (filter === 'absent') return s.status === 'ABSENT';
        if (filter === 'pending') return s.status === 'NOT_STARTED';
        return true;
      });
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) =>
          s.student.firstName.toLowerCase().includes(q) ||
          s.student.lastName.toLowerCase().includes(q) ||
          s.student.rollNumber.toLowerCase().includes(q),
      );
    }

    return result;
  }, [sessions, filter, search]);

  const selectedSession = sessions.find((s) => s.id === selectedSessionId);
  const selectedIdx = filteredSessions.findIndex((s) => s.id === selectedSessionId);

  const handleSelectStudent = useCallback((sessionId: string) => {
    setSelectedSessionId(sessionId);
    setSidebarOpen(false);
  }, []);

  const navigateStudent = useCallback(
    (direction: 'prev' | 'next') => {
      const idx = filteredSessions.findIndex((s) => s.id === selectedSessionId);
      if (idx === -1) return;
      const newIdx = direction === 'next' ? idx + 1 : idx - 1;
      if (newIdx >= 0 && newIdx < filteredSessions.length) {
        const target = filteredSessions[newIdx];
        if (target) setSelectedSessionId(target.id);
      }
    },
    [filteredSessions, selectedSessionId],
  );

  const totalMarks = questions.reduce((s, q) => s + q.marks, 0);

  // Shared filter controls
  const filterControls = (
    <div className="space-y-2 p-3">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search student..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 pl-9 text-sm"
        />
      </div>
      <Select value={filter} onValueChange={(v) => setFilter(v as FilterStatus)}>
        <SelectTrigger className="h-9 text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Students</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="in-progress">In Progress</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="absent">Absent</SelectItem>
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">
        {filteredSessions.length} of {sessions.length} students
      </p>
    </div>
  );

  return (
    <>
      {/* Mobile: student picker button + form */}
      <div className="md:hidden">
        <Button
          variant="outline"
          className="mb-3 w-full justify-between"
          onClick={() => setSidebarOpen(true)}
        >
          <span className="flex items-center gap-2 truncate">
            <Users className="h-4 w-4 shrink-0" />
            {selectedSession
              ? `${selectedSession.student.firstName} ${selectedSession.student.lastName}`
              : 'Select Student'}
          </span>
          <span className="text-xs text-muted-foreground">
            {selectedIdx >= 0 ? `${selectedIdx + 1}/${filteredSessions.length}` : ''}
          </span>
        </Button>

        {/* Mobile Sheet sidebar */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="w-80 p-0">
            <SheetHeader className="border-b p-4 pb-3">
              <SheetTitle>Select Student</SheetTitle>
            </SheetHeader>
            {filterControls}
            <StudentListSidebar
              sessions={filteredSessions}
              selectedSessionId={selectedSessionId}
              onSelect={handleSelectStudent}
              totalMarks={totalMarks}
            />
          </SheetContent>
        </Sheet>

        {/* Mobile marks form */}
        {selectedSession ? (
          <StudentMarksForm
            examId={examId}
            session={selectedSession}
            questions={questions}
            isFinalized={isFinalized}
            onNavigate={navigateStudent}
            currentIndex={selectedIdx}
            totalStudents={filteredSessions.length}
          />
        ) : (
          <EmptyState />
        )}
      </div>

      {/* Desktop: inline sidebar + form */}
      <div className="hidden md:flex gap-0 overflow-hidden rounded-lg border bg-background">
        <div className="flex w-72 shrink-0 flex-col border-r lg:w-80">
          <div className="border-b">
            {filterControls}
          </div>
          <StudentListSidebar
            sessions={filteredSessions}
            selectedSessionId={selectedSessionId}
            onSelect={handleSelectStudent}
            totalMarks={totalMarks}
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          {selectedSession ? (
            <StudentMarksForm
              examId={examId}
              session={selectedSession}
              questions={questions}
              isFinalized={isFinalized}
              onNavigate={navigateStudent}
              currentIndex={selectedIdx}
              totalStudents={filteredSessions.length}
            />
          ) : (
            <EmptyState />
          )}
        </div>
      </div>
    </>
  );
}

function EmptyState() {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center gap-2 p-6 text-center">
      <Users className="h-10 w-10 text-muted-foreground/40" />
      <p className="text-sm text-muted-foreground">Select a student from the list</p>
    </div>
  );
}
