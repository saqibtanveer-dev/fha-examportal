'use server';

import { requireRole } from '@/lib/auth-utils';
import { serialize } from '@/utils/serialize';
import { getWrittenExamMarkEntryData } from './written-exam-queries';

/**
 * Server action wrapper for fetching written exam marks entry data.
 * Used by React Query on the client.
 */
export async function fetchWrittenExamMarkEntryAction(examId: string) {
  const session = await requireRole('TEACHER', 'ADMIN');
  const data = await getWrittenExamMarkEntryData(examId);

  if (!data) return null;

  // Teachers can only access their own exams
  if (
    session.user.role === 'TEACHER' &&
    data.exam.createdBy.id !== session.user.id
  ) {
    return null;
  }

  return serialize(data);
}
