'use client';

// ============================================
// Manage Family Links Dialog — Link/Unlink Students
// ============================================

import { useState, useTransition, useCallback } from 'react';
import { useInvalidateCache } from '@/lib/cache-utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Spinner } from '@/components/shared';
import { X, Search, Plus, UserCheck } from 'lucide-react';
import { linkStudentToFamilyAction, unlinkStudentFromFamilyAction } from '@/modules/family/family-admin-actions';
import { searchStudentsForLinkingAction } from '@/modules/family/family-search-actions';
import type { SearchableStudent } from '@/modules/family/family-search-actions';
import { toast } from 'sonner';

type LinkedStudent = {
  linkId: string;
  studentProfileId: string;
  studentName: string;
  className: string;
  sectionName: string;
  relationship: string;
  isPrimary: boolean;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  familyProfileId: string;
  familyUserName: string;
  linkedStudents: LinkedStudent[];
};

export function ManageFamilyLinksDialog({
  open,
  onOpenChange,
  familyProfileId,
  familyUserName,
  linkedStudents: initialLinked,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [linkedStudents, setLinkedStudents] = useState(initialLinked);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchableStudent[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [relationship, setRelationship] = useState('');
  const invalidate = useInvalidateCache();

  const alreadyLinkedIds = new Set(linkedStudents.map((s) => s.studentProfileId));

  const handleSearch = useCallback(async () => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    const result = await searchStudentsForLinkingAction(searchQuery);
    if (result.success && result.data) {
      setSearchResults(result.data.filter((s) => !alreadyLinkedIds.has(s.studentProfileId)));
    }
    setIsSearching(false);
  }, [searchQuery, alreadyLinkedIds]);

  function handleLink(student: SearchableStudent) {
    if (!relationship.trim()) {
      toast.error('Please enter the relationship (e.g. Father, Mother)');
      return;
    }
    startTransition(async () => {
      const result = await linkStudentToFamilyAction({
        familyProfileId,
        studentProfileId: student.studentProfileId,
        relationship: relationship.trim(),
        isPrimary: linkedStudents.length === 0,
      });
      if (result.success) {
        toast.success(`Linked ${student.studentName}`);
        setLinkedStudents((prev) => [
          ...prev,
          {
            linkId: result.data!.id,
            studentProfileId: student.studentProfileId,
            studentName: student.studentName,
            className: student.className,
            sectionName: student.sectionName,
            relationship: relationship.trim(),
            isPrimary: prev.length === 0,
          },
        ]);
        setSearchResults((prev) => prev.filter((s) => s.studentProfileId !== student.studentProfileId));
        await invalidate.users();
      } else {
        toast.error(result.error ?? 'Failed to link student');
      }
    });
  }

  function handleUnlink(student: LinkedStudent) {
    startTransition(async () => {
      const result = await unlinkStudentFromFamilyAction({
        familyProfileId,
        studentProfileId: student.studentProfileId,
      });
      if (result.success) {
        toast.success(`Unlinked ${student.studentName}`);
        setLinkedStudents((prev) => prev.filter((s) => s.studentProfileId !== student.studentProfileId));
        await invalidate.users();
      } else {
        toast.error(result.error ?? 'Failed to unlink');
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Children — {familyUserName}</DialogTitle>
          <DialogDescription>
            Link or unlink students to this family account.
          </DialogDescription>
        </DialogHeader>

        {/* Currently Linked */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Linked Children ({linkedStudents.length})</Label>
          {linkedStudents.length === 0 ? (
            <p className="text-sm text-muted-foreground">No children linked yet.</p>
          ) : (
            <div className="space-y-2">
              {linkedStudents.map((student) => (
                <div key={student.studentProfileId} className="flex items-center justify-between rounded-md border p-2">
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-sm font-medium">{student.studentName}</p>
                      <p className="text-xs text-muted-foreground">
                        {student.className} - {student.sectionName} &bull; {student.relationship}
                      </p>
                    </div>
                    {student.isPrimary && <Badge variant="secondary" className="text-xs">Primary</Badge>}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    disabled={isPending}
                    onClick={() => handleUnlink(student)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Link New Student */}
        <div className="space-y-3 border-t pt-4">
          <Label className="text-sm font-semibold">Link New Student</Label>

          <div className="space-y-2">
            <Label htmlFor="relationship" className="text-xs">
              Relationship <span className="text-destructive">*</span>
            </Label>
            <Input
              id="relationship"
              placeholder="e.g. Father, Mother, Guardian"
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
              disabled={isPending}
            />
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Search student by name, roll#, reg#..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              disabled={isPending}
            />
            <Button size="icon" variant="outline" onClick={handleSearch} disabled={isPending || isSearching}>
              {isSearching ? <Spinner size="sm" /> : <Search className="h-4 w-4" />}
            </Button>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="max-h-48 space-y-1 overflow-y-auto rounded-md border p-2">
              {searchResults.map((student) => (
                <div key={student.studentProfileId} className="flex items-center justify-between rounded p-2 hover:bg-muted">
                  <div>
                    <p className="text-sm font-medium">{student.studentName}</p>
                    <p className="text-xs text-muted-foreground">
                      {student.className} - {student.sectionName} &bull;
                      Roll: {student.rollNumber} &bull; Reg: {student.registrationNo}
                    </p>
                  </div>
                  <Button size="sm" variant="outline" disabled={isPending} onClick={() => handleLink(student)}>
                    <Plus className="mr-1 h-3 w-3" /> Link
                  </Button>
                </div>
              ))}
            </div>
          )}

          {searchQuery.trim().length >= 2 && searchResults.length === 0 && !isSearching && (
            <p className="text-sm text-muted-foreground text-center py-2">
              No students found matching &quot;{searchQuery}&quot;
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
