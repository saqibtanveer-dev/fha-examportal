'use server';

import { listDepartments, getDepartmentById } from '@/modules/departments/department-queries';
import { requireRole } from '@/lib/auth-utils';
import { serialize } from '@/utils/serialize';

/**
 * Fetch departments list.
 */
export async function fetchDepartmentsAction() {
  await requireRole('ADMIN');
  const result = await listDepartments();
  return serialize(result);
}

/**
 * Fetch single department by ID.
 */
export async function fetchDepartmentByIdAction(departmentId: string) {
  await requireRole('ADMIN');
  const department = await getDepartmentById(departmentId);
  return serialize(department);
}
