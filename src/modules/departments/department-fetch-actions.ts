'use server';

import { listDepartments, getDepartmentById } from '@/modules/departments/department-queries';
import { requireRole } from '@/lib/auth-utils';
import { serialize } from '@/utils/serialize';
import { safeFetchAction } from '@/lib/safe-action';

/**
 * Fetch departments list.
 */
export const fetchDepartmentsAction = safeFetchAction(async () => {
  await requireRole('ADMIN');
  const result = await listDepartments();
  return serialize(result);
});

/**
 * Fetch single department by ID.
 */
export const fetchDepartmentByIdAction = safeFetchAction(async (departmentId: string) => {
  await requireRole('ADMIN');
  const department = await getDepartmentById(departmentId);
  return serialize(department);
});
