'use server';

import { listSubjects, getSubjectById } from '@/modules/subjects/subject-queries';
import { requireRole } from '@/lib/auth-utils';
import { serialize } from '@/utils/serialize';

/**
 * Fetch subjects list.
 */
export async function fetchSubjectsAction() {
  await requireRole('ADMIN');
  const result = await listSubjects();
  return serialize(result);
}

/**
 * Fetch single subject by ID.
 */
export async function fetchSubjectByIdAction(subjectId: string) {
  await requireRole('ADMIN');
  const subject = await getSubjectById(subjectId);
  return serialize(subject);
}
