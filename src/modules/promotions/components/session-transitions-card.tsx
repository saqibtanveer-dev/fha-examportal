'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Spinner } from '@/components/shared';
import type { SessionTransitionRecord } from './year-transition-types';

function getStatusBadgeVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (status === 'PROMOTED') return 'default';
  if (status === 'GRADUATED') return 'secondary';
  if (status === 'HELD_BACK') return 'outline';
  return 'outline';
}

type Props = {
  isPending: boolean;
  isLoadingTransitions: boolean;
  sessionTransitions: SessionTransitionRecord[];
  selectedTransitionIds: string[];
  onToggleTransitionSelection: (id: string, selected: boolean) => void;
  onSetAllTransitionSelection: (selected: boolean) => void;
  onOpenUndoSelected: () => void;
  onOpenUndoAll: () => void;
};

export function SessionTransitionsCard({
  isPending,
  isLoadingTransitions,
  sessionTransitions,
  selectedTransitionIds,
  onToggleTransitionSelection,
  onSetAllTransitionSelection,
  onOpenUndoSelected,
  onOpenUndoAll,
}: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Already Processed In This Session</CardTitle>
        <CardDescription>
          Review what has already been processed and undo only mistakes.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={isLoadingTransitions || sessionTransitions.length === 0}
            onClick={() => onSetAllTransitionSelection(true)}
          >
            Select All Processed
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={isLoadingTransitions || sessionTransitions.length === 0}
            onClick={() => onSetAllTransitionSelection(false)}
          >
            Clear Selection
          </Button>
          <Button
            variant="destructive"
            size="sm"
            disabled={isPending || selectedTransitionIds.length === 0}
            onClick={onOpenUndoSelected}
          >
            Undo Selected ({selectedTransitionIds.length})
          </Button>
          <Button
            variant="destructive"
            size="sm"
            disabled={isPending || sessionTransitions.length === 0}
            onClick={onOpenUndoAll}
          >
            Undo All In Session
          </Button>
        </div>

        {isLoadingTransitions ? (
          <div className="flex items-center text-sm text-muted-foreground">
            <Spinner size="sm" className="mr-2" />
            Loading processed transitions...
          </div>
        ) : sessionTransitions.length === 0 ? (
          <div className="rounded-md border border-dashed p-6 text-sm text-muted-foreground">
            No transitions processed yet for this session.
          </div>
        ) : (
          <div className="max-h-105 overflow-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Undo</TableHead>
                  <TableHead>Roll #</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Processed On</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessionTransitions.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedTransitionIds.includes(row.id)}
                        onCheckedChange={(value) => onToggleTransitionSelection(row.id, value === true)}
                      />
                    </TableCell>
                    <TableCell className="font-mono text-xs">{row.rollNumber}</TableCell>
                    <TableCell>{row.studentName}</TableCell>
                    <TableCell>{row.fromClassName} / {row.fromSectionName}</TableCell>
                    <TableCell>{row.toClassName ?? 'Graduate'}{row.toSectionName ? ` / ${row.toSectionName}` : ''}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(row.status)}>{row.status.replace('_', ' ')}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(row.promotedAt).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
