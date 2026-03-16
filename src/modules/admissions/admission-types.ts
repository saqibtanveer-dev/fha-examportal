/**
 * Admission module TypeScript types.
 * Used across queries, actions, and components.
 */

import type { Prisma } from '@prisma/client';

// ============================================
// Campaign Types
// ============================================

export type CampaignListItem = Prisma.TestCampaignGetPayload<{
  include: {
    academicSession: { select: { id: true; name: true } };
    targetClass: { select: { id: true; name: true; grade: true } };
    createdBy: { select: { id: true; firstName: true; lastName: true } };
    _count: { select: { applicants: true; campaignQuestions: true } };
  };
}>;

export type CampaignDetail = Prisma.TestCampaignGetPayload<{
  include: {
    academicSession: { select: { id: true; name: true } };
    targetClass: { select: { id: true; name: true; grade: true } };
    createdBy: { select: { id: true; firstName: true; lastName: true } };
    campaignQuestions: {
      include: {
        _count: { select: { applicantAnswers: true } };
        question: {
          include: {
            subject: { select: { name: true; code: true } };
            mcqOptions: true;
          };
        };
      };
      orderBy: { sortOrder: 'asc' };
    };
    scholarshipTiers: { orderBy: { sortOrder: 'asc' } };
    evaluationStages: { orderBy: { sortOrder: 'asc' } };
    _count: { select: { applicants: true } };
  };
}>;

// ============================================
// Applicant Types
// ============================================

export type ApplicantListItem = Prisma.ApplicantGetPayload<{
  select: {
    id: true;
    firstName: true;
    lastName: true;
    email: true;
    phone: true;
    status: true;
    applicationNumber: true;
    paperVersion: true;
    createdAt: true;
    result: {
      select: {
        percentage: true;
        rank: true;
        isPassed: true;
        grade: true;
      };
    };
    scholarship: {
      select: {
        tier: true;
        isAccepted: true;
      };
    };
  };
}>;

export type ApplicantDetail = Prisma.ApplicantGetPayload<{
  include: {
    campaign: { select: { id: true; name: true; slug: true; type: true } };
    testSession: {
      include: {
        applicantAnswers: {
          include: {
            grade: true;
            campaignQuestion: {
              include: {
                question: { include: { mcqOptions: true } };
              };
            };
          };
        };
      };
    };
    result: true;
    scholarship: { include: { scholarshipTier: true } };
    decisions: { orderBy: { decidedAt: 'desc' } };
  };
}>;

// ============================================
// Merit List Types
// ============================================

export type MeritListEntry = {
  rank: number;
  applicantId: string;
  applicationNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  percentage: number;
  obtainedMarks: number;
  totalMarks: number;
  grade: string | null;
  isPassed: boolean;
  timeSpent: number | null;
  isFlagged: boolean;
  status: string;
  scholarshipTier?: string | null;
  decision?: string | null;
};

// ============================================
// Campaign Analytics Types
// ============================================

export type QuestionAnalytics = {
  questionId: string;
  title: string;
  type: string;
  totalAttempts: number;
  correctCount: number;
  accuracy: number;
  avgMarks: number;
  maxMarks: number;
};

// ============================================
// Error Constants
// ============================================

export const ADMISSION_ERRORS = {
  CAMPAIGN_NOT_FOUND: 'Campaign not found',
  CAMPAIGN_NOT_DRAFT: 'Campaign is not in draft status',
  CAMPAIGN_NO_QUESTIONS: 'Campaign has no questions assigned',
  DUPLICATE_APPLICATION: 'An application with this email already exists for this campaign',
  TEST_NOT_ACTIVE: 'Test is not currently active',
  TEST_WINDOW_CLOSED: 'Test window has closed',
  CANNOT_START_TEST: 'You are not eligible to start the test',
  TEST_ALREADY_SUBMITTED: 'Test has already been submitted',
  TEST_TIME_EXPIRED: 'Test time has expired',
  TIME_EXPIRED: 'Your allocated time has expired',
  INVALID_TOKEN: 'Invalid PIN. Please check and try again.',
  APPLICANT_NOT_FOUND: 'Applicant not found',
  INVALID_STATUS_TRANSITION: 'Invalid status transition',
  SEAT_LIMIT_REACHED: 'Maximum seat limit has been reached',
  NOT_SHORTLISTED: 'Applicant must be shortlisted for this action',
  NOT_ACCEPTED: 'Applicant must be accepted for enrollment',
  EMAIL_ALREADY_EXISTS: 'A user with this email already exists',
  RATE_LIMITED: 'Too many requests. Please try again later.',
} as const;
