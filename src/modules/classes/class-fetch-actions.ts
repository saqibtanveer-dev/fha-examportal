'use server';

import { listClasses, listActiveClasses, getClassById } from '@/modules/classes/class-queries';
import { requireRole } from '@/lib/auth-utils';
import { serialize } from '@/utils/serialize';
import { safeFetchAction } from '@/lib/safe-action';

/**
 * Fetch all classes.
 */
export const fetchClassesAction = safeFetchAction(async () => {
  await requireRole('ADMIN');
  const result = await listClasses();
  return serialize(result);
});

/**
 * Fetch active classes only.
 */
export const fetchActiveClassesAction = safeFetchAction(async () => {
  await requireRole('ADMIN');
  const result = await listActiveClasses();
  return serialize(result);
});

/**
 * Fetch single class by ID.
 */
export const fetchClassByIdAction = safeFetchAction(async (classId: string) => {
  await requireRole('ADMIN');
  const classData = await getClassById(classId);
  return serialize(classData);
});
