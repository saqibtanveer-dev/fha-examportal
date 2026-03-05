import { requireRole } from '@/lib/auth-utils';
import { notFound } from 'next/navigation';
import { getExamDetail } from '@/modules/exams/exam-queries';
import { MarksEntryPageClient } from '@/modules/written-exams/components/marks-entry-page-client';

type Props = {
  params: Promise<{ examId: string }>;
};

export default async function WrittenExamMarksPage({ params }: Props) {
  await requireRole('TEACHER', 'ADMIN');
  const { examId } = await params;

  const exam = await getExamDetail(examId);
  if (!exam) notFound();
  if (exam.deliveryMode !== 'WRITTEN') notFound();

  return <MarksEntryPageClient examId={examId} />;
}
