'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Spinner } from '@/components/shared';
import { StudentEnrollmentTable } from './student-enrollment-table';
import { EnrolledStudentsTable } from './enrolled-students-table';
import {
  fetchUnassignedStudentsAction,
  fetchEnrolledStudentsForGroupAction,
} from '@/modules/subjects/enrollment-actions';
import { ChevronDown, ChevronUp, Users, UserPlus, Zap } from 'lucide-react';

type SubjectInfo = { id: string; name: string; code: string; enrolledCount: number };
type ElectiveGroup = { groupName: string; subjects: SubjectInfo[] };

type Props = {
  group: ElectiveGroup;
  classId: string;
  sectionId: string;
  sessionId: string;
  onRefresh: () => void;
};

export function EnrollmentGroupCard({ group, classId, sectionId, sessionId, onRefresh }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'enrolled' | 'unassigned'>('enrolled');
  const [unassigned, setUnassigned] = useState<
    { id: string; rollNumber: string | null; user: { firstName: string; lastName: string } }[]
  >([]);
  const [enrolled, setEnrolled] = useState<
    { studentId: string; rollNumber: string | null; firstName: string; lastName: string; subjectId: string; subjectName: string }[]
  >([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const totalEnrolled = group.subjects.reduce((sum, s) => sum + s.enrolledCount, 0);

  // Auto-expand and load when section changes
  useEffect(() => {
    if (sectionId) {
      setExpanded(true);
      loadStudents();
    } else {
      setExpanded(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionId]);

  async function loadStudents() {
    if (!sectionId) return;
    setIsLoadingData(true);
    try {
      const [unassignedData, enrolledData] = await Promise.all([
        fetchUnassignedStudentsAction(classId, sectionId, group.groupName, sessionId),
        fetchEnrolledStudentsForGroupAction(classId, sectionId, group.groupName, sessionId),
      ]);
      setUnassigned(unassignedData);
      setEnrolled(enrolledData);
    } finally {
      setIsLoadingData(false);
    }
  }

  async function handleToggle() {
    if (expanded) { setExpanded(false); return; }
    setExpanded(true);
    if (sectionId) await loadStudents();
  }

  async function handleRefresh() {
    onRefresh();
    if (sectionId) await loadStudents();
  }

  return (
    <Card>
      <CardHeader className="pb-3 cursor-pointer" onClick={handleToggle}>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-500" />
            {group.groupName}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs gap-1">
              <Users className="h-3 w-3" />
              {totalEnrolled} enrolled
            </Badge>
            {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Subject breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {group.subjects.map((subj) => (
            <div key={subj.id} className="rounded-md border p-2.5 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium truncate">{subj.name}</span>
                <Badge variant="secondary" className="text-xs shrink-0">{subj.code}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Progress value={totalEnrolled > 0 ? (subj.enrolledCount / totalEnrolled) * 100 : 0} className="h-1.5 flex-1" />
                <span className="text-xs text-muted-foreground tabular-nums">{subj.enrolledCount}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Expanded — student management */}
        {expanded && (
          <div className="border-t pt-3 space-y-3">
            {!sectionId ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                👆 Select a section above to see and assign students.
              </p>
            ) : isLoadingData ? (
              <div className="flex justify-center py-4"><Spinner size="md" /></div>
            ) : (
              <>
                {/* Tabs: Enrolled / Unassigned */}
                <div className="flex gap-1 rounded-lg bg-muted p-1">
                  <button
                    type="button"
                    className={`flex-1 flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                      activeTab === 'enrolled'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                    onClick={() => setActiveTab('enrolled')}
                  >
                    <Users className="h-3 w-3" />
                    Enrolled ({enrolled.length})
                  </button>
                  <button
                    type="button"
                    className={`flex-1 flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                      activeTab === 'unassigned'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                    onClick={() => setActiveTab('unassigned')}
                  >
                    <UserPlus className="h-3 w-3" />
                    Unassigned ({unassigned.length})
                  </button>
                </div>

                {activeTab === 'enrolled' ? (
                  <EnrolledStudentsTable
                    subjects={group.subjects}
                    enrolledStudents={enrolled}
                    classId={classId}
                    sessionId={sessionId}
                    onRefresh={handleRefresh}
                  />
                ) : (
                  <StudentEnrollmentTable
                    subjects={group.subjects}
                    unassignedStudents={unassigned}
                    classId={classId}
                    sessionId={sessionId}
                    onRefresh={handleRefresh}
                  />
                )}
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
