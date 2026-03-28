'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
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
import { AlertTriangle, ArrowRight, GraduationCap } from 'lucide-react';
import type { ClassConfig, StudentAction } from './year-transition-types';

type Props = {
  cfg: ClassConfig;
  allClasses: Array<{
    id: string;
    name: string;
    grade: number;
    sections: Array<{ id: string; name: string }>;
  }>;
  classIdx: number;
  onStudentSelected: (classIdx: number, studentIdx: number, selected: boolean) => void;
  onSelectAllStudents: (classIdx: number, selected: boolean) => void;
  onSelectOnlyClass: (classIdx: number) => void;
  onStudentAction: (classIdx: number, studentIdx: number, action: StudentAction) => void;
  onStudentTargetClass: (classIdx: number, studentIdx: number, toClassId: string) => void;
  onStudentSection: (classIdx: number, studentIdx: number, sectionId: string) => void;
  onDefaultSection: (classIdx: number, sectionId: string) => void;
  onSetAll: (classIdx: number, action: StudentAction) => void;
};

export function ClassConfigCard({
  cfg,
  allClasses,
  classIdx,
  onStudentSelected,
  onSelectAllStudents,
  onSelectOnlyClass,
  onStudentAction,
  onStudentTargetClass,
  onStudentSection,
  onDefaultSection,
  onSetAll,
}: Props) {
  const selectedCount = cfg.students.filter((student) => student.selected).length;
  const studentsWithMissingPromotionTarget = cfg.students.filter(
    (student) =>
      student.selected &&
      student.action === 'PROMOTE' &&
      (!student.toClassId || !student.toSectionId),
  ).length;
  const actionBreakdown = {
    promote: cfg.students.filter((student) => student.selected && student.action === 'PROMOTE').length,
    holdBack: cfg.students.filter((student) => student.selected && student.action === 'HOLD_BACK').length,
    graduate: cfg.students.filter((student) => student.selected && student.action === 'GRADUATE').length,
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              {cfg.fromClassName}
              {cfg.isHighestGrade ? (
                <Badge variant="secondary" className="ml-2">
                  <GraduationCap className="mr-1 h-3 w-3" />
                  Graduating Class
                </Badge>
              ) : (
                <>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <span className="text-primary">{cfg.toClassName}</span>
                </>
              )}
            </CardTitle>
            <CardDescription>{selectedCount}/{cfg.students.length} selected for processing</CardDescription>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              <Badge variant="outline">Promote: {actionBreakdown.promote}</Badge>
              <Badge variant="outline">Hold back: {actionBreakdown.holdBack}</Badge>
              <Badge variant="outline">Graduate: {actionBreakdown.graduate}</Badge>
              {studentsWithMissingPromotionTarget > 0 ? (
                <Badge variant="destructive" className="gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Needs target mapping: {studentsWithMissingPromotionTarget}
                </Badge>
              ) : null}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => onSelectOnlyClass(classIdx)}>Focus This Class</Button>
            <Button variant="outline" size="sm" onClick={() => onSelectAllStudents(classIdx, true)}>Select All</Button>
            <Button variant="outline" size="sm" onClick={() => onSelectAllStudents(classIdx, false)}>Clear All</Button>
            <Button variant="outline" size="sm" onClick={() => onSetAll(classIdx, 'PROMOTE')}>Promote All</Button>
            <Button variant="outline" size="sm" onClick={() => onSetAll(classIdx, 'HOLD_BACK')}>Hold All</Button>
            {cfg.isHighestGrade && (
              <Button variant="outline" size="sm" onClick={() => onSetAll(classIdx, 'GRADUATE')}>Graduate All</Button>
            )}
          </div>
        </div>

        {!cfg.isHighestGrade && cfg.toSections.length > 0 && (
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <span className="text-sm text-muted-foreground">Default section in {cfg.toClassName}:</span>
            <Select value={cfg.defaultSectionId ?? ''} onValueChange={(v) => onDefaultSection(classIdx, v)}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="Section" />
              </SelectTrigger>
              <SelectContent>
                {cfg.toSections.map((sec) => (
                  <SelectItem key={sec.id} value={sec.id}>{sec.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-14">#</TableHead>
                <TableHead className="w-16">Use</TableHead>
                <TableHead>Roll #</TableHead>
                <TableHead>Student Name</TableHead>
                <TableHead>Current Section</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Target Class</TableHead>
                <TableHead>Target Section</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cfg.students.map((student, studentIdx) => (
                <TableRow key={student.profileId} className={!student.selected ? 'opacity-70' : ''}>
                  <TableCell className="text-xs text-muted-foreground">{studentIdx + 1}</TableCell>
                  <TableCell>
                    <Checkbox
                      checked={student.selected}
                      onCheckedChange={(value) => onStudentSelected(classIdx, studentIdx, value === true)}
                    />
                  </TableCell>
                  <TableCell className="font-mono text-sm">{student.rollNumber}</TableCell>
                  <TableCell className="font-medium">{student.name}</TableCell>
                  <TableCell><Badge variant="outline">{student.sectionName}</Badge></TableCell>
                  <TableCell>
                    <Select
                      value={student.action}
                      onValueChange={(v) => onStudentAction(classIdx, studentIdx, v as StudentAction)}
                      disabled={!student.selected}
                    >
                      <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PROMOTE">Promote</SelectItem>
                        <SelectItem value="HOLD_BACK">Hold Back</SelectItem>
                        <SelectItem value="GRADUATE">Graduate</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    {student.action === 'PROMOTE' && student.selected ? (
                      <div className="space-y-1">
                        <Select
                          value={student.toClassId ?? ''}
                          onValueChange={(value) => onStudentTargetClass(classIdx, studentIdx, value)}
                        >
                          <SelectTrigger className="w-48"><SelectValue placeholder="Select class" /></SelectTrigger>
                          <SelectContent>
                            {allClasses.map((targetClass) => (
                              <SelectItem key={targetClass.id} value={targetClass.id}>
                                {targetClass.name} (Grade {targetClass.grade})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {!student.toClassId ? (
                          <p className="text-xs text-destructive">Required to process promotion</p>
                        ) : null}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {student.action === 'PROMOTE' && student.selected ? (
                      <div className="space-y-1">
                        <Select
                          value={student.toSectionId ?? ''}
                          onValueChange={(value) => onStudentSection(classIdx, studentIdx, value)}
                        >
                          <SelectTrigger className="w-32"><SelectValue placeholder="Section" /></SelectTrigger>
                          <SelectContent>
                            {(allClasses.find((targetClass) => targetClass.id === student.toClassId)?.sections ?? []).map((section) => (
                              <SelectItem key={section.id} value={section.id}>{section.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {!student.toSectionId ? (
                          <p className="text-xs text-destructive">Required</p>
                        ) : null}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
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
