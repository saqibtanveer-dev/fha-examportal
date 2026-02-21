'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
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
import { Search, ChevronLeft, ChevronRight, Eye } from 'lucide-react';

type Student = {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  rollNumber: string;
  registrationNo: string;
  className: string;
  classId: string;
  sectionName: string;
  status: string;
  gender: string | null;
  isActive: boolean;
  lastLoginAt: string | null;
  examsTaken: number;
  avgPercentage: number;
};

type ClassOption = { id: string; name: string; grade: number };

type Props = {
  students: Student[];
  total: number;
  currentPage: number;
  search: string;
  classId: string;
  status: string;
  classes: ClassOption[];
};

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'PROMOTED', label: 'Promoted' },
  { value: 'GRADUATED', label: 'Graduated' },
  { value: 'HELD_BACK', label: 'Held Back' },
  { value: 'WITHDRAWN', label: 'Withdrawn' },
];

export function StudentsListClient({
  students,
  total,
  currentPage,
  search,
  classId,
  status,
  classes,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(search);
  const pageSize = 20;
  const totalPages = Math.ceil(total / pageSize);

  function updateFilters(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    params.set('page', '1');
    router.push(`/principal/students?${params.toString()}`);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    updateFilters({ search: searchValue });
  }

  function goToPage(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(page));
    router.push(`/principal/students?${params.toString()}`);
  }

  function getPerformanceColor(avg: number) {
    if (avg >= 80) return 'text-green-600';
    if (avg >= 60) return 'text-blue-600';
    if (avg >= 40) return 'text-amber-600';
    return 'text-red-600';
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search students..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button type="submit" size="sm">
            Search
          </Button>
        </form>
        <div className="flex gap-2">
          <Select
            value={classId}
            onValueChange={(v) => updateFilters({ classId: v === 'all' ? '' : v })}
          >
            <SelectTrigger className="w-35">
              <SelectValue placeholder="All Classes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {classes.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={status}
            onValueChange={(v) => updateFilters({ status: v === 'all' ? '' : v })}
          >
            <SelectTrigger className="w-32.5">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((s) => (
                <SelectItem key={s.value || 'all'} value={s.value || 'all'}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="space-y-3 md:hidden">
        {students.map((student) => (
          <Link key={student.userId} href={`/principal/students/${student.userId}`}>
            <Card className="transition-shadow hover:shadow-md">
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">
                      {student.firstName} {student.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Roll: {student.rollNumber} &bull; {student.className} - {student.sectionName}
                    </p>
                  </div>
                  <Badge variant={student.isActive ? 'default' : 'secondary'} className="shrink-0">
                    {student.status}
                  </Badge>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="rounded-md bg-muted px-2 py-1 text-center">
                    <p className="text-sm font-semibold">{student.examsTaken}</p>
                    <p className="text-[10px] text-muted-foreground">Exams Taken</p>
                  </div>
                  <div className="rounded-md bg-muted px-2 py-1 text-center">
                    <p className={`text-sm font-semibold ${getPerformanceColor(student.avgPercentage)}`}>
                      {student.avgPercentage}%
                    </p>
                    <p className="text-[10px] text-muted-foreground">Avg Score</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
        {students.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No students found
            </CardContent>
          </Card>
        )}
      </div>

      {/* Desktop Table View */}
      <Card className="hidden overflow-hidden md:block">
        <CardContent className="overflow-x-auto p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Roll No.</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Section</TableHead>
                <TableHead className="text-center">Exams</TableHead>
                <TableHead className="text-center">Avg Score</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.userId}>
                  <TableCell>
                    <div>
                      <p className="font-medium">
                        {student.firstName} {student.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">{student.email}</p>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{student.rollNumber}</TableCell>
                  <TableCell>{student.className}</TableCell>
                  <TableCell>{student.sectionName}</TableCell>
                  <TableCell className="text-center">{student.examsTaken}</TableCell>
                  <TableCell className="text-center">
                    <span className={`font-semibold ${getPerformanceColor(student.avgPercentage)}`}>
                      {student.avgPercentage}%
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={student.status === 'ACTIVE' ? 'default' : 'secondary'}>
                      {student.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/principal/students/${student.userId}`}>
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
              {students.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                    No students found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * pageSize + 1}–
            {Math.min(currentPage * pageSize, total)} of {total}
          </p>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage <= 1}
              onClick={() => goToPage(currentPage - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage >= totalPages}
              onClick={() => goToPage(currentPage + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
