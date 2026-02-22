'use server';

import { listQuestions, getQuestionsForPicker } from '@/modules/questions/question-queries';
import { requireRole } from '@/lib/auth-utils';
import { serialize } from '@/utils/serialize';
import type { PaginationParams } from '@/utils/pagination';
import type { QuestionListFilters } from '@/modules/questions/question-queries';

/**
 * Server action wrapper for client-side React Query to fetch questions.
 * Called by useQuestionsQuery queryFn when cache is stale.
 */
export async function fetchQuestionsAction(
  params: PaginationParams,
  filters: QuestionListFilters,
) {
  const session = await requireRole('TEACHER', 'ADMIN');
  // Always scope to teacher's own questions if teacher
  const scopedFilters = {
    ...filters,
    createdById: session.user.role === 'TEACHER' ? session.user.id : filters.createdById,
  };
  const result = await listQuestions(params, scopedFilters);
  return serialize(result);
}

/**
 * Server action for fetching questions for the exam question picker.
 */
export async function fetchQuestionsForPickerAction(subjectId?: string, classId?: string) {
  await requireRole('TEACHER', 'ADMIN');
  const result = await getQuestionsForPicker(subjectId, classId);
  return serialize(result);
}
