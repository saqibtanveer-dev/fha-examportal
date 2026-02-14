'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useRef, useTransition } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import {
  Search,
  ChevronLeft,
  ChevronRight,
  FileText,
  Users,
  BarChart3,
  Clock,
} from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants';

type Exam = {
  id: string;
  title: string;
  type: string;
  status: string;
  subjectName: string;
  subjectCode: string;
  createdBy: string;
  totalMarks: number;
  duration: number;
  scheduledStartAt: string | null;
  totalQuestions: number;
  totalStudents: number;
  avgPercentage: number;
  passRate: number;
  createdAt: string;
};

type Subject = { id: string; name: string; code: string };

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

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  PUBLISHED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  ACTIVE: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  COMPLETED: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  ARCHIVED: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
};

const typeLabels: Record<string, string> = {
  QUIZ: 'Quiz',
  MIDTERM: 'Midterm',
  FINAL: 'Final',
  PRACTICE: 'Practice',
  CUSTOM: 'Custom',
};

export function ExamsListClient({
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
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pageSize = 20;
  const totalPages = Math.ceil(total / pageSize);

  const updateFilters = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value) params.set(key, value);
        else params.delete(key);
      }
      // Reset page on filter change unless only page is being changed
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
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="Search exams..."
                defaultValue={search}
                className="pl-10"
                onChange={(e) => {
                  const value = e.target.value;
                  if (debounceRef.current) clearTimeout(debounceRef.current);
                  debounceRef.current = setTimeout(() => updateFilters({ search: value }), 400);
                }}
              />
            </div>
            <Select value={status || 'all'} onValueChange={(v) => updateFilters({ status: v === 'all' ? '' : v })}>
              <SelectTrigger className="w-full sm:w-35">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
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
              <SelectTrigger className="w-full sm:w-35">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
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
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {subjects.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="text-muted-foreground flex items-center justify-between text-sm">
        <span>
          {total} exam{total !== 1 ? 's' : ''} found
        </span>
        {isPending && <span className="animate-pulse">Updating...</span>}
      </div>

      {/* Mobile Cards */}
      <div className="space-y-3 md:hidden">
        {exams.map((exam) => (
          <Link key={exam.id} href={`${ROUTES.PRINCIPAL.EXAMS}/${exam.id}`}>
            <Card className="transition-shadow hover:shadow-md">
              <CardContent className="pt-4 pb-4">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-semibold">{exam.title}</h3>
                    <p className="text-muted-foreground text-sm">
                      {exam.subjectName} ({exam.subjectCode})
                    </p>
                  </div>
                  <Badge className={statusColors[exam.status] ?? ''} variant="secondary">
                    {exam.status}
                  </Badge>
                </div>
                <div className="text-muted-foreground mt-2 grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    <span>{exam.totalQuestions} questions</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span>{exam.totalStudents} students</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BarChart3 className="h-3 w-3" />
                    <span>Avg: {exam.avgPercentage}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{exam.duration} min</span>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs">
                  <Badge variant="outline">{typeLabels[exam.type] ?? exam.type}</Badge>
                  <span className="text-muted-foreground">By {exam.createdBy}</span>
                </div>
                {exam.totalStudents > 0 && (
                  <div className="bg-muted mt-2 h-1.5 overflow-hidden rounded-full">
                    <div
                      className="h-full rounded-full bg-green-500 transition-all"
                      style={{ width: `${Math.min(exam.passRate, 100)}%` }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Desktop Table */}
      <Card className="hidden md:block">
        <CardHeader>
          <CardTitle>All Exams</CardTitle>
          <CardDescription>Comprehensive exam list with participation and performance</CardDescription>
        </CardHeader>
        <CardContent>
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
                <TableRow key={exam.id} className="cursor-pointer" onClick={() => router.push(`${ROUTES.PRINCIPAL.EXAMS}/${exam.id}`)}>
                  <TableCell>
                    <div>
                      <p className="max-w-50 truncate font-medium">{exam.title}</p>
                      <p className="text-muted-foreground text-xs">
                        {exam.totalMarks} marks · {exam.duration} min
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{exam.subjectName}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{typeLabels[exam.type] ?? exam.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[exam.status] ?? ''} variant="secondary">
                      {exam.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">{exam.totalQuestions}</TableCell>
                  <TableCell className="text-center">{exam.totalStudents}</TableCell>
                  <TableCell className="text-right">
                    {exam.totalStudents > 0 ? (
                      <span className={exam.avgPercentage >= 50 ? 'text-green-600' : 'text-red-600'}>
                        {exam.avgPercentage}%
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {exam.totalStudents > 0 ? (
                      <span className={exam.passRate >= 50 ? 'text-green-600' : 'text-red-600'}>
                        {exam.passRate}%
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{exam.createdBy}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage <= 1}
            onClick={() => updateFilters({ page: String(currentPage - 1) })}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Previous
          </Button>
          <span className="text-muted-foreground text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= totalPages}
            onClick={() => updateFilters({ page: String(currentPage + 1) })}
          >
            Next
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
