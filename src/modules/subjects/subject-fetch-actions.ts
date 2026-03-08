'use server';

import { listSubjects, getSubjectById } from '@/modules/subjects/subject-queries';
import { requireRole } from '@/lib/auth-utils';
import { serialize } from '@/utils/serialize';
import { safeFetchAction } from '@/lib/safe-action';

/**
 * Fetch subjects list.
 */
export const fetchSubjectsAction = safeFetchAction(async () => {
  await requireRole('ADMIN');
  const result = await listSubjects();
  return serialize(result);
});

/**
 * Fetch single subject by ID.
 */
export const fetchSubjectByIdAction = safeFetchAction(async (subjectId: string) => {
  await requireRole('ADMIN');
  const subject = await getSubjectById(subjectId);
  return serialize(subject);
});
