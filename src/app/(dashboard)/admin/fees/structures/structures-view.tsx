'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { PageHeader, EmptyState } from '@/components/shared';
import { StructureTable } from '@/modules/fees/components/structure-table';
import { BulkCreateStructureDialog } from '@/modules/fees/components/bulk-create-structure-dialog';
import type { SerializedFeeStructure, SerializedFeeCategory } from '@/modules/fees/fee.types';

type ClassOption = { id: string; name: string; grade: number };

type Props = {
  structures: SerializedFeeStructure[];
  categories: SerializedFeeCategory[];
  classes: ClassOption[];
};

export function StructuresView({ structures, categories, classes }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fee Structures"
        description="Set fee amounts per category per class for the current session."
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Fees', href: '/admin/fees' },
          { label: 'Structures' },
        ]}
        actions={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Bulk Setup
          </Button>
        }
      />

      {structures.length === 0 ? (
        <EmptyState
          title="No fee structures"
          description="Configure how much each fee category costs per class."
          action={
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Setup Structures
            </Button>
          }
        />
      ) : (
        <StructureTable structures={structures} />
      )}

      <BulkCreateStructureDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        categories={categories}
        classes={classes}
      />
    </div>
  );
}
