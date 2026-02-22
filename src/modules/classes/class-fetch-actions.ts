'use server';

import { listClasses, listActiveClasses, getClassById } from '@/modules/classes/class-queries';
import { requireRole } from '@/lib/auth-utils';
import { serialize } from '@/utils/serialize';

/**
 * Fetch all classes.
 */
export async function fetchClassesAction() {
  await requireRole('ADMIN');
  const result = await listClasses();
  return serialize(result);
}

/**
 * Fetch active classes only.
 */
export async function fetchActiveClassesAction() {
  await requireRole('ADMIN');
  const result = await listActiveClasses();
  return serialize(result);
}

/**
 * Fetch single class by ID.
 */
export async function fetchClassByIdAction(classId: string) {
  await requireRole('ADMIN');
  const classData = await getClassById(classId);
  return serialize(classData);
}
