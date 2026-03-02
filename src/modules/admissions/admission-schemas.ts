/**
 * Admission module Zod validation schemas.
 * All input validation for campaign management, applicants, and decisions.
 */

import { z } from 'zod/v4';

// ============================================
// Campaign Schemas
// ============================================

// Base object schema WITHOUT refinements (needed because Zod v4 disallows .partial() on refined schemas)
const campaignBaseSchema = z.object({
  name: z.string().min(3).max(200),
  slug: z.string().min(3).max(100).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  description: z.string().max(2000).optional(),
  type: z.enum(['ADMISSION', 'SCHOLARSHIP', 'ADMISSION_SCHOLARSHIP']),
  academicSessionId: z.string().uuid().optional(),
  targetClassId: z.string().uuid().optional(),
  targetClassGrade: z.number().int().min(1).max(12).optional(),
  maxSeats: z.number().int().min(1).optional(),

  registrationStartAt: z.string().optional(),
  registrationEndAt: z.string().optional(),
  testStartAt: z.string().optional(),
  testEndAt: z.string().optional(),
  testDuration: z.number().int().min(5).max(300),
  totalMarks: z.number().positive(),
  passingMarks: z.number().positive(),
  shuffleQuestions: z.boolean().default(false),
  shuffleOptions: z.boolean().default(false),
  allowCalculator: z.boolean().default(false),
  negativeMarking: z.boolean().default(false),
  negativeMarkValue: z.number().min(0).optional(),
  instructions: z.string().max(5000).optional(),

  resultPublishAt: z.string().optional(),
  showRankToApplicant: z.boolean().default(false),
  showScoreToApplicant: z.boolean().default(true),
  showCutoffToApplicant: z.boolean().default(false),

  hasScholarship: z.boolean().default(false),
  eligibilityCriteria: z.any().optional(),
});

// Campaign refinements applied on top of the base schema
export const createCampaignSchema = campaignBaseSchema.refine(
  (d) => d.passingMarks <= d.totalMarks,
  { message: 'Passing marks cannot exceed total marks', path: ['passingMarks'] },
).refine(
  (d) => {
    if (d.registrationStartAt && d.registrationEndAt) {
      return new Date(d.registrationStartAt) < new Date(d.registrationEndAt);
    }
    return true;
  },
  { message: 'Registration end must be after start', path: ['registrationEndAt'] },
).refine(
  (d) => {
    if (d.testStartAt && d.testEndAt) {
      return new Date(d.testStartAt) < new Date(d.testEndAt);
    }
    return true;
  },
  { message: 'Test end must be after start', path: ['testEndAt'] },
);
export type CreateCampaignInput = z.infer<typeof campaignBaseSchema>;

export const updateCampaignSchema = campaignBaseSchema.partial().extend({
  id: z.string().uuid(),
});
export type UpdateCampaignInput = z.infer<typeof updateCampaignSchema>;

// ============================================
// Scholarship Tier Schemas
// ============================================

export const scholarshipTierSchema = z.object({
  tier: z.enum(['FULL_100', 'SEVENTY_FIVE', 'HALF_50', 'QUARTER_25', 'NONE']),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  minPercentage: z.number().min(0).max(100),
  maxPercentage: z.number().min(0).max(100).optional(),
  maxRecipients: z.number().int().min(1),
  benefitDetails: z.string().max(500).optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().min(0),
});
export type ScholarshipTierInput = z.infer<typeof scholarshipTierSchema>;

export const campaignScholarshipTiersSchema = z.object({
  campaignId: z.string().uuid(),
  tiers: z.array(scholarshipTierSchema).min(1),
});

// ============================================
// Campaign Question Schemas
// ============================================

export const addQuestionsToCampaignSchema = z.object({
  campaignId: z.string().uuid(),
  questions: z.array(z.object({
    questionId: z.string().uuid(),
    sortOrder: z.number().int().min(1),
    marks: z.number().positive(),
    isRequired: z.boolean().default(true),
    sectionLabel: z.string().max(100).optional(),
  })).min(1),
});
export type AddQuestionsToCampaignInput = z.infer<typeof addQuestionsToCampaignSchema>;

export const removeQuestionsFromCampaignSchema = z.object({
  campaignId: z.string().uuid(),
  questionIds: z.array(z.string().uuid()).min(1),
});

// ============================================
// Evaluation Stage Schema
// ============================================

export const evaluationStageSchema = z.object({
  stage: z.enum(['WRITTEN_TEST', 'INTERVIEW', 'DOCUMENT_REVIEW', 'FINAL_DECISION']),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  sortOrder: z.number().int().min(0),
  isRequired: z.boolean().default(true),
  weightPercentage: z.number().min(0).max(100).optional(),
  passingCriteria: z.string().max(200).optional(),
});

// ============================================
// Applicant Registration Schema (Public Portal)
// ============================================

export const applicantRegistrationSchema = z.object({
  campaignId: z.string().uuid(),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().max(20).optional(),
  dateOfBirth: z.string().date().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  guardianName: z.string().max(100).optional(),
  guardianPhone: z.string().max(20).optional(),
  guardianEmail: z.string().email().optional(),
  address: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  previousSchool: z.string().max(200).optional(),
  previousClass: z.string().max(50).optional(),
  previousGrade: z.string().max(10).optional(),
});
export type ApplicantRegistrationInput = z.infer<typeof applicantRegistrationSchema>;

// ============================================
// OTP Schemas
// ============================================

export const verifyOtpSchema = z.object({
  applicantId: z.string().uuid(),
  otp: z.string().regex(/^\d{6}$/, 'OTP must be 6 digits'),
});
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;

export const resendOtpSchema = z.object({
  applicantId: z.string().uuid(),
});
export type ResendOtpInput = z.infer<typeof resendOtpSchema>;

// ============================================
// Test Session Schemas
// ============================================

export const startTestSessionSchema = z.object({
  token: z.string().min(1),
});
export type StartTestSessionInput = z.infer<typeof startTestSessionSchema>;

export const submitAnswerSchema = z.object({
  sessionId: z.string().uuid(),
  campaignQuestionId: z.string().uuid(),
  answerText: z.string().max(4000).optional(),
  selectedOptionId: z.string().uuid().optional(),
  isMarkedForReview: z.boolean().optional(),
  timeSpent: z.number().int().min(0).optional(),
});
export type SubmitAnswerInput = z.infer<typeof submitAnswerSchema>;

export const submitTestSchema = z.object({
  sessionId: z.string().uuid(),
});
export type SubmitTestInput = z.infer<typeof submitTestSchema>;

// ============================================
// Result Check Schema
// ============================================

export const checkResultSchema = z.object({
  applicationNumber: z.string().min(1),
  email: z.string().email(),
});
export type CheckResultInput = z.infer<typeof checkResultSchema>;

// ============================================
// Scholarship Response Schema
// ============================================

export const scholarshipResponseSchema = z.object({
  applicantId: z.string().uuid(),
  response: z.enum(['ACCEPT', 'DECLINE']),
});
export type ScholarshipResponseInput = z.infer<typeof scholarshipResponseSchema>;

// ============================================
// Decision Schemas
// ============================================

export const singleDecisionSchema = z.object({
  applicantId: z.string().uuid(),
  decision: z.enum(['ACCEPTED', 'REJECTED', 'WAITLISTED', 'SCHOLARSHIP_OFFERED']),
  remarks: z.string().max(500).optional(),
  conditions: z.string().max(500).optional(),
  assignedClassId: z.string().uuid().optional(),
  assignedSectionId: z.string().uuid().optional(),
});
export type SingleDecisionInput = z.infer<typeof singleDecisionSchema>;

export const bulkDecisionSchema = z.object({
  applicantIds: z.array(z.string().uuid()).min(1),
  decision: z.enum(['ACCEPTED', 'REJECTED', 'WAITLISTED']),
  remarks: z.string().max(500).optional(),
  assignedClassId: z.string().uuid().optional(),
  assignedSectionId: z.string().uuid().optional(),
});
export type BulkDecisionInput = z.infer<typeof bulkDecisionSchema>;

// ============================================
// Enrollment Schemas
// ============================================

export const enrollApplicantSchema = z.object({
  applicantId: z.string().uuid(),
  classId: z.string().uuid(),
  sectionId: z.string().uuid(),
  rollNumber: z.string().optional(),
});
export type EnrollApplicantInput = z.infer<typeof enrollApplicantSchema>;

export const bulkEnrollSchema = z.object({
  applicants: z.array(z.object({
    applicantId: z.string().uuid(),
    classId: z.string().uuid(),
    sectionId: z.string().uuid(),
    rollNumber: z.string().optional(),
  })).min(1),
});

// ============================================
// Merit List Schema
// ============================================

export const generateMeritListSchema = z.object({
  campaignId: z.string().uuid(),
});

// ============================================
// Applicant Status Filter
// ============================================

export const applicantListFiltersSchema = z.object({
  campaignId: z.string().uuid(),
  search: z.string().optional(),
  status: z.enum([
    'REGISTERED', 'VERIFIED', 'TEST_IN_PROGRESS', 'TEST_COMPLETED',
    'GRADED', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'ACCEPTED',
    'REJECTED', 'WAITLISTED', 'ENROLLED', 'WITHDRAWN', 'EXPIRED',
  ]).optional(),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
});
