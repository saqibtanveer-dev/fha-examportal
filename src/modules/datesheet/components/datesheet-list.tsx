'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ConfirmDialog } from '@/components/shared';
import { MoreHorizontal, Eye, Trash2, Send, Archive } from 'lucide-react';
import { useState } from 'react';
import { DatesheetStatusBadge } from './datesheet-status-badge';
import { formatDateRange } from '../datesheet.utils';
import type { DeepSerialize } from '@/utils/serialize';
import type { DatesheetWithMeta } from '../datesheet.types';

type SerializedDatesheet = DeepSerialize<DatesheetWithMeta>;

type Props = {
  datesheets: SerializedDatesheet[];
  onPublish: (id: string) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
  isPending: boolean;
};

export function DatesheetList({ datesheets, onPublish, onArchive, onDelete, isPending }: Props) {
  const router = useRouter();
  const [confirmAction, setConfirmAction] = useState<{ id: string; type: 'publish' | 'archive' | 'delete' } | null>(null);

  const handleConfirm = () => {
    if (!confirmAction) return;
    if (confirmAction.type === 'publish') onPublish(confirmAction.id);
    else if (confirmAction.type === 'archive') onArchive(confirmAction.id);
    else if (confirmAction.type === 'delete') onDelete(confirmAction.id);
    setConfirmAction(null);
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date Range</TableHead>
            <TableHead className="text-center">Entries</TableHead>
            <TableHead className="w-15" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {datesheets.map((ds) => (
            <TableRow key={ds.id} className="cursor-pointer" onClick={() => router.push(`/admin/datesheet/${ds.id}`)}>
              <TableCell className="font-medium">{ds.title}</TableCell>
              <TableCell>{ds.examType}</TableCell>
              <TableCell><DatesheetStatusBadge status={ds.status} /></TableCell>
              <TableCell>{formatDateRange(ds.startDate, ds.endDate)}</TableCell>
              <TableCell className="text-center">{ds._count.entries}</TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => router.push(`/admin/datesheet/${ds.id}`)}>
                      <Eye className="mr-2 h-4 w-4" /> View
                    </DropdownMenuItem>
                    {ds.status === 'DRAFT' && (
                      <>
                        <DropdownMenuItem onClick={() => setConfirmAction({ id: ds.id, type: 'publish' })}>
                          <Send className="mr-2 h-4 w-4" /> Publish
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => setConfirmAction({ id: ds.id, type: 'delete' })}>
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </>
                    )}
                    {ds.status === 'PUBLISHED' && (
                      <DropdownMenuItem onClick={() => setConfirmAction({ id: ds.id, type: 'archive' })}>
                        <Archive className="mr-2 h-4 w-4" /> Archive
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <ConfirmDialog
        open={!!confirmAction}
        onOpenChange={(o) => !o && setConfirmAction(null)}
        onConfirm={handleConfirm}
        title={`${confirmAction?.type === 'publish' ? 'Publish' : confirmAction?.type === 'archive' ? 'Archive' : 'Delete'} Datesheet?`}
        description={
          confirmAction?.type === 'delete'
            ? 'This will permanently delete this datesheet and all its entries.'
            : confirmAction?.type === 'publish'
            ? 'This will make the datesheet visible to all stakeholders.'
            : 'This will archive the datesheet.'
        }
        confirmLabel={confirmAction?.type === 'delete' ? 'Delete' : confirmAction?.type === 'publish' ? 'Publish' : 'Archive'}
        variant={confirmAction?.type === 'delete' ? 'destructive' : 'default'}
        isLoading={isPending}
      />
    </>
  );
}
