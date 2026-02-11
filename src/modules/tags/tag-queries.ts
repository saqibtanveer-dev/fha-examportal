import { prisma } from '@/lib/prisma';
import type { TagCategory } from '@prisma/client';

export async function listTags(category?: TagCategory) {
  return prisma.tag.findMany({
    where: category ? { category } : undefined,
    orderBy: { name: 'asc' },
    include: { _count: { select: { questionTags: true } } },
  });
}

export async function getTagById(id: string) {
  return prisma.tag.findUnique({ where: { id } });
}

export async function searchTags(query: string, limit = 10) {
  return prisma.tag.findMany({
    where: { name: { contains: query, mode: 'insensitive' } },
    take: limit,
    orderBy: { name: 'asc' },
  });
}
