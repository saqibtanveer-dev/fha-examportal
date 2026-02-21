'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, ChevronLeft, ChevronRight, Eye } from 'lucide-react';

type Teacher = {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  employeeId: string;
  qualification: string | null;
  specialization: string | null;
  joiningDate: string;
  isActive: boolean;
  lastLoginAt: string | null;
  subjectCount: number;
  examCount: number;
  questionCount: number;
};

type Props = {
  teachers: Teacher[];
  total: number;
  currentPage: number;
  search: string;
};

export function TeachersListClient({ teachers, total, currentPage, search }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(search);
  const pageSize = 20;
  const totalPages = Math.ceil(total / pageSize);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchValue) params.set('search', searchValue);
    else params.delete('search');
    params.set('page', '1');
    router.push(`/principal/teachers?${params.toString()}`);
  }

  function goToPage(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(page));
    router.push(`/principal/teachers?${params.toString()}`);
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search teachers..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button type="submit" size="sm">
          Search
        </Button>
      </form>

      {/* Summary Cards - Mobile */}
      <div className="grid grid-cols-3 gap-3 md:hidden">
        <Card>
          <CardContent className="py-3 text-center">
            <p className="text-2xl font-bold">{total}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-3 text-center">
            <p className="text-2xl font-bold">
              {teachers.filter((t) => t.isActive).length}
            </p>
            <p className="text-xs text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-3 text-center">
            <p className="text-2xl font-bold">
              {teachers.reduce((s, t) => s + t.examCount, 0)}
            </p>
            <p className="text-xs text-muted-foreground">Exams</p>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Card View */}
      <div className="space-y-3 md:hidden">
        {teachers.map((teacher) => (
          <Link key={teacher.userId} href={`/principal/teachers/${teacher.userId}`}>
            <Card className="transition-shadow hover:shadow-md">
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">
                      {teacher.firstName} {teacher.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">{teacher.email}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      ID: {teacher.employeeId}
                    </p>
                  </div>
                  <Badge variant={teacher.isActive ? 'default' : 'secondary'}>
                    {teacher.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-md bg-muted px-2 py-1">
                    <p className="text-sm font-semibold">{teacher.subjectCount}</p>
                    <p className="text-[10px] text-muted-foreground">Subjects</p>
                  </div>
                  <div className="rounded-md bg-muted px-2 py-1">
                    <p className="text-sm font-semibold">{teacher.examCount}</p>
                    <p className="text-[10px] text-muted-foreground">Exams</p>
                  </div>
                  <div className="rounded-md bg-muted px-2 py-1">
                    <p className="text-sm font-semibold">{teacher.questionCount}</p>
                    <p className="text-[10px] text-muted-foreground">Questions</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Desktop Table View */}
      <Card className="hidden overflow-hidden md:block">
        <CardContent className="overflow-x-auto p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Teacher</TableHead>
                <TableHead>Employee ID</TableHead>
                <TableHead>Specialization</TableHead>
                <TableHead className="text-center">Subjects</TableHead>
                <TableHead className="text-center">Exams</TableHead>
                <TableHead className="text-center">Questions</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teachers.map((teacher) => (
                <TableRow key={teacher.userId}>
                  <TableCell>
                    <div>
                      <p className="font-medium">
                        {teacher.firstName} {teacher.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">{teacher.email}</p>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{teacher.employeeId}</TableCell>
                  <TableCell>
                    {teacher.specialization ?? (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">{teacher.subjectCount}</TableCell>
                  <TableCell className="text-center">{teacher.examCount}</TableCell>
                  <TableCell className="text-center">{teacher.questionCount}</TableCell>
                  <TableCell>
                    <Badge variant={teacher.isActive ? 'default' : 'secondary'}>
                      {teacher.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/principal/teachers/${teacher.userId}`}>
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
              {teachers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                    No teachers found
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
