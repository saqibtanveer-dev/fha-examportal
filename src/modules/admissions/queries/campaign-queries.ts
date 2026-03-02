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

export async function getCampaignBySlug(slug: string) {
  return prisma.testCampaign.findUnique({
    where: { slug, deletedAt: null },
    include: {
      targetClass: { select: { id: true, name: true, grade: true } },
      scholarshipTiers: {
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
        select: {
          tier: true,
          name: true,
          description: true,
          minPercentage: true,
          benefitDetails: true,
        },
      },
      _count: { select: { applicants: true, campaignQuestions: true } },
    },
  });
}

export async function getPublicCampaigns() {
  return prisma.testCampaign.findMany({
    where: {
      deletedAt: null,
      status: { in: ['REGISTRATION_OPEN', 'TEST_ACTIVE', 'RESULTS_PUBLISHED'] },
    },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      type: true,
      status: true,
      targetClassGrade: true,
      maxSeats: true,
      registrationStartAt: true,
      registrationEndAt: true,
      testStartAt: true,
      testEndAt: true,
      testDuration: true,
      hasScholarship: true,
      _count: { select: { applicants: true } },
      targetClass: { select: { name: true, grade: true } },
    },
    orderBy: { registrationStartAt: 'desc' },
  });
}

export async function getPublicCampaignDetail(slug: string) {
  return prisma.testCampaign.findUnique({
    where: { slug, deletedAt: null },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      type: true,
      status: true,
      targetClassGrade: true,
      maxSeats: true,
      registrationStartAt: true,
      registrationEndAt: true,
      testStartAt: true,
      testEndAt: true,
      testDuration: true,
      totalMarks: true,
      passingMarks: true,
      instructions: true,
      hasScholarship: true,
      eligibilityCriteria: true,
      showRankToApplicant: true,
      showScoreToApplicant: true,
      negativeMarking: true,
      targetClass: { select: { name: true, grade: true } },
      scholarshipTiers: {
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
        select: {
          tier: true,
          name: true,
          description: true,
          minPercentage: true,
          maxRecipients: true,
          benefitDetails: true,
        },
      },
      _count: { select: { applicants: true, campaignQuestions: true } },
    },
  });
}
