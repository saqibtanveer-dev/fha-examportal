/**
 * Campaign queries — listing, detail, and public portal lookups.
 */

import { prisma } from '@/lib/prisma';
import type { Prisma, CampaignStatus } from '@prisma/client';
import type { PaginationParams } from '@/utils/pagination';
import { getSkipTake, buildPaginatedResult } from '@/utils/pagination';

export type CampaignListFilters = {
  search?: string;
  status?: CampaignStatus;
  type?: 'ADMISSION' | 'SCHOLARSHIP' | 'ADMISSION_SCHOLARSHIP';
  academicSessionId?: string;
  createdById?: string;
};

const campaignListInclude = {
  academicSession: { select: { id: true, name: true } },
  targetClass: { select: { id: true, name: true, grade: true } },
  createdBy: { select: { id: true, firstName: true, lastName: true } },
  _count: { select: { applicants: true, campaignQuestions: true } },
} satisfies Prisma.TestCampaignInclude;

export async function listCampaigns(
  params: PaginationParams,
  filters: CampaignListFilters = {},
) {
  const where: Prisma.TestCampaignWhereInput = { deletedAt: null };

  if (filters.status) where.status = filters.status;
  if (filters.type) where.type = filters.type;
  if (filters.academicSessionId) where.academicSessionId = filters.academicSessionId;
  if (filters.createdById) where.createdById = filters.createdById;
  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { slug: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  const [data, totalCount] = await Promise.all([
    prisma.testCampaign.findMany({
      where,
      ...getSkipTake(params),
      orderBy: { createdAt: 'desc' },
      include: campaignListInclude,
    }),
    prisma.testCampaign.count({ where }),
  ]);

  return buildPaginatedResult(data, totalCount, params);
}

export async function getCampaignById(id: string) {
  return prisma.testCampaign.findUnique({
    where: { id, deletedAt: null },
    include: {
      academicSession: { select: { id: true, name: true } },
      targetClass: { select: { id: true, name: true, grade: true } },
      createdBy: { select: { id: true, firstName: true, lastName: true } },
      campaignQuestions: {
        include: {
          _count: { select: { applicantAnswers: true } },
          question: {
            include: {
              subject: { select: { name: true, code: true } },
              mcqOptions: true,
            },
          },
        },
        orderBy: { sortOrder: 'asc' },
      },
      scholarshipTiers: { orderBy: { sortOrder: 'asc' } },
      evaluationStages: { orderBy: { sortOrder: 'asc' } },
      _count: { select: { applicants: true } },
    },
  });
}
