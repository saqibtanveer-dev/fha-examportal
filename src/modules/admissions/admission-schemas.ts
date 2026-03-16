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

export const removeQuestionsFromCampaignSchema = z.object({
  campaignId: z.string().uuid(),
  questionIds: z.array(z.string().uuid()).min(1),
});

/**
 * Create a new MCQ question directly for a campaign.
 * Admin creates the question inline — not picking from shared question bank.
 */
export const createCampaignQuestionSchema = z.object({
  campaignId: z.string().uuid(),
  title: z.string().min(3).max(1000),
  description: z.string().max(2000).optional(),
  options: z.tuple([
    z.object({ text: z.string().min(1).max(500) }),
    z.object({ text: z.string().min(1).max(500) }),
    z.object({ text: z.string().min(1).max(500) }),
    z.object({ text: z.string().min(1).max(500) }),
  ]),
  correctOption: z.enum(['A', 'B', 'C', 'D']),
  marks: z.number().positive().default(1),
  sectionLabel: z.string().max(100).optional(),
  paperVersion: z.string().min(1).max(5).default('A'),
});
export type CreateCampaignQuestionInput = z.infer<typeof createCampaignQuestionSchema>;

export const updateCampaignQuestionSchema = z.object({
  campaignQuestionId: z.string().uuid(),
  title: z.string().min(3).max(1000),
  description: z.string().max(2000).optional(),
  options: z.tuple([
    z.object({ text: z.string().min(1).max(500) }),
    z.object({ text: z.string().min(1).max(500) }),
    z.object({ text: z.string().min(1).max(500) }),
    z.object({ text: z.string().min(1).max(500) }),
  ]),
  correctOption: z.enum(['A', 'B', 'C', 'D']),
  marks: z.number().positive().default(1),
  sectionLabel: z.string().max(100).optional(),
});
export type UpdateCampaignQuestionInput = z.infer<typeof updateCampaignQuestionSchema>;

/**
 * CSV bulk import questions for a campaign.
 * Each row: title, optionA, optionB, optionC, optionD, correctOption (A/B/C/D), marks
 */
export const csvImportQuestionsSchema = z.object({
  campaignId: z.string().uuid(),
  questions: z.array(z.object({
    title: z.string().min(3).max(1000),
    optionA: z.string().min(1).max(500),
    optionB: z.string().min(1).max(500),
    optionC: z.string().min(1).max(500),
    optionD: z.string().min(1).max(500),
    correctOption: z.enum(['A', 'B', 'C', 'D']),
    marks: z.number().positive().default(1),
    sectionLabel: z.string().max(100).optional(),
    paperVersion: z.string().min(1).max(5).optional(),
  })).min(1).max(200),
  defaultPaperVersion: z.string().min(1).max(5).default('A'),
});
export type CsvImportQuestionsInput = z.infer<typeof csvImportQuestionsSchema>;

// ============================================
// Admin Add Candidate Schema (replaces public self-registration)
// ============================================

export const addCandidateSchema = z.object({
  campaignId: z.string().uuid(),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().max(20).optional(),
  dateOfBirth: z.string().date().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  guardianName: z.string().max(100).optional(),
  guardianPhone: z.string().max(20).optional(),
  address: z.string().max(500).optional(),
  previousSchool: z.string().max(200).optional(),
  previousClass: z.string().max(50).optional(),
  paperVersion: z.string().min(1).max(5).default('A'),
});
export type AddCandidateInput = z.infer<typeof addCandidateSchema>;

export const bulkAddCandidatesSchema = z.object({
  campaignId: z.string().uuid(),
  candidates: z.array(addCandidateSchema.omit({ campaignId: true })).min(1).max(100),
});
export type BulkAddCandidatesInput = z.infer<typeof bulkAddCandidatesSchema>;

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
// Regenerate Test PIN Schema
// ============================================

export const regenerateTestPinSchema = z.object({
  applicantId: z.string().uuid(),
});
export type RegenerateTestPinInput = z.infer<typeof regenerateTestPinSchema>;

export const updateCandidateSchema = z.object({
  applicantId: z.string().uuid(),
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  phone: z.string().max(20).optional(),
  dateOfBirth: z.string().date().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  guardianName: z.string().max(100).optional(),
  guardianPhone: z.string().max(20).optional(),
  address: z.string().max(500).optional(),
  previousSchool: z.string().max(200).optional(),
  previousClass: z.string().max(50).optional(),
});
export type UpdateCandidateInput = z.infer<typeof updateCandidateSchema>;

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

