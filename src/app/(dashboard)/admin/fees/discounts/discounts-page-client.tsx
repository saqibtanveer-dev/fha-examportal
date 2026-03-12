'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StudentSearchCombobox } from '@/modules/fees/components/student-search-combobox';
import { StudentDiscountDialog } from '@/modules/fees/components/student-discount-dialog';

export function DiscountsPageClient() {
  const [studentId, setStudentId] = useState('');
  const [studentLabel, setStudentLabel] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Fee Discounts"
        description="Manage permanent fee discounts for individual students (e.g. admission negotiation, staff child, scholarship)."
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Fees', href: '/admin/fees' },
          { label: 'Discounts' },
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Search Student</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <StudentSearchCombobox
            value={studentId}
            selectedLabel={studentLabel}
            disabled={false}
            onSelect={(s) => {
              setStudentId(s.studentProfileId);
              setStudentLabel(`${s.studentName} — ${s.className} (${s.rollNumber})`);
              setDialogOpen(true);
            }}
            onClear={() => { setStudentId(''); setStudentLabel(''); }}
          />
          <p className="text-sm text-muted-foreground">
            Search for a student to view and manage their permanent fee discounts.
            These discounts are automatically applied when monthly fees are generated.
          </p>
        </CardContent>
      </Card>

      {studentId && (
        <StudentDiscountDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          studentProfileId={studentId}
          studentName={studentLabel}
        />
      )}
    </div>
  );
}
