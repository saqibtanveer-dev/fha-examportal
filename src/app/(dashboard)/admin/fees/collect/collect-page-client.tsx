'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/shared';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StudentPaymentTab } from '@/modules/fees/components/student-payment-tab';
import { FamilyPaymentTab } from '@/modules/fees/components/family-payment-tab';

export function CollectPageClient() {
  const [tab, setTab] = useState('student');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Collect Fees"
        description="Record fee payments for individual students or family bulk payments."
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Fees', href: '/admin/fees' },
          { label: 'Collect' },
        ]}
      />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="student">Student Payment</TabsTrigger>
          <TabsTrigger value="family">Family Payment</TabsTrigger>
        </TabsList>

        <TabsContent value="student" forceMount className={tab !== 'student' ? 'hidden' : 'mt-4'}>
          <StudentPaymentTab />
        </TabsContent>

        <TabsContent value="family" forceMount className={tab !== 'family' ? 'hidden' : 'mt-4'}>
          <FamilyPaymentTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
