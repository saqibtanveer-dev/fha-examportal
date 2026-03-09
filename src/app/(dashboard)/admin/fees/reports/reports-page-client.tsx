'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/shared';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClassWiseReport } from '@/modules/fees/components/class-wise-report';
import { DefaulterReport } from '@/modules/fees/components/defaulter-report';
import { CollectionReport } from '@/modules/fees/components/collection-report';

export function ReportsPageClient() {
  const [tab, setTab] = useState('class-wise');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fee Reports"
        description="Detailed fee collection analytics and defaulter tracking."
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Fees', href: '/admin/fees' },
          { label: 'Reports' },
        ]}
      />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="class-wise">Class-wise</TabsTrigger>
          <TabsTrigger value="defaulters">Defaulters</TabsTrigger>
          <TabsTrigger value="collection">Collection</TabsTrigger>
        </TabsList>

        <TabsContent value="class-wise" forceMount className={tab !== 'class-wise' ? 'hidden' : 'mt-4'}>
          <ClassWiseReport />
        </TabsContent>

        <TabsContent value="defaulters" forceMount className={tab !== 'defaulters' ? 'hidden' : 'mt-4'}>
          <DefaulterReport />
        </TabsContent>

        <TabsContent value="collection" forceMount className={tab !== 'collection' ? 'hidden' : 'mt-4'}>
          <CollectionReport />
        </TabsContent>
      </Tabs>
    </div>
  );
}
