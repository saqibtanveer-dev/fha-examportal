-- CreateEnum
CREATE TYPE "CampaignType" AS ENUM ('ADMISSION', 'SCHOLARSHIP', 'ADMISSION_SCHOLARSHIP');

-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('DRAFT', 'REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'TEST_ACTIVE', 'TEST_CLOSED', 'GRADING', 'RESULTS_READY', 'RESULTS_PUBLISHED', 'COMPLETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ApplicantStatus" AS ENUM ('REGISTERED', 'VERIFIED', 'TEST_IN_PROGRESS', 'TEST_COMPLETED', 'GRADED', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'ACCEPTED', 'REJECTED', 'WAITLISTED', 'ENROLLED', 'WITHDRAWN', 'EXPIRED');

-- CreateEnum
CREATE TYPE "ScholarshipTier" AS ENUM ('FULL_100', 'SEVENTY_FIVE', 'HALF_50', 'QUARTER_25', 'NONE');

-- CreateEnum
CREATE TYPE "VerificationType" AS ENUM ('EMAIL_OTP', 'PHONE_OTP', 'BOTH');

-- CreateEnum
CREATE TYPE "AdmissionDecisionType" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'WAITLISTED', 'SCHOLARSHIP_OFFERED');

-- CreateEnum
CREATE TYPE "EvaluationStage" AS ENUM ('WRITTEN_TEST', 'INTERVIEW', 'DOCUMENT_REVIEW', 'FINAL_DECISION');

-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'ADMISSION';

-- CreateTable
CREATE TABLE "TestCampaign" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "type" "CampaignType" NOT NULL,
    "status" "CampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "academicSessionId" TEXT,
    "targetClassId" TEXT,
    "targetClassGrade" INTEGER,
    "maxSeats" INTEGER,
    "registrationStartAt" TIMESTAMP(3),
    "registrationEndAt" TIMESTAMP(3),
    "testStartAt" TIMESTAMP(3),
    "testEndAt" TIMESTAMP(3),
    "testDuration" INTEGER NOT NULL,
    "totalMarks" DECIMAL(65,30) NOT NULL,
    "passingMarks" DECIMAL(65,30) NOT NULL,
    "shuffleQuestions" BOOLEAN NOT NULL DEFAULT false,
    "shuffleOptions" BOOLEAN NOT NULL DEFAULT false,
    "allowCalculator" BOOLEAN NOT NULL DEFAULT false,
    "negativeMarking" BOOLEAN NOT NULL DEFAULT false,
    "negativeMarkValue" DECIMAL(65,30),
    "instructions" TEXT,
    "resultPublishAt" TIMESTAMP(3),
    "showRankToApplicant" BOOLEAN NOT NULL DEFAULT false,
    "showScoreToApplicant" BOOLEAN NOT NULL DEFAULT true,
    "showCutoffToApplicant" BOOLEAN NOT NULL DEFAULT false,
    "hasScholarship" BOOLEAN NOT NULL DEFAULT false,
    "eligibilityCriteria" JSONB,
    "createdById" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TestCampaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignQuestion" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "marks" DECIMAL(65,30) NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "sectionLabel" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CampaignQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignScholarshipTier" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "tier" "ScholarshipTier" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "minPercentage" DECIMAL(65,30) NOT NULL,
    "maxPercentage" DECIMAL(65,30),
    "maxRecipients" INTEGER NOT NULL,
    "benefitDetails" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CampaignScholarshipTier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignEvaluationStage" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "stage" "EvaluationStage" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "weightPercentage" DECIMAL(65,30),
    "passingCriteria" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CampaignEvaluationStage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Applicant" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "gender" "Gender",
    "guardianName" TEXT,
    "guardianPhone" TEXT,
    "guardianEmail" TEXT,
    "address" TEXT,
    "city" TEXT,
    "previousSchool" TEXT,
    "previousClass" TEXT,
    "previousGrade" TEXT,
    "photoUrl" TEXT,
    "documentUrls" JSONB,
    "status" "ApplicantStatus" NOT NULL DEFAULT 'REGISTERED',
    "applicationNumber" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "isPhoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailOtp" TEXT,
    "phoneOtp" TEXT,
    "otpExpiresAt" TIMESTAMP(3),
    "otpAttempts" INTEGER NOT NULL DEFAULT 0,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Applicant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApplicantTestSession" (
    "id" TEXT NOT NULL,
    "applicantId" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "status" "SessionStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "startedAt" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3),
    "timeSpent" INTEGER,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "tabSwitchCount" INTEGER NOT NULL DEFAULT 0,
    "fullscreenExits" INTEGER NOT NULL DEFAULT 0,
    "copyPasteAttempts" INTEGER NOT NULL DEFAULT 0,
    "browserFingerprint" TEXT,
    "isFlagged" BOOLEAN NOT NULL DEFAULT false,
    "flagReason" TEXT,
    "questionOrder" JSONB,
    "optionOrders" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApplicantTestSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApplicantAnswer" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "campaignQuestionId" TEXT NOT NULL,
    "answerText" TEXT,
    "selectedOptionId" TEXT,
    "isMarkedForReview" BOOLEAN NOT NULL DEFAULT false,
    "answeredAt" TIMESTAMP(3),
    "timeSpent" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApplicantAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApplicantAnswerGrade" (
    "id" TEXT NOT NULL,
    "applicantAnswerId" TEXT NOT NULL,
    "gradedBy" "GradedBy" NOT NULL,
    "graderId" TEXT,
    "marksAwarded" DECIMAL(65,30) NOT NULL,
    "maxMarks" DECIMAL(65,30) NOT NULL,
    "feedback" TEXT,
    "aiConfidence" DECIMAL(65,30),
    "aiModelUsed" TEXT,
    "aiPromptTokens" INTEGER,
    "aiResponseTokens" INTEGER,
    "aiReasoning" TEXT,
    "isReviewed" BOOLEAN NOT NULL DEFAULT false,
    "reviewedAt" TIMESTAMP(3),
    "isNegativeMarked" BOOLEAN NOT NULL DEFAULT false,
    "negativeMarks" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApplicantAnswerGrade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApplicantResult" (
    "id" TEXT NOT NULL,
    "applicantId" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "totalMarks" DECIMAL(65,30) NOT NULL,
    "obtainedMarks" DECIMAL(65,30) NOT NULL,
    "percentage" DECIMAL(65,30) NOT NULL,
    "rank" INTEGER,
    "percentile" DECIMAL(65,30),
    "grade" TEXT,
    "isPassed" BOOLEAN NOT NULL,
    "sectionScores" JSONB,
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApplicantResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApplicantScholarship" (
    "id" TEXT NOT NULL,
    "applicantId" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "tierId" TEXT NOT NULL,
    "tier" "ScholarshipTier" NOT NULL,
    "percentageAwarded" DECIMAL(65,30) NOT NULL,
    "isAccepted" BOOLEAN,
    "acceptedAt" TIMESTAMP(3),
    "declinedAt" TIMESTAMP(3),
    "validFrom" TIMESTAMP(3),
    "validUntil" TIMESTAMP(3),
    "isRenewable" BOOLEAN NOT NULL DEFAULT false,
    "renewalCriteria" JSONB,
    "awardedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "awardedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApplicantScholarship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdmissionDecisionRecord" (
    "id" TEXT NOT NULL,
    "applicantId" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "decision" "AdmissionDecisionType" NOT NULL,
    "stage" "EvaluationStage" NOT NULL DEFAULT 'WRITTEN_TEST',
    "remarks" TEXT,
    "conditions" TEXT,
    "assignedClassId" TEXT,
    "assignedSectionId" TEXT,
    "decidedById" TEXT NOT NULL,
    "decidedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdmissionDecisionRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TestCampaign_slug_key" ON "TestCampaign"("slug");

-- CreateIndex
CREATE INDEX "TestCampaign_status_idx" ON "TestCampaign"("status");

-- CreateIndex
CREATE INDEX "TestCampaign_type_idx" ON "TestCampaign"("type");

-- CreateIndex
CREATE INDEX "TestCampaign_createdById_idx" ON "TestCampaign"("createdById");

-- CreateIndex
CREATE INDEX "TestCampaign_academicSessionId_idx" ON "TestCampaign"("academicSessionId");

-- CreateIndex
CREATE INDEX "TestCampaign_slug_idx" ON "TestCampaign"("slug");

-- CreateIndex
CREATE INDEX "TestCampaign_deletedAt_idx" ON "TestCampaign"("deletedAt");

-- CreateIndex
CREATE INDEX "TestCampaign_registrationStartAt_idx" ON "TestCampaign"("registrationStartAt");

-- CreateIndex
CREATE INDEX "TestCampaign_testStartAt_idx" ON "TestCampaign"("testStartAt");

-- CreateIndex
CREATE INDEX "CampaignQuestion_campaignId_idx" ON "CampaignQuestion"("campaignId");

-- CreateIndex
CREATE INDEX "CampaignQuestion_questionId_idx" ON "CampaignQuestion"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "CampaignQuestion_campaignId_sortOrder_key" ON "CampaignQuestion"("campaignId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "CampaignQuestion_campaignId_questionId_key" ON "CampaignQuestion"("campaignId", "questionId");

-- CreateIndex
CREATE INDEX "CampaignScholarshipTier_campaignId_idx" ON "CampaignScholarshipTier"("campaignId");

-- CreateIndex
CREATE UNIQUE INDEX "CampaignScholarshipTier_campaignId_tier_key" ON "CampaignScholarshipTier"("campaignId", "tier");

-- CreateIndex
CREATE INDEX "CampaignEvaluationStage_campaignId_idx" ON "CampaignEvaluationStage"("campaignId");

-- CreateIndex
CREATE UNIQUE INDEX "CampaignEvaluationStage_campaignId_stage_key" ON "CampaignEvaluationStage"("campaignId", "stage");

-- CreateIndex
CREATE UNIQUE INDEX "CampaignEvaluationStage_campaignId_sortOrder_key" ON "CampaignEvaluationStage"("campaignId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Applicant_applicationNumber_key" ON "Applicant"("applicationNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Applicant_accessToken_key" ON "Applicant"("accessToken");

-- CreateIndex
CREATE INDEX "Applicant_campaignId_idx" ON "Applicant"("campaignId");

-- CreateIndex
CREATE INDEX "Applicant_status_idx" ON "Applicant"("status");

-- CreateIndex
CREATE INDEX "Applicant_applicationNumber_idx" ON "Applicant"("applicationNumber");

-- CreateIndex
CREATE INDEX "Applicant_email_idx" ON "Applicant"("email");

-- CreateIndex
CREATE INDEX "Applicant_createdAt_idx" ON "Applicant"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Applicant_campaignId_email_key" ON "Applicant"("campaignId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "ApplicantTestSession_applicantId_key" ON "ApplicantTestSession"("applicantId");

-- CreateIndex
CREATE INDEX "ApplicantTestSession_campaignId_idx" ON "ApplicantTestSession"("campaignId");

-- CreateIndex
CREATE INDEX "ApplicantTestSession_status_idx" ON "ApplicantTestSession"("status");

-- CreateIndex
CREATE INDEX "ApplicantAnswer_sessionId_idx" ON "ApplicantAnswer"("sessionId");

-- CreateIndex
CREATE INDEX "ApplicantAnswer_campaignQuestionId_idx" ON "ApplicantAnswer"("campaignQuestionId");

-- CreateIndex
CREATE UNIQUE INDEX "ApplicantAnswer_sessionId_campaignQuestionId_key" ON "ApplicantAnswer"("sessionId", "campaignQuestionId");

-- CreateIndex
CREATE UNIQUE INDEX "ApplicantAnswerGrade_applicantAnswerId_key" ON "ApplicantAnswerGrade"("applicantAnswerId");

-- CreateIndex
CREATE INDEX "ApplicantAnswerGrade_gradedBy_idx" ON "ApplicantAnswerGrade"("gradedBy");

-- CreateIndex
CREATE INDEX "ApplicantAnswerGrade_isReviewed_idx" ON "ApplicantAnswerGrade"("isReviewed");

-- CreateIndex
CREATE UNIQUE INDEX "ApplicantResult_applicantId_key" ON "ApplicantResult"("applicantId");

-- CreateIndex
CREATE INDEX "ApplicantResult_campaignId_idx" ON "ApplicantResult"("campaignId");

-- CreateIndex
CREATE INDEX "ApplicantResult_percentage_idx" ON "ApplicantResult"("percentage");

-- CreateIndex
CREATE INDEX "ApplicantResult_rank_idx" ON "ApplicantResult"("rank");

-- CreateIndex
CREATE INDEX "ApplicantResult_isPassed_idx" ON "ApplicantResult"("isPassed");

-- CreateIndex
CREATE UNIQUE INDEX "ApplicantScholarship_applicantId_key" ON "ApplicantScholarship"("applicantId");

-- CreateIndex
CREATE INDEX "ApplicantScholarship_campaignId_idx" ON "ApplicantScholarship"("campaignId");

-- CreateIndex
CREATE INDEX "ApplicantScholarship_tier_idx" ON "ApplicantScholarship"("tier");

-- CreateIndex
CREATE INDEX "ApplicantScholarship_isAccepted_idx" ON "ApplicantScholarship"("isAccepted");

-- CreateIndex
CREATE INDEX "AdmissionDecisionRecord_applicantId_idx" ON "AdmissionDecisionRecord"("applicantId");

-- CreateIndex
CREATE INDEX "AdmissionDecisionRecord_campaignId_idx" ON "AdmissionDecisionRecord"("campaignId");

-- CreateIndex
CREATE INDEX "AdmissionDecisionRecord_decision_idx" ON "AdmissionDecisionRecord"("decision");

-- CreateIndex
CREATE INDEX "AdmissionDecisionRecord_decidedAt_idx" ON "AdmissionDecisionRecord"("decidedAt");

-- AddForeignKey
ALTER TABLE "TestCampaign" ADD CONSTRAINT "TestCampaign_academicSessionId_fkey" FOREIGN KEY ("academicSessionId") REFERENCES "AcademicSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestCampaign" ADD CONSTRAINT "TestCampaign_targetClassId_fkey" FOREIGN KEY ("targetClassId") REFERENCES "Class"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestCampaign" ADD CONSTRAINT "TestCampaign_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignQuestion" ADD CONSTRAINT "CampaignQuestion_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "TestCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignQuestion" ADD CONSTRAINT "CampaignQuestion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignScholarshipTier" ADD CONSTRAINT "CampaignScholarshipTier_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "TestCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignEvaluationStage" ADD CONSTRAINT "CampaignEvaluationStage_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "TestCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Applicant" ADD CONSTRAINT "Applicant_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "TestCampaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicantTestSession" ADD CONSTRAINT "ApplicantTestSession_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "Applicant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicantAnswer" ADD CONSTRAINT "ApplicantAnswer_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ApplicantTestSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicantAnswer" ADD CONSTRAINT "ApplicantAnswer_campaignQuestionId_fkey" FOREIGN KEY ("campaignQuestionId") REFERENCES "CampaignQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicantAnswer" ADD CONSTRAINT "ApplicantAnswer_selectedOptionId_fkey" FOREIGN KEY ("selectedOptionId") REFERENCES "McqOption"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicantAnswerGrade" ADD CONSTRAINT "ApplicantAnswerGrade_applicantAnswerId_fkey" FOREIGN KEY ("applicantAnswerId") REFERENCES "ApplicantAnswer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicantAnswerGrade" ADD CONSTRAINT "ApplicantAnswerGrade_graderId_fkey" FOREIGN KEY ("graderId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicantResult" ADD CONSTRAINT "ApplicantResult_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "Applicant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicantResult" ADD CONSTRAINT "ApplicantResult_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "TestCampaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicantScholarship" ADD CONSTRAINT "ApplicantScholarship_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "Applicant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicantScholarship" ADD CONSTRAINT "ApplicantScholarship_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "TestCampaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicantScholarship" ADD CONSTRAINT "ApplicantScholarship_tierId_fkey" FOREIGN KEY ("tierId") REFERENCES "CampaignScholarshipTier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicantScholarship" ADD CONSTRAINT "ApplicantScholarship_awardedById_fkey" FOREIGN KEY ("awardedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdmissionDecisionRecord" ADD CONSTRAINT "AdmissionDecisionRecord_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "Applicant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdmissionDecisionRecord" ADD CONSTRAINT "AdmissionDecisionRecord_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "TestCampaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdmissionDecisionRecord" ADD CONSTRAINT "AdmissionDecisionRecord_assignedClassId_fkey" FOREIGN KEY ("assignedClassId") REFERENCES "Class"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdmissionDecisionRecord" ADD CONSTRAINT "AdmissionDecisionRecord_assignedSectionId_fkey" FOREIGN KEY ("assignedSectionId") REFERENCES "Section"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdmissionDecisionRecord" ADD CONSTRAINT "AdmissionDecisionRecord_decidedById_fkey" FOREIGN KEY ("decidedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
