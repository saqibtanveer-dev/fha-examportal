'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/shared';
import { Download, Upload } from 'lucide-react';
import { exportMarksTemplate } from '@/modules/written-exams/excel-export';
import { ImportDialog } from './excel-import-dialog';
import type { DeepSerialize } from '@/utils/serialize';
import type { WrittenExamMarkEntryData } from '@/modules/written-exams/written-exam-queries';

type ExamData = DeepSerialize<WrittenExamMarkEntryData>;

type Props = {
  examId: string;
  data: ExamData;
  isFinalized: boolean;
};

export function ExcelActions({ examId, data, isFinalized }: Props) {
  const [showDialog, setShowDialog] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportMarksTemplate(data);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          disabled={isExporting || data.sessions.length === 0}
          className="min-h-9 gap-1.5"
        >
          {isExporting ? <Spinner size="sm" /> : <Download className="h-4 w-4" />}
          <span className="hidden sm:inline">Export</span> Excel
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowDialog(true)}
          disabled={isFinalized || data.sessions.length === 0}
          className="min-h-9 gap-1.5"
        >
          <Upload className="h-4 w-4" />
          <span className="hidden sm:inline">Import</span> Excel
        </Button>
      </div>

      <ImportDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        examId={examId}
        isFinalized={isFinalized}
      />
    </>
  );
}
