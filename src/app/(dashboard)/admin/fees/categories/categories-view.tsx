'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { PageHeader, EmptyState } from '@/components/shared';
import { CategoryTable } from '@/modules/fees/components/category-table';
import { CreateCategoryDialog } from '@/modules/fees/components/create-category-dialog';
import type { SerializedFeeCategory } from '@/modules/fees/fee.types';

type Props = { categories: SerializedFeeCategory[] };

export function CategoriesView({ categories }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fee Categories"
        description="Define fee types like Tuition, Lab, Transport, etc."
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Fees', href: '/admin/fees' },
          { label: 'Categories' },
        ]}
        actions={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        }
      />

      {categories.length === 0 ? (
        <EmptyState
          title="No fee categories"
          description="Create your first fee category to define the types of fees charged to students."
          action={
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          }
        />
      ) : (
        <CategoryTable categories={categories} />
      )}

      <CreateCategoryDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
