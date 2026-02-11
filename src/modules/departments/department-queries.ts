import { prisma } from '@/lib/prisma';

export async function listDepartments() {
  return prisma.department.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { subjects: true } } },
  });
}

export async function getDepartmentById(id: string) {
  return prisma.department.findUnique({
    where: { id },
    include: { subjects: { orderBy: { name: 'asc' } } },
  });
}
