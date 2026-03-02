/**
 * Applicant queries — listing, detail, and token/application-number lookups.
 */

import { prisma } from '@/lib/prisma';
import type { Prisma, ApplicantStatus } from '@prisma/client';
import type { PaginationParams } from '@/utils/pagination';
import { getSkipTake, buildPaginatedResult } from '@/utils/pagination';

export type ApplicantListFilters = {
  campaignId: string;
  search?: string;
  status?: ApplicantStatus;
};

export async function listApplicants(
  params: PaginationParams,
  filters: Partial<ApplicantListFilters> = {},
) {
  const where: Prisma.ApplicantWhereInput = filters.campaignId
    ? { campaignId: filters.campaignId }
    : {};

  if (filters.status) where.status = filters.status;
  if (filters.search) {
    where.OR = [
      { firstName: { contains: filters.search, mode: 'insensitive' } },
      { lastName: { contains: filters.search, mode: 'insensitive' } },
      { email: { contains: filters.search, mode: 'insensitive' } },
      { applicationNumber: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  const [data, totalCount] = await Promise.all([
    prisma.applicant.findMany({
      where,
      ...getSkipTake(params),
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        status: true,
        applicationNumber: true,
        createdAt: true,
        result: {
          select: { percentage: true, rank: true, isPassed: true, grade: true },
        },
        scholarship: { select: { tier: true, isAccepted: true } },
      },
    }),
    prisma.applicant.count({ where }),
  ]);

  return buildPaginatedResult(data, totalCount, params);
}

export async function getApplicantById(id: string) {
  return prisma.applicant.findUnique({
    where: { id },
    include: {
      campaign: { select: { id: true, name: true, slug: true, type: true } },
      testSession: {
        include: {
          applicantAnswers: {
            include: {
              grade: true,
              campaignQuestion: {
                include: { question: { include: { mcqOptions: true } } },
              },
            },
            orderBy: { campaignQuestion: { sortOrder: 'asc' } },
          },
        },
      },
      result: true,
      scholarship: { include: { scholarshipTier: true } },
      decisions: {
        orderBy: { decidedAt: 'desc' },
        include: {
          decidedBy: { select: { firstName: true, lastName: true } },
          assignedClass: { select: { name: true } },
          assignedSection: { select: { name: true } },
        },
      },
    },
  });
}

export async function getApplicantByToken(pin: string) {
  return prisma.applicant.findFirst({
    where: { accessToken: pin },
    include: {
      campaign: {
        select: {
          id: true,
          name: true,
          slug: true,
          status: true,
          testDuration: true,
          totalMarks: true,
          testStartAt: true,
          testEndAt: true,
          shuffleQuestions: true,
          shuffleOptions: true,
          negativeMarking: true,
          instructions: true,
        },
      },
      testSession: { select: { id: true, status: true, startedAt: true } },
    },
  });
}
