# ExamCore - AI Grading System Design

## Overview

The AI Grading System is the core differentiator of ExamCore. It uses LLMs to evaluate subjective answers (short and long answers) against model answers and rubrics, producing scores, feedback, and confidence ratings.

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│              EXAM SUBMISSION                      │
│  Student submits exam → Grading Queue            │
└──────────────────┬──────────────────────────────┘
                   │
          ┌────────┴────────┐
          │   BullMQ Queue   │
          │  (grading-queue) │
          └────────┬────────┘
                   │
    ┌──────────────┼──────────────┐
    │              │              │
    ▼              ▼              ▼
┌────────┐  ┌──────────┐  ┌──────────┐
│  MCQ    │  │  Short   │  │  Long    │
│ Grader  │  │  Answer  │  │  Answer  │
│(instant)│  │ AI Grader│  │ AI Grader│
└────┬───┘  └────┬─────┘  └────┬─────┘
     │           │              │
     │    ┌──────┴──────┐      │
     │    │  Vercel AI   │     │
     │    │  SDK → OpenAI│     │
     │    └──────┬──────┘     │
     │           │             │
     └─────┬─────┴─────────────┘
           │
    ┌──────┴──────┐
    │  Save Grades │
    │  to Database │
    └──────┬──────┘
           │
    ┌──────┴──────┐
    │  All Graded? │──No──→ Wait for remaining
    └──────┬──────┘
           │ Yes
    ┌──────┴──────┐
    │  Calculate   │
    │  Final Result│
    └──────┬──────┘
           │
    ┌──────┴──────┐
    │  Notify      │
    │  Student     │
    └─────────────┘
```

---

## Grading Pipeline — Step by Step

### Step 1: Submission Received
```typescript
// When student submits exam:
1. Mark ExamSession status → GRADING
2. Dispatch MCQ grading (synchronous — instant)
3. Queue AI grading jobs for each short/long answer
4. Return confirmation to student
```

### Step 2: MCQ Grading (Synchronous)
```typescript
// For each MCQ answer:
1. Compare selectedOptionId with Question.McqOptions where isCorrect=true
2. Match → full marks, No match → 0 marks
3. Save AnswerGrade with gradedBy=SYSTEM
4. No AI involvement — purely deterministic
```

### Step 3: AI Grading — Short Answers

#### Prompt Engineering Strategy
```
SYSTEM PROMPT:
You are an expert examiner grading student answers for a school exam.
You must evaluate the answer strictly based on the provided model answer
and grading criteria.

Be fair, consistent, and provide constructive feedback.
Grade on a scale from 0 to {maxMarks}.

CONTEXT:
- Subject: {subjectName}
- Question: {questionText}
- Maximum Marks: {maxMarks}
- Model Answer: {modelAnswer}
- Difficulty: {difficulty}

STUDENT ANSWER:
{studentAnswer}

GRADING CRITERIA:
- Accuracy of key concepts (40%)
- Completeness of answer (30%)
- Clarity of expression (20%)
- Use of relevant terminology (10%)

RESPOND IN THIS EXACT JSON FORMAT:
{
  "marksAwarded": <number>,
  "maxMarks": <number>,
  "feedback": "<constructive feedback for the student>",
  "reasoning": "<your internal reasoning for the grade — NOT shown to student>",
  "confidence": <number between 0.0 and 1.0>,
  "keyMatchedConcepts": ["concept1", "concept2"],
  "missingConcepts": ["concept1"]
}
```

#### Structured Output with Zod
```typescript
const shortAnswerGradeSchema = z.object({
  marksAwarded: z.number().min(0),
  maxMarks: z.number().positive(),
  feedback: z.string().min(10).max(500),
  reasoning: z.string().min(10).max(500),
  confidence: z.number().min(0).max(1),
  keyMatchedConcepts: z.array(z.string()),
  missingConcepts: z.array(z.string()),
});
```

### Step 4: AI Grading — Long Answers

#### Rubric-Based Prompt Strategy
```
SYSTEM PROMPT:
You are an expert examiner grading a long-form student answer.
Grade strictly based on the rubric provided. Assign marks per criterion.

CONTEXT:
- Subject: {subjectName}
- Question: {questionText}
- Maximum Marks: {maxMarks}
- Model Answer: {modelAnswer}

RUBRIC:
{rubricCriteria — dynamically built from question's gradingRubric JSON}

Example Rubric:
[
  { "criterion": "Content Accuracy",   "weight": 40, "description": "..." },
  { "criterion": "Argumentation",       "weight": 25, "description": "..." },
  { "criterion": "Structure & Flow",    "weight": 20, "description": "..." },
  { "criterion": "Language & Grammar",  "weight": 15, "description": "..." }
]

STUDENT ANSWER:
{studentAnswer}

RESPOND IN THIS EXACT JSON FORMAT:
{
  "criterionGrades": [
    {
      "criterion": "Content Accuracy",
      "maxWeight": 40,
      "awardedWeight": <number>,
      "comment": "<specific feedback for this criterion>"
    },
    ...
  ],
  "totalMarksAwarded": <number>,
  "maxMarks": <number>,
  "overallFeedback": "<comprehensive feedback>",
  "reasoning": "<internal reasoning>",
  "confidence": <number 0.0-1.0>,
  "strengths": ["strength1", "strength2"],
  "improvements": ["area1", "area2"]
}
```

#### Structured Output with Zod
```typescript
const longAnswerGradeSchema = z.object({
  criterionGrades: z.array(z.object({
    criterion: z.string(),
    maxWeight: z.number(),
    awardedWeight: z.number().min(0),
    comment: z.string(),
  })),
  totalMarksAwarded: z.number().min(0),
  maxMarks: z.number().positive(),
  overallFeedback: z.string().min(20).max(1000),
  reasoning: z.string().min(10).max(500),
  confidence: z.number().min(0).max(1),
  strengths: z.array(z.string()),
  improvements: z.array(z.string()),
});
```

---

## Confidence Score System

| Confidence Range | Action                                      | UI Display           |
| ---------------- | -------------------------------------------- | -------------------- |
| 0.85 - 1.00     | Auto-accept, no teacher review needed        | Green badge          |
| 0.60 - 0.84     | Accept but flag for optional review          | Yellow badge         |
| 0.00 - 0.59     | Flag for mandatory teacher review            | Red badge            |

### Confidence Threshold Configuration
```typescript
const AI_GRADING_CONFIG = {
  autoAcceptThreshold: 0.85,
  reviewRecommendedThreshold: 0.60,
  mandatoryReviewThreshold: 0.60,
  maxRetries: 3,
  retryDelay: 2000, // ms
  timeout: 30000, // ms per grading request
};
```

---

## Model Selection Strategy

| Question Type  | Default Model      | Fallback Model     | Trigger Fallback When        |
| -------------- | ------------------ | ------------------ | ---------------------------- |
| Short Answer   | GPT-4o-mini        | GPT-4o             | Confidence < 0.5 on retry   |
| Long Answer    | GPT-4o-mini        | GPT-4o             | Confidence < 0.5 on retry   |

### Cost Estimation (per exam with 10 short + 5 long answers)
```
Short Answer (GPT-4o-mini):
  ~500 input tokens × 10 = 5,000 tokens
  ~200 output tokens × 10 = 2,000 tokens
  Cost: ~$0.001

Long Answer (GPT-4o-mini):
  ~1,000 input tokens × 5 = 5,000 tokens
  ~400 output tokens × 5 = 2,000 tokens
  Cost: ~$0.001

Total per student exam: ~$0.002
Per class of 40 students: ~$0.08
Per 500 students: ~$1.00
```

---

## Error Handling & Retry Strategy

```
┌──────────────────┐
│   AI Grading     │
│   Request        │
└────────┬─────────┘
         │
   ┌─────┴─────┐
   │  Success?  │──Yes──→ Save grade
   └─────┬─────┘
         │ No
   ┌─────┴─────┐
   │ Retry #1  │──Success──→ Save grade
   │ (2s delay) │
   └─────┬─────┘
         │ Fail
   ┌─────┴─────┐
   │ Retry #2  │──Success──→ Save grade
   │ (4s delay) │
   └─────┬─────┘
         │ Fail
   ┌─────┴─────┐
   │ Retry #3  │──Success──→ Save grade
   │ (GPT-4o)  │
   └─────┬─────┘
         │ Fail
   ┌─────┴──────────┐
   │ Mark as FAILED  │
   │ Flag for manual │
   │ teacher grading  │
   └─────────────────┘
```

### Error Types & Handling

| Error Type          | Action                                    |
| ------------------- | ----------------------------------------- |
| Rate Limit (429)    | Exponential backoff, retry after delay    |
| Timeout             | Retry with same model                     |
| Invalid Response    | Retry (structured output parse failure)   |
| API Error (500)     | Retry up to 3 times, then mark failed     |
| Low Confidence      | Retry with GPT-4o, then flag for review   |
| All Retries Failed  | Flag for manual teacher grading           |

---

## Queue Configuration

```typescript
// BullMQ Queue Setup
const gradingQueue = new Queue('grading-queue', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 5000 },
  },
});

// Job Priority
// 1 = highest priority
const PRIORITIES = {
  MCQ_GRADING: 1,          // Instant
  SHORT_ANSWER: 3,         // Normal
  LONG_ANSWER: 5,          // Lower
  RESULT_CALCULATION: 2,   // After grading
  NOTIFICATION: 4,         // After result
};

// Rate Limiting
const RATE_LIMIT = {
  max: 50,           // Max 50 AI calls per minute
  duration: 60000,   // 1 minute window
};

// Concurrency
const WORKER_CONCURRENCY = 5; // Process 5 jobs simultaneously
```

---

## Teacher Review Interface

### AI Grade Review Flow
```
1. Teacher opens "Grades to Review" dashboard
2. Sees list filtered by confidence level
3. For each answer:
   a. Sees student answer
   b. Sees model answer / rubric
   c. Sees AI grade, feedback, and confidence
   d. Sees AI reasoning (hidden from student)
   e. Can: Approve / Override / Request Regrade
4. On Override:
   a. Teacher provides new marks
   b. Teacher provides updated feedback
   c. Original AI grade preserved in audit log
5. On Approve:
   a. Grade marked as reviewed
   b. isReviewed = true
```

---

## Prompt Versioning Strategy

```
prompts/
├── v1/
│   ├── short-answer-grading.prompt.ts
│   └── long-answer-grading.prompt.ts
├── v2/
│   ├── short-answer-grading.prompt.ts
│   └── long-answer-grading.prompt.ts
└── index.ts (exports active version)
```

- Each prompt version is a typed template function
- Active version configured via environment variable
- A/B testing possible by routing % traffic to different versions
- All prompt changes are git-tracked and reviewable

---

## Safety & Quality Guards

1. **Input Sanitization**: Strip HTML/scripts from student answers before sending to AI
2. **Token Limits**: Cap input length to prevent cost overruns (max 4000 chars)
3. **Response Validation**: Zod schema validation on every AI response
4. **Score Boundary Check**: `marksAwarded` must be between 0 and `maxMarks`
5. **Empty Answer Handling**: Skip AI for empty answers → 0 marks
6. **Duplicate Prevention**: Idempotent grading — don't re-grade already graded answers
7. **Cost Tracking**: Log token usage per grading request for cost monitoring
8. **Audit Trail**: Every grade (AI and manual) logged with full metadata
