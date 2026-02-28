# Admission Test & Scholarship Test — Grading Integration

> **Date:** February 28, 2026
> **Scope:** Reusing existing grading engine, negative marking, admission-specific grading flow

---

## 1. Existing Grading Architecture (What We Have)

### Current 3-Tier Grading System

```
Tier 1: MCQ Auto-Grading (autoGradeMcqAnswers)
├── Deterministic — compare selectedOptionId with isCorrect flag
├── Instant — runs synchronously after exam submission
└── Location: src/modules/grading/grading-engine.ts

Tier 2: AI Grading (gradeWithAI)
├── Short Answer — 4 criteria: accuracy, completeness, terminology, understanding
├── Long Answer — 5 dimensions: content, analysis, organization, language, evidence
├── Uses Vercel AI SDK generateObject() with gpt-4o-mini
└── Location: src/modules/grading/ai-grading-engine.ts

Tier 3: Manual Teacher Grading
├── Teacher reviews AI grades → approve/override
├── Batch approval for MCQ (auto-approve all)
└── Location: src/modules/grading/components/
```

### Current Grading Engine Interface

```typescript
// grading-engine.ts — existing functions

export async function autoGradeMcqAnswers(
  examId: string,
  sessionId: string,
  studentId: string
): Promise<void>

export async function gradeWithAI(
  answerId: string
): Promise<GradeResult>

export async function calculateExamResult(
  examId: string,
  studentId: string,
  sessionId: string
): Promise<ExamResult>
```

---

## 2. Integration Strategy — Shared Grading Core

### Principle: Single Grading Engine, Two Entry Points

```
Instead of duplicating grading logic, we create an ADAPTER pattern:

                 ┌──────────────────────┐
                 │   Grading Core       │
                 │   (shared logic)     │
                 ├──────────────────────┤
                 │ • MCQ auto-grade     │
                 │ • AI grading         │
                 │ • Score calculation   │
                 │ • Grade letters      │
                 └────────┬─────────────┘
                          │
              ┌───────────┴───────────┐
              │                       │
     ┌────────┴────────┐    ┌────────┴────────┐
     │ Exam Grading    │    │ Admission       │
     │ Adapter         │    │ Grading Adapter │
     │                 │    │                 │
     │ StudentAnswer   │    │ ApplicantAnswer │
     │ AnswerGrade     │    │ ApplicantGrade  │
     │ ExamResult      │    │ ApplicantResult │
     └─────────────────┘    └─────────────────┘
```

### Shared Core Module

```typescript
// src/modules/grading/grading-core.ts — NEW shared file

import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';

// ─── MCQ Grading (Pure Logic) ────────────────────────

export interface McqAnswer {
  questionId: string;
  selectedOptionId: string | null;
  correctOptionId: string;
  marks: number;
}

export interface McqGradeResult {
  questionId: string;
  isCorrect: boolean;
  marksAwarded: number;
}

export function gradeMcqAnswers(
  answers: McqAnswer[],
  options?: { negativeMarking?: boolean; negativeMarkPerWrong?: number }
): McqGradeResult[] {
  return answers.map(answer => {
    if (!answer.selectedOptionId) {
      // Unanswered — 0 marks (no negative marking for skipped)
      return { questionId: answer.questionId, isCorrect: false, marksAwarded: 0 };
    }
    
    const isCorrect = answer.selectedOptionId === answer.correctOptionId;
    
    let marksAwarded: number;
    if (isCorrect) {
      marksAwarded = answer.marks;
    } else if (options?.negativeMarking && options.negativeMarkPerWrong) {
      marksAwarded = -options.negativeMarkPerWrong;
    } else {
      marksAwarded = 0;
    }
    
    return { questionId: answer.questionId, isCorrect, marksAwarded };
  });
}

// ─── AI Grading (Pure Logic) ─────────────────────────

export interface SubjectiveAnswer {
  questionId: string;
  questionText: string;
  questionType: 'SHORT_ANSWER' | 'LONG_ANSWER';
  maxMarks: number;
  textAnswer: string;
  rubric?: string;
  modelAnswerKey?: string;
}

export interface AiGradeResult {
  questionId: string;
  marksAwarded: number;
  feedback: string;
  criteria: Record<string, { score: number; maxScore: number; feedback: string }>;
  confidence: number;
}

export async function gradeSubjectiveAnswer(
  answer: SubjectiveAnswer,
  model: string = 'gpt-4o-mini'
): Promise<AiGradeResult> {
  // Reuses existing prompt templates from ai-grading-prompts.ts
  // But is now model-agnostic and adapter-agnostic
  
  const prompt = answer.questionType === 'SHORT_ANSWER'
    ? buildShortAnswerPrompt(answer)
    : buildLongAnswerPrompt(answer);
  
  const result = await generateObject({
    model: openai(model),
    prompt,
    schema: answer.questionType === 'SHORT_ANSWER'
      ? shortAnswerGradeSchema
      : longAnswerGradeSchema,
  });
  
  return {
    questionId: answer.questionId,
    marksAwarded: result.object.totalMarks,
    feedback: result.object.overallFeedback,
    criteria: result.object.criteria,
    confidence: result.object.confidence,
  };
}

// ─── Score Calculation (Pure Logic) ──────────────────

export interface ScoreInput {
  totalMarks: number;
  passingMarks: number;
  grades: { questionId: string; marksAwarded: number }[];
}

export interface ScoreOutput {
  totalMarksObtained: number;
  percentage: number;
  isPassed: boolean;
  gradeLetter: string;
}

export function calculateScore(input: ScoreInput): ScoreOutput {
  const totalMarksObtained = input.grades.reduce(
    (sum, g) => sum + g.marksAwarded,
    0
  );
  
  // Floor negative total to 0 (if negative marking pushes below 0)
  const clampedMarks = Math.max(0, totalMarksObtained);
  const percentage = (clampedMarks / input.totalMarks) * 100;
  const isPassed = clampedMarks >= input.passingMarks;
  const gradeLetter = getGradeLetter(percentage);
  
  return {
    totalMarksObtained: clampedMarks,
    percentage: Math.round(percentage * 100) / 100, // 2 decimal places
    isPassed,
    gradeLetter,
  };
}

function getGradeLetter(percentage: number): string {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B';
  if (percentage >= 60) return 'C';
  if (percentage >= 50) return 'D';
  return 'F';
}
```

---

## 3. Admission Grading Adapter

```typescript
// src/modules/admissions/admission-grading.ts

import { prisma } from '@/lib/prisma';
import {
  gradeMcqAnswers,
  gradeSubjectiveAnswer,
  calculateScore,
  type McqAnswer,
  type SubjectiveAnswer,
  type ScoreOutput,
} from '@/modules/grading/grading-core';

// ─── Auto-Grade MCQs After Test Submission ───────────

export async function autoGradeAdmissionMcqs(
  sessionId: string
): Promise<{ graded: number; total: number }> {
  const session = await prisma.applicantTestSession.findUnique({
    where: { id: sessionId },
    include: {
      campaign: true,
      answers: {
        where: { question: { type: 'MCQ' } },
        include: {
          question: {
            include: { options: true }
          },
          campaignQuestion: true,
        }
      }
    }
  });
  
  if (!session) throw new Error('Session not found');
  
  // Map to grading core format
  const mcqAnswers: McqAnswer[] = session.answers.map(answer => {
    const correctOption = answer.question.options.find(o => o.isCorrect);
    return {
      questionId: answer.questionId,
      selectedOptionId: answer.selectedOptionId,
      correctOptionId: correctOption?.id ?? '',
      marks: Number(answer.campaignQuestion.marks),
    };
  });
  
  // Grade using shared core — WITH negative marking support
  const results = gradeMcqAnswers(mcqAnswers, {
    negativeMarking: session.campaign.hasNegativeMarking,
    negativeMarkPerWrong: session.campaign.negativeMarkPerWrong
      ? Number(session.campaign.negativeMarkPerWrong)
      : undefined,
  });
  
  // Persist grades
  await prisma.$transaction(
    results.map(result =>
      prisma.applicantAnswerGrade.upsert({
        where: {
          answerId: session.answers.find(a => a.questionId === result.questionId)!.id,
        },
        create: {
          answerId: session.answers.find(a => a.questionId === result.questionId)!.id,
          marksAwarded: result.marksAwarded,
          isCorrect: result.isCorrect,
          gradedBy: 'SYSTEM',
          gradedAt: new Date(),
        },
        update: {
          marksAwarded: result.marksAwarded,
          isCorrect: result.isCorrect,
        },
      })
    )
  );
  
  return { graded: results.length, total: session.answers.length };
}

// ─── AI Grade Subjective Answers ─────────────────────

export async function aiGradeAdmissionSubjective(
  sessionId: string
): Promise<{ graded: number }> {
  const session = await prisma.applicantTestSession.findUnique({
    where: { id: sessionId },
    include: {
      answers: {
        where: { question: { type: { in: ['SHORT_ANSWER', 'LONG_ANSWER'] } } },
        include: {
          question: true,
          campaignQuestion: true,
        }
      }
    }
  });
  
  if (!session) throw new Error('Session not found');
  
  let graded = 0;
  
  for (const answer of session.answers) {
    if (!answer.textAnswer) continue; // Skip unanswered
    
    const input: SubjectiveAnswer = {
      questionId: answer.questionId,
      questionText: answer.question.text,
      questionType: answer.question.type as 'SHORT_ANSWER' | 'LONG_ANSWER',
      maxMarks: Number(answer.campaignQuestion.marks),
      textAnswer: answer.textAnswer,
      modelAnswerKey: answer.question.modelAnswer ?? undefined,
    };
    
    const result = await gradeSubjectiveAnswer(input);
    
    await prisma.applicantAnswerGrade.upsert({
      where: { answerId: answer.id },
      create: {
        answerId: answer.id,
        marksAwarded: result.marksAwarded,
        feedback: result.feedback,
        criteria: result.criteria,
        confidence: result.confidence,
        gradedBy: 'AI',
        gradedAt: new Date(),
      },
      update: {
        marksAwarded: result.marksAwarded,
        feedback: result.feedback,
        criteria: result.criteria,
        confidence: result.confidence,
      },
    });
    
    graded++;
  }
  
  return { graded };
}

// ─── Calculate Final Result ──────────────────────────

export async function calculateAdmissionResult(
  sessionId: string
): Promise<ScoreOutput> {
  const session = await prisma.applicantTestSession.findUnique({
    where: { id: sessionId },
    include: {
      campaign: true,
      applicant: true,
      answers: {
        include: { grade: true, campaignQuestion: true }
      }
    }
  });
  
  if (!session) throw new Error('Session not found');
  
  // Check all answers are graded
  const ungradedCount = session.answers.filter(a => !a.grade).length;
  if (ungradedCount > 0) {
    throw new Error(`${ungradedCount} answers still ungraded`);
  }
  
  // Calculate score using shared core
  const score = calculateScore({
    totalMarks: Number(session.campaign.totalMarks),
    passingMarks: Number(session.campaign.passingMarks),
    grades: session.answers.map(a => ({
      questionId: a.questionId,
      marksAwarded: Number(a.grade!.marksAwarded),
    })),
  });
  
  // Additional admission-specific metrics
  const correctCount = session.answers.filter(a => a.grade?.isCorrect).length;
  const timeTaken = session.submittedAt && session.startedAt
    ? Math.floor((session.submittedAt.getTime() - session.startedAt.getTime()) / 1000)
    : null;
  
  // Persist result
  await prisma.applicantResult.upsert({
    where: { applicantId_campaignId: {
      applicantId: session.applicantId,
      campaignId: session.campaignId,
    }},
    create: {
      applicantId: session.applicantId,
      campaignId: session.campaignId,
      sessionId: session.id,
      totalMarksObtained: score.totalMarksObtained,
      percentage: score.percentage,
      isPassed: score.isPassed,
      gradeLetter: score.gradeLetter,
      totalQuestions: session.answers.length,
      correctAnswers: correctCount,
      wrongAnswers: session.answers.length - correctCount,
      timeTakenSeconds: timeTaken,
    },
    update: {
      totalMarksObtained: score.totalMarksObtained,
      percentage: score.percentage,
      isPassed: score.isPassed,
      gradeLetter: score.gradeLetter,
      correctAnswers: correctCount,
      wrongAnswers: session.answers.length - correctCount,
    },
  });
  
  return score;
}
```

---

## 4. Negative Marking Implementation

### Rules

```
Negative marking is ADMISSION-SPECIFIC — the existing exam system does NOT have it.

Rules:
1. Only applies if campaign.hasNegativeMarking = true
2. Only for MCQ questions — subjective answers never get negative marks
3. Unanswered questions = 0 marks (NOT negative)
4. Negative marks per wrong answer = campaign.negativeMarkPerWrong (e.g., 0.25)
5. Total score cannot go below 0 (clamped at 0)
```

### Example Calculation

```
Campaign: 50 MCQs, 2 marks each = 100 total marks
Negative marking: 0.5 per wrong answer
Passing: 40 marks

Student answers:
- 35 correct = +70.0
- 10 wrong   = -5.0
- 5 skipped  = 0.0
─────────────────────
Total = 65.0 marks
Percentage = 65.0%
Passed: ✓ (≥40)
```

### Edge Case: Total Goes Negative

```
Student answers:
- 5 correct  = +10.0
- 40 wrong   = -20.0
- 5 skipped  = 0.0
─────────────────────
Raw total = -10.0
Clamped total = 0.0  ← Floor at 0
Percentage = 0%
Passed: ✗
```

---

## 5. Complete Grading Pipeline

### Admission Test Grading Flow

```
Test Submitted
│
├─→ Step 1: Auto-Grade MCQs (INSTANT)
│   └─ autoGradeAdmissionMcqs(sessionId)
│   └─ Creates ApplicantAnswerGrade records for MCQ answers
│
├─→ Step 2: AI Grade Subjective (ASYNC, 2-5 min)
│   └─ aiGradeAdmissionSubjective(sessionId)
│   └─ Creates ApplicantAnswerGrade records for SHORT/LONG answers
│   └─ Can be batched for all applicants in a campaign
│
├─→ Step 3: Manual Review (OPTIONAL)
│   └─ Admin reviews flagged/low-confidence AI grades
│   └─ Override with manual marks + feedback
│
├─→ Step 4: Calculate Result (after all graded)
│   └─ calculateAdmissionResult(sessionId)
│   └─ Creates ApplicantResult record
│
├─→ Step 5: Generate Rankings (per campaign)
│   └─ generateMeritRankings(campaignId)
│   └─ Assigns rank to each ApplicantResult
│
└─→ Step 6: Auto-Assign Scholarships (if applicable)
    └─ autoAssignScholarships(campaignId)
    └─ Creates ApplicantScholarship records
```

### Batch Grading Action

```typescript
// For campaigns with many applicants, grade in batch

export async function batchGradeAdmissionCampaign(
  campaignId: string
): Promise<{
  totalSessions: number;
  mcqGraded: number;
  subjectiveGraded: number;
  resultsCalculated: number;
}> {
  const sessions = await prisma.applicantTestSession.findMany({
    where: { campaignId, status: 'COMPLETED' },
  });
  
  let mcqGraded = 0;
  let subjectiveGraded = 0;
  let resultsCalculated = 0;
  
  for (const session of sessions) {
    try {
      // Step 1: MCQ auto-grade
      const mcqResult = await autoGradeAdmissionMcqs(session.id);
      mcqGraded += mcqResult.graded;
      
      // Step 2: AI subjective (only if campaign has subjective questions)
      const subResult = await aiGradeAdmissionSubjective(session.id);
      subjectiveGraded += subResult.graded;
      
      // Step 3: Calculate result
      await calculateAdmissionResult(session.id);
      resultsCalculated++;
    } catch (error) {
      // Log error but continue with other sessions
      console.error(`Grading failed for session ${session.id}:`, error);
    }
  }
  
  // Step 4: Generate rankings after all results calculated
  await generateMeritRankings(campaignId);
  
  return { totalSessions: sessions.length, mcqGraded, subjectiveGraded, resultsCalculated };
}
```

### Merit Ranking Generation

```typescript
export async function generateMeritRankings(campaignId: string): Promise<void> {
  // Get all results ordered by percentage DESC, timeTaken ASC, correctAnswers DESC
  const results = await prisma.applicantResult.findMany({
    where: { campaignId },
    orderBy: [
      { percentage: 'desc' },
      { timeTakenSeconds: 'asc' },
      { correctAnswers: 'desc' },
    ]
  });
  
  // Assign ranks (handle ties — same score gets same rank)
  let currentRank = 1;
  let lastPercentage: number | null = null;
  let lastTime: number | null = null;
  
  const updates = results.map((result, index) => {
    const pct = Number(result.percentage);
    const time = result.timeTakenSeconds;
    
    if (pct !== lastPercentage || time !== lastTime) {
      currentRank = index + 1;
    }
    
    lastPercentage = pct;
    lastTime = time;
    
    return prisma.applicantResult.update({
      where: { id: result.id },
      data: { rank: currentRank },
    });
  });
  
  await prisma.$transaction(updates);
}
```

---

## 6. Migration of Existing Grading Code

### Refactoring Steps

```
STEP 1: Extract pure logic from grading-engine.ts → grading-core.ts
   - gradeMcqAnswers (pure function, no DB calls)
   - gradeSubjectiveAnswer (AI call, no DB calls)
   - calculateScore (pure function)

STEP 2: Modify existing grading-engine.ts to USE grading-core.ts
   - autoGradeMcqAnswers → calls gradeMcqAnswers + persists to AnswerGrade
   - gradeWithAI → calls gradeSubjectiveAnswer + persists to AnswerGrade
   - calculateExamResult → calls calculateScore + persists to ExamResult

STEP 3: Create admission-grading.ts adapters
   - autoGradeAdmissionMcqs → calls gradeMcqAnswers + persists to ApplicantAnswerGrade
   - aiGradeAdmissionSubjective → calls gradeSubjectiveAnswer + persists to ApplicantAnswerGrade
   - calculateAdmissionResult → calls calculateScore + persists to ApplicantResult

RESULT: Same grading logic, two persistence layers, zero code duplication.
```

### Backward Compatibility

The existing exam grading continues to work exactly as before. The refactoring is:
- **Non-breaking** — existing function signatures don't change
- **Additive** — new grading-core.ts is a new file
- **Testable** — pure functions in grading-core.ts can be unit tested without DB

---

## 7. Grading Dashboard (Admin View)

```
┌─────────────────────────────────────────────────────────────────────┐
│ Grading — Class 6 Admission Test 2026-27                            │
│                                                                      │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐               │
│ │ 234      │ │ 230      │ │ 4        │ │ 0        │               │
│ │ Total    │ │ Auto     │ │ Needs    │ │ Pending  │               │
│ │ Sessions │ │ Graded   │ │ Review   │ │ AI Grade │               │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘               │
│                                                                      │
│ [Run Batch Auto-Grade] [Run AI Grading] [Calculate All Results]     │
│                                                                      │
│ Answers Needing Review:                                              │
│ ┌──────────────┬────────────┬──────┬────────────┬──────────────┐   │
│ │ Applicant     │ Question   │ AI   │ Confidence │ Action       │   │
│ ├──────────────┼────────────┼──────┼────────────┼──────────────┤   │
│ │ Ahmad Ali    │ Q15: Desc..│ 7/10 │ 68%        │ [Review]     │   │
│ │ Sara Khan    │ Q22: Expl..│ 4/10 │ 45%        │ [Review]     │   │
│ └──────────────┴────────────┴──────┴────────────┴──────────────┘   │
│                                                                      │
│ Batch Progress: ████████████████████░░░░ 85% (198/234 graded)       │
└─────────────────────────────────────────────────────────────────────┘
```
