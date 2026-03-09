'use client';

import { useState } from 'react';
import {
  useClassWiseSummary,
  useSectionWiseSummary,
  useStudentWiseSummary,
} from '@/modules/fees/hooks/use-fee-admin';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/shared';
import { formatCurrency } from './fee-status-badge';
import { ChevronRight, ArrowLeft } from 'lucide-react';

type DrillLevel = 'class' | 'section' | 'student';

export function ClassWiseReport() {
  const [level, setLevel] = useState<DrillLevel>('class');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedClassName, setSelectedClassName] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState('');

  const { data: classSummary, isLoading: classLoading } = useClassWiseSummary(level === 'class');
  const { data: sectionSummary, isLoading: sectionLoading } = useSectionWiseSummary(
    selectedClassId, level === 'section',
  );
  const { data: studentSummary, isLoading: studentLoading } = useStudentWiseSummary(
    selectedClassId, selectedSectionId || undefined, level === 'student',
  );

  function drillToSections(classId: string, className: string) {
    setSelectedClassId(classId);
    setSelectedClassName(className);
    setLevel('section');
  }

  function drillToStudents(sectionId?: string) {
    setSelectedSectionId(sectionId ?? '');
    setLevel('student');
  }

  function goBack() {
    if (level === 'student') {
      setSelectedSectionId('');
      setLevel('section');
    } else if (level === 'section') {
      setSelectedClassId('');
      setSelectedClassName('');
      setLevel('class');
    }
  }

  function getCollectionBadge(pct: number) {
    if (pct >= 90) return <Badge variant="default">{pct}%</Badge>;
    if (pct >= 60) return <Badge variant="secondary">{pct}%</Badge>;
    return <Badge variant="destructive">{pct}%</Badge>;
  }

  if (level === 'class') {
    if (classLoading) return <Spinner />;
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Class-wise Fee Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Class</TableHead>
                  <TableHead className="text-right">Students</TableHead>
                  <TableHead className="text-right">Total Due</TableHead>
                  <TableHead className="text-right">Collected</TableHead>
                  <TableHead className="text-right">Outstanding</TableHead>
                  <TableHead>Collection %</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {(classSummary ?? []).map((c) => (
                  <TableRow key={c.classId} className="cursor-pointer" onClick={() => drillToSections(c.classId, c.className)}>
                    <TableCell className="font-medium">{c.className}</TableCell>
                    <TableCell className="text-right">{c.studentCount}</TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency(c.totalDue)}</TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency(c.totalCollected)}</TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency(c.totalOutstanding)}</TableCell>
                    <TableCell>{getCollectionBadge(c.collectionPercentage)}</TableCell>
                    <TableCell><ChevronRight className="h-4 w-4 text-muted-foreground" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (level === 'section') {
    if (sectionLoading) return <Spinner />;
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={goBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-base">{selectedClassName} — Section Summary</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Section</TableHead>
                  <TableHead className="text-right">Students</TableHead>
                  <TableHead className="text-right">Total Due</TableHead>
                  <TableHead className="text-right">Collected</TableHead>
                  <TableHead className="text-right">Outstanding</TableHead>
                  <TableHead>Collection %</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {(sectionSummary ?? []).map((s) => (
                  <TableRow key={s.sectionId} className="cursor-pointer" onClick={() => drillToStudents(s.sectionId)}>
                    <TableCell className="font-medium">{s.sectionName}</TableCell>
                    <TableCell className="text-right">{s.studentCount}</TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency(s.totalDue)}</TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency(s.totalCollected)}</TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency(s.totalOutstanding)}</TableCell>
                    <TableCell>{getCollectionBadge(s.collectionPercentage)}</TableCell>
                    <TableCell><ChevronRight className="h-4 w-4 text-muted-foreground" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <Button variant="link" onClick={() => drillToStudents()} className="mt-2">
            View all students in {selectedClassName}
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Student level
  if (studentLoading) return <Spinner />;
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={goBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <CardTitle className="text-base">{selectedClassName} — Student Summary</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Roll #</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Section</TableHead>
                <TableHead className="text-right">Total Due</TableHead>
                <TableHead className="text-right">Paid</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(studentSummary ?? []).map((s) => (
                <TableRow key={s.studentProfileId}>
                  <TableCell className="font-mono">{s.rollNumber}</TableCell>
                  <TableCell className="font-medium">{s.studentName}</TableCell>
                  <TableCell>{s.sectionName}</TableCell>
                  <TableCell className="text-right font-mono">{formatCurrency(s.totalDue)}</TableCell>
                  <TableCell className="text-right font-mono">{formatCurrency(s.totalPaid)}</TableCell>
                  <TableCell className="text-right font-mono">{formatCurrency(s.balance)}</TableCell>
                  <TableCell>
                    <Badge variant={s.status === 'PAID' ? 'default' : s.status === 'PARTIAL' ? 'secondary' : 'destructive'}>
                      {s.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
