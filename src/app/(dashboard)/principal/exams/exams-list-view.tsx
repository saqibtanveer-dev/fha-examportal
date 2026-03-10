'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState, useTransition } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search } from 'lucide-react';
import { PaginationControls } from '@/components/shared';
import { ROUTES } from '@/lib/constants';
import { ExamMobileCard, ExamTableRow } from './exam-list-item';
import type { Exam, Subject } from './exam-list-item';

type Props = {
  exams: Exam[];
  total: number;
  currentPage: number;
  search: string;
  status: string;
  subjectId: string;
  type: string;
  subjects: Subject[];
};

export function ExamsListView({
  exams,
  total,
  currentPage,
  search,
  status,
  subjectId,
  type,
  subjects,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [searchValue, setSearchValue] = useState(search);
  const pageSize = 20;
  const totalPages = Math.ceil(total / pageSize);

  const updateFilters = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value) params.set(key, value);
        else params.delete(key);
      }
      if (!('page' in updates)) params.delete('page');
      startTransition(() => router.push(`${ROUTES.PRINCIPAL.EXAMS}?${params.toString()}`));
    },
    [router, searchParams, startTransition],
  );

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <form onSubmit={(e) => { e.preventDefault(); updateFilters({ search: searchValue }); }} className="flex gap-2 flex-1">
              <div className="relative flex-1">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <Input
                  placeholder="Search exams..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit" size="sm">Search</Button>
            </form>
            <Select value={status || 'all'} onValueChange={(v) => updateFilters({ status: v === 'all' ? '' : v })}>
              <SelectTrigger className="w-full sm:w-35"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="PUBLISHED">Published</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="ARCHIVED">Archived</SelectItem>
              </SelectContent>
            </Select>
            <Select value={type || 'all'} onValueChange={(v) => updateFilters({ type: v === 'all' ? '' : v })}>
              <SelectTrigger className="w-full sm:w-35"><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="QUIZ">Quiz</SelectItem>
                <SelectItem value="MIDTERM">Midterm</SelectItem>
                <SelectItem value="FINAL">Final</SelectItem>
                <SelectItem value="PRACTICE">Practice</SelectItem>
                <SelectItem value="CUSTOM">Custom</SelectItem>
              </SelectContent>
            </Select>
            <Select value={subjectId || 'all'} onValueChange={(v) => updateFilters({ subjectId: v === 'all' ? '' : v })}>
              <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Subject" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {subjects.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="text-muted-foreground flex items-center justify-between text-sm">
        <span>{total} exam{total !== 1 ? 's' : ''} found</span>
        {isPending && <span className="animate-pulse">Updating...</span>}
      </div>

      {/* Mobile Cards */}
      <div className="space-y-3 md:hidden">
        {exams.map((exam) => (
          <ExamMobileCard key={exam.id} exam={exam} />
        ))}
      </div>

      {/* Desktop Table */}
      <Card className="hidden overflow-hidden md:block">
        <CardHeader>
          <CardTitle>All Exams</CardTitle>
          <CardDescription>Comprehensive exam list with participation and performance</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Exam</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Questions</TableHead>
                <TableHead className="text-center">Students</TableHead>
                <TableHead className="text-right">Avg %</TableHead>
                <TableHead className="text-right">Pass Rate</TableHead>
                <TableHead>Created By</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exams.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-muted-foreground py-8 text-center">
                    No exams found matching the filters.
                  </TableCell>
                </TableRow>
              )}
              {exams.map((exam) => (
                <ExamTableRow
                  key={exam.id}
                  exam={exam}
                  onClick={() => router.push(`${ROUTES.PRINCIPAL.EXAMS}/${exam.id}`)}
                />
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        totalCount={total}
        pageSize={pageSize}
        onPageChange={(page) => updateFilters({ page: String(page) })}
      />
    </div>
  );
}