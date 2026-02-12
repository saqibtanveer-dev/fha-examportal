'use client';

import { PageHeader } from '@/components/shared';
import { ExportCsvButton } from '@/components/shared/export-csv-button';
import { exportExamResultsAction } from '@/modules/results/export-actions';

type Props = {
  examId: string;
  examTitle: string;
};

export function ExamResultsHeader({ examId, examTitle }: Props) {
  return (
    <PageHeader
      title={examTitle}
      description="Exam results and analytics"
      breadcrumbs={[
        { label: 'Teacher', href: '/teacher' },
        { label: 'Results', href: '/teacher/results' },
        { label: examTitle },
      ]}
      actions={
        <ExportCsvButton
          filename={`results-${examTitle}`}
          onExport={() => exportExamResultsAction(examId)}
        />
      }
    />
  );
}
