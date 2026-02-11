import { prisma } from '@/lib/prisma';

export async function listClasses() {
  return prisma.class.findMany({
    orderBy: { grade: 'asc' },
    include: {
      sections: { orderBy: { name: 'asc' } },
      _count: { select: { students: true } },
    },
  });
}

export async function getClassById(id: string) {
  return prisma.class.findUnique({
    where: { id },
    include: {
      sections: { orderBy: { name: 'asc' }, include: { _count: { select: { students: true } } } },
      _count: { select: { students: true } },
    },
  });
}

export async function listActiveClasses() {
  return prisma.class.findMany({
    where: { isActive: true },
    orderBy: { grade: 'asc' },
    include: { sections: { where: { isActive: true }, orderBy: { name: 'asc' } } },
  });
}
