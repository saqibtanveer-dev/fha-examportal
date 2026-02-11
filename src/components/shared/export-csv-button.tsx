'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { downloadCsv } from '@/utils/csv';
import { toast } from 'sonner';

type ExportCsvButtonProps = {
  label?: string;
  filename: string;
  onExport: () => Promise<{ success: boolean; data?: { csvString: string }; error?: string }>;
};

export function ExportCsvButton({
  label = 'Export CSV',
  filename,
  onExport,
}: ExportCsvButtonProps) {
  const [isPending, startTransition] = useTransition();

  function handleExport() {
    startTransition(async () => {
      const result = await onExport();
      if (result.success && result.data) {
        downloadCsv(result.data.csvString, filename);
        toast.success('Export downloaded');
      } else {
        toast.error(result.error ?? 'Export failed');
      }
    });
  }

  return (
    <Button variant="outline" size="sm" onClick={handleExport} disabled={isPending}>
      <Download className="mr-2 h-4 w-4" />
      {isPending ? 'Exporting…' : label}
    </Button>
  );
}
