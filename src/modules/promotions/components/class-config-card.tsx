'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { ArrowRight, GraduationCap } from 'lucide-react';
import type { ClassConfig, StudentAction } from './year-transition-types';

type Props = {
  cfg: ClassConfig;
  classIdx: number;
  onStudentAction: (classIdx: number, studentIdx: number, action: StudentAction) => void;
  onStudentSection: (classIdx: number, studentIdx: number, sectionId: string) => void;
  onDefaultSection: (classIdx: number, sectionId: string) => void;
  onSetAll: (classIdx: number, action: StudentAction) => void;
};

export function ClassConfigCard({
  cfg,
  classIdx,
  onStudentAction,
  onStudentSection,
  onDefaultSection,
  onSetAll,
}: Props) {
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
            <CardDescription>
              {cfg.students.length} student{cfg.students.length !== 1 ? 's' : ''}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {!cfg.isHighestGrade && (
              <>
                <Button variant="outline" size="sm" onClick={() => onSetAll(classIdx, 'PROMOTE')}>Promote All</Button>
                <Button variant="outline" size="sm" onClick={() => onSetAll(classIdx, 'HOLD_BACK')}>Hold All</Button>
              </>
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
                <TableHead>Roll #</TableHead>
                <TableHead>Student Name</TableHead>
                <TableHead>Current Section</TableHead>
                <TableHead>Action</TableHead>
                {!cfg.isHighestGrade && cfg.toSections.length > 1 && <TableHead>Target Section</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {cfg.students.map((student, studentIdx) => (
                <TableRow key={student.profileId}>
                  <TableCell className="font-mono text-sm">{student.rollNumber}</TableCell>
                  <TableCell className="font-medium">{student.name}</TableCell>
                  <TableCell><Badge variant="outline">{student.sectionName}</Badge></TableCell>
                  <TableCell>
                    {cfg.isHighestGrade ? (
                      <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                        <GraduationCap className="mr-1 h-3 w-3" />Graduate
                      </Badge>
                    ) : (
                      <Select value={student.action} onValueChange={(v) => onStudentAction(classIdx, studentIdx, v as StudentAction)}>
                        <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PROMOTE">✅ Promote</SelectItem>
                          <SelectItem value="HOLD_BACK">🔁 Hold Back</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </TableCell>
                  {!cfg.isHighestGrade && cfg.toSections.length > 1 && (
                    <TableCell>
                      {student.action === 'PROMOTE' ? (
                        <Select value={student.toSectionId ?? cfg.defaultSectionId ?? ''} onValueChange={(v) => onStudentSection(classIdx, studentIdx, v)}>
                          <SelectTrigger className="w-24"><SelectValue placeholder="Sec" /></SelectTrigger>
                          <SelectContent>
                            {cfg.toSections.map((sec) => (
                              <SelectItem key={sec.id} value={sec.id}>{sec.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
