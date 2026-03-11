'use client';

import { useState, useEffect, useCallback } from 'react';
import { useReferenceStore } from '@/stores/reference-store';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Spinner, EmptyState } from '@/components/shared';
import { EnrollmentGroupCard } from './enrollment-group-card';
import { fetchElectiveGroupsAction } from '@/modules/subjects/enrollment-actions';
import { AlertTriangle, CheckCircle2, Zap } from 'lucide-react';

type ElectiveGroup = {
  groupName: string;
  subjects: { id: string; name: string; code: string; enrolledCount: number }[];
};

const STEPS = [
  { num: 1, label: 'Select Class' },
  { num: 2, label: 'Select Section' },
  { num: 3, label: 'Assign Students' },
] as const;

export function EnrollmentView() {
  const { classes, academicSessions } = useReferenceStore();
  const currentSession = academicSessions.find((s) => s.isCurrent);

  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [groups, setGroups] = useState<ElectiveGroup[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const selectedClass = classes.find((c) => c.id === selectedClassId);
  const sections = selectedClass?.sections ?? [];
  const currentStep = !selectedClassId ? 1 : !selectedSectionId ? 2 : 3;

  const loadGroups = useCallback(async () => {
    if (!selectedClassId || !currentSession) return;
    setIsLoading(true);
    try {
      const data = await fetchElectiveGroupsAction(selectedClassId, currentSession.id);
      setGroups(data);
    } finally {
      setIsLoading(false);
    }
  }, [selectedClassId, currentSession]);

  useEffect(() => {
    setGroups([]);
    if (selectedClassId && currentSession) loadGroups();
  }, [selectedClassId, currentSession, loadGroups]);

  useEffect(() => { setSelectedSectionId(''); }, [selectedClassId]);

  // Auto-select section if only one
  const singleSectionId = sections.length === 1 ? (sections.at(0)?.id ?? '') : '';
  useEffect(() => {
    if (singleSectionId) setSelectedSectionId(singleSectionId);
  }, [singleSectionId]);

  if (!currentSession) {
    return (
      <Card><CardContent className="py-8">
        <EmptyState
          icon={<AlertTriangle className="h-10 w-10 text-yellow-500" />}
          title="No Active Session"
          description="Set an active academic session in Settings first."
        />
      </CardContent></Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Step Indicator ── */}
      <div className="flex items-center gap-1 sm:gap-2">
        {STEPS.map((step, i) => (
          <div key={step.num} className="flex items-center gap-1 sm:gap-2">
            {i > 0 && <div className={`h-px w-4 sm:w-8 ${currentStep > step.num ? 'bg-primary' : 'bg-border'}`} />}
            <div className="flex items-center gap-1.5">
              <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                currentStep > step.num
                  ? 'bg-primary text-primary-foreground'
                  : currentStep === step.num
                    ? 'bg-primary/10 text-primary border border-primary'
                    : 'bg-muted text-muted-foreground'
              }`}>
                {currentStep > step.num ? <CheckCircle2 className="h-3.5 w-3.5" /> : step.num}
              </div>
              <span className={`text-xs sm:text-sm ${currentStep >= step.num ? 'font-medium' : 'text-muted-foreground'}`}>
                {step.label}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Selectors ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">
            Class <span className="text-muted-foreground font-normal">— which class?</span>
          </label>
          <Select value={selectedClassId} onValueChange={setSelectedClassId}>
            <SelectTrigger className={!selectedClassId ? 'border-primary ring-1 ring-primary/20' : ''}>
              <SelectValue placeholder="Pick a class..." />
            </SelectTrigger>
            <SelectContent>
              {classes.map((cls) => (
                <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">
            Section <span className="text-muted-foreground font-normal">— which section?</span>
          </label>
          <Select value={selectedSectionId} onValueChange={setSelectedSectionId} disabled={!selectedClassId}>
            <SelectTrigger className={selectedClassId && !selectedSectionId ? 'border-primary ring-1 ring-primary/20' : ''}>
              <SelectValue placeholder={!selectedClassId ? 'Select class first' : 'Pick a section...'} />
            </SelectTrigger>
            <SelectContent>
              {sections.map((sec) => (
                <SelectItem key={sec.id} value={sec.id}>{sec.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ── Content ── */}
      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : !selectedClassId ? (
        <Card className="border-dashed">
          <CardContent className="py-10 text-center space-y-2">
            <Zap className="h-10 w-10 mx-auto text-amber-500/50" />
            <p className="text-sm font-medium">Step 1: Select a class</p>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Choose the class that has elective subjects. The elective groups will appear here.
            </p>
          </CardContent>
        </Card>
      ) : groups.length === 0 ? (
        <Card className="border-dashed border-yellow-500/30">
          <CardContent className="py-10 text-center space-y-2">
            <AlertTriangle className="h-10 w-10 mx-auto text-yellow-500/50" />
            <p className="text-sm font-medium">No elective groups found</p>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              This class has no elective subjects. Go to{' '}
              <a href="/admin/subjects" className="text-primary underline">Subjects</a>,
              {' '}click + on a subject, and turn on &quot;Elective Subject&quot; toggle.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1">
                <Zap className="h-3 w-3 text-amber-500" />
                {groups.length} group{groups.length !== 1 ? 's' : ''}
              </Badge>
              <span className="text-xs text-muted-foreground">{selectedClass?.name}</span>
            </div>
            <Button variant="outline" size="sm" onClick={loadGroups} disabled={isLoading}>Refresh</Button>
          </div>

          {!selectedSectionId && (
            <Card className="border-dashed border-primary/30 bg-primary/5">
              <CardContent className="py-3">
                <p className="text-sm text-center">
                  👆 <strong>Select a section</strong> above to assign students
                </p>
              </CardContent>
            </Card>
          )}

          {groups.map((group) => (
            <EnrollmentGroupCard
              key={group.groupName}
              group={group}
              classId={selectedClassId}
              sectionId={selectedSectionId}
              sessionId={currentSession.id}
              onRefresh={loadGroups}
            />
          ))}
        </div>
      )}
    </div>
  );
}
