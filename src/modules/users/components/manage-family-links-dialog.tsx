'use client';

// ============================================
// Manage Family Links Dialog — Link/Unlink Students
// ============================================

import { useState, useTransition, useCallback, useEffect, useRef } from 'react';
import { useInvalidateCache } from '@/lib/cache-utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Spinner, ConfirmDialog } from '@/components/shared';
import { X, Search, Plus, UserCheck, Loader2 } from 'lucide-react';
import { linkStudentToFamilyAction, unlinkStudentFromFamilyAction } from '@/modules/family/family-admin-actions';
import { searchStudentsForLinkingAction } from '@/modules/family/family-search-actions';
import type { SearchableStudent } from '@/modules/family/family-search-actions';
import { FAMILY_RELATIONSHIPS } from '@/modules/family/family.constants';
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
  const [linkingId, setLinkingId] = useState<string | null>(null);
  const [unlinkConfirm, setUnlinkConfirm] = useState<LinkedStudent | null>(null);
  const [unlinkingId, setUnlinkingId] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const invalidate = useInvalidateCache();

  const alreadyLinkedIds = new Set(linkedStudents.map((s) => s.studentProfileId));

  const doSearch = useCallback(async (query: string) => {
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    const result = await searchStudentsForLinkingAction(query);
    if (result.success && result.data) {
      setSearchResults(result.data.filter((s) => !alreadyLinkedIds.has(s.studentProfileId)));
    }
    setIsSearching(false);
  }, [alreadyLinkedIds]);

  // Debounced auto-search on typing
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (searchQuery.trim().length >= 2) {
      debounceRef.current = setTimeout(() => doSearch(searchQuery), 400);
    } else {
      setSearchResults([]);
    }
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchQuery, doSearch]);

  function handleLink(student: SearchableStudent) {
    if (!relationship) {
      toast.error('Please select the relationship first');
      return;
    }
    setLinkingId(student.studentProfileId);
    startTransition(async () => {
      const result = await linkStudentToFamilyAction({
        familyProfileId,
        studentProfileId: student.studentProfileId,
        relationship,
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
            relationship,
            isPrimary: prev.length === 0,
          },
        ]);
        setSearchResults((prev) => prev.filter((s) => s.studentProfileId !== student.studentProfileId));
        await invalidate.users();
      } else {
        toast.error(result.error ?? 'Failed to link student');
      }
      setLinkingId(null);
    });
  }

  function handleUnlink(student: LinkedStudent) {
    setUnlinkingId(student.studentProfileId);
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
      setUnlinkingId(null);
      setUnlinkConfirm(null);
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
              {linkedStudents.map((student) => {
                const isThisUnlinking = unlinkingId === student.studentProfileId;
                return (
                  <div key={student.studentProfileId} className={`flex items-center justify-between rounded-md border p-2 ${isThisUnlinking ? 'opacity-50' : ''}`}>
                    <div className="flex items-center gap-2 min-w-0">
                      <UserCheck className="h-4 w-4 text-green-600 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{student.studentName}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {student.className} - {student.sectionName} &bull; {student.relationship}
                        </p>
                      </div>
                      {student.isPrimary && <Badge variant="secondary" className="text-xs shrink-0">Primary</Badge>}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive shrink-0"
                      disabled={isPending}
                      onClick={() => setUnlinkConfirm(student)}
                    >
                      {isThisUnlinking ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                    </Button>
                  </div>
                );
              })}
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
            <Select value={relationship} onValueChange={setRelationship} disabled={isPending}>
              <SelectTrigger id="relationship">
                <SelectValue placeholder="Select relationship" />
              </SelectTrigger>
              <SelectContent>
                {FAMILY_RELATIONSHIPS.map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search student by name, roll#, reg#..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && doSearch(searchQuery)}
              disabled={isPending}
              className="pl-9"
            />
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
            )}
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
                  <Button size="sm" variant="outline" disabled={isPending || linkingId === student.studentProfileId} onClick={() => handleLink(student)} className="shrink-0">
                    {linkingId === student.studentProfileId ? (
                      <><Loader2 className="mr-1 h-3 w-3 animate-spin" /> Linking...</>
                    ) : (
                      <><Plus className="mr-1 h-3 w-3" /> Link</>
                    )}
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

        <ConfirmDialog
          open={!!unlinkConfirm}
          onOpenChange={(o) => !o && setUnlinkConfirm(null)}
          title="Unlink Student"
          description={unlinkConfirm ? `Are you sure you want to unlink ${unlinkConfirm.studentName} from this family? They will no longer appear under this parent's account.` : ''}
          onConfirm={() => unlinkConfirm && handleUnlink(unlinkConfirm)}
          isLoading={!!unlinkingId}
          variant="destructive"
          confirmLabel="Unlink"
        />
      </DialogContent>
    </Dialog>
  );
}
