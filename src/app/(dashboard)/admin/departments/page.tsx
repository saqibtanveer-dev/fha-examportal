import { listDepartments } from '@/modules/departments/department-queries';
import { DepartmentsPageClient } from './departments-page-client';

export default async function DepartmentsPage() {
  const departments = await listDepartments();
  return <DepartmentsPageClient departments={departments} />;
}
