# ExamCore - API Design & Server Actions

## API Strategy

ExamCore uses a **hybrid approach**:
- **Server Actions** — For all mutations (create, update, delete) called from UI
- **API Route Handlers** — For operations needing HTTP semantics (webhooks, file uploads, external access)
- **Server Components** — For data fetching (read operations) directly in components

---

## Convention Standards

### Server Action Naming
```
[action][Entity]Action.ts
Examples: createExamAction.ts, updateQuestionAction.ts, deleteUserAction.ts
```

### API Route Naming
```
/api/[version]/[resource]/[action]
Examples: /api/v1/exams, /api/v1/questions/import
```

### Response Format (API Routes)
```typescript
// Success
{ success: true, data: T, meta?: { pagination } }

// Error
{ success: false, error: { code: string, message: string, details?: any } }
```

---

## Module: Auth

### Server Actions
| Action                  | Input                          | Output              | Description                    |
| ----------------------- | ------------------------------ | -------------------- | ------------------------------ |
| `loginAction`           | email, password                | Session + redirect   | Authenticate user              |
| `logoutAction`          | —                              | Redirect to login    | Clear session                  |
| `resetPasswordAction`   | email                          | Success message      | Send password reset email      |
| `changePasswordAction`  | currentPassword, newPassword   | Success message      | Change own password            |

---

## Module: User Management

### Server Actions
| Action                       | Input                          | Output         | Roles        |
| ---------------------------- | ------------------------------ | -------------- | ------------ |
| `createUserAction`           | userData, role                 | User           | Admin        |
| `updateUserAction`           | userId, updates                | User           | Admin        |
| `deleteUserAction`           | userId                         | Success        | Admin        |
| `toggleUserStatusAction`     | userId, isActive               | User           | Admin        |
| `bulkImportUsersAction`      | csvFile, role                  | ImportResult   | Admin        |
| `updateOwnProfileAction`     | profileData                    | User           | All          |

### API Routes
| Method | Route                          | Description                    | Roles  |
| ------ | ------------------------------ | ------------------------------ | ------ |
| GET    | `/api/v1/users`                | List users with filters        | Admin  |
| GET    | `/api/v1/users/[id]`           | Get user details               | Admin  |
| POST   | `/api/v1/users/import`         | Bulk import via CSV upload     | Admin  |
| GET    | `/api/v1/users/export`         | Export users to CSV            | Admin  |

---

## Module: Class & Section

### Server Actions
| Action                       | Input                    | Output     | Roles  |
| ---------------------------- | -------------------------| ---------- | ------ |
| `createClassAction`          | name, grade              | Class      | Admin  |
| `updateClassAction`          | classId, updates         | Class      | Admin  |
| `deleteClassAction`          | classId                  | Success    | Admin  |
| `createSectionAction`        | classId, name            | Section    | Admin  |
| `updateSectionAction`        | sectionId, updates       | Section    | Admin  |
| `deleteSectionAction`        | sectionId                | Success    | Admin  |
| `assignStudentToClassAction` | studentId, classId, sectionId | Success | Admin |

---

## Module: Subject & Department

### Server Actions
| Action                          | Input                        | Output    | Roles  |
| --------------------------------| ---------------------------- | --------- | ------ |
| `createDepartmentAction`        | name, description            | Dept      | Admin  |
| `updateDepartmentAction`        | deptId, updates              | Dept      | Admin  |
| `deleteDepartmentAction`        | deptId                       | Success   | Admin  |
| `createSubjectAction`           | name, code, deptId           | Subject   | Admin  |
| `updateSubjectAction`           | subjectId, updates           | Subject   | Admin  |
| `deleteSubjectAction`           | subjectId                    | Success   | Admin  |
| `assignTeacherToSubjectAction`  | teacherId, subjectId         | Success   | Admin  |
| `removeTeacherFromSubjectAction`| teacherId, subjectId         | Success   | Admin  |

---

## Module: Question Bank

### Server Actions
| Action                       | Input                              | Output       | Roles   |
| ---------------------------- | ---------------------------------- | ------------ | ------- |
| `createQuestionAction`       | questionData + options/rubric      | Question     | Teacher |
| `updateQuestionAction`       | questionId, updates                | Question     | Teacher |
| `deleteQuestionAction`       | questionId                         | Success      | Teacher |
| `duplicateQuestionAction`    | questionId                         | Question     | Teacher |
| `addTagToQuestionAction`     | questionId, tagId                  | Success      | Teacher |
| `removeTagFromQuestionAction`| questionId, tagId                  | Success      | Teacher |
| `createTagAction`            | name, category                     | Tag          | Teacher |

### API Routes
| Method | Route                              | Description                    | Roles   |
| ------ | ---------------------------------- | ------------------------------ | ------- |
| GET    | `/api/v1/questions`                | Search/filter questions         | Teacher |
| GET    | `/api/v1/questions/[id]`           | Get question details            | Teacher |
| POST   | `/api/v1/questions/import`         | Bulk import questions           | Teacher |
| GET    | `/api/v1/questions/export`         | Export questions to CSV          | Teacher |
| GET    | `/api/v1/tags`                     | List all tags                   | Teacher |

### Query Parameters (Question Search)
```
?subjectId=uuid
&type=MCQ|SHORT_ANSWER|LONG_ANSWER
&difficulty=EASY|MEDIUM|HARD
&tagIds=uuid1,uuid2
&search=keyword
&page=1
&limit=20
&sortBy=createdAt|usageCount|difficulty
&sortOrder=asc|desc
```

---

## Module: Exam Builder

### Server Actions
| Action                         | Input                           | Output   | Roles   |
| ------------------------------ | ------------------------------- | -------- | ------- |
| `createExamAction`             | examData                        | Exam     | Teacher |
| `updateExamAction`             | examId, updates                 | Exam     | Teacher |
| `deleteExamAction`             | examId                          | Success  | Teacher |
| `addQuestionToExamAction`      | examId, questionId, marks, order| ExamQ    | Teacher |
| `removeQuestionFromExamAction` | examQuestionId                  | Success  | Teacher |
| `reorderExamQuestionsAction`   | examId, orderedQuestionIds[]    | Success  | Teacher |
| `assignExamToClassAction`      | examId, classId, sectionId?     | Success  | Teacher |
| `unassignExamFromClassAction`  | assignmentId                    | Success  | Teacher |
| `publishExamAction`            | examId                          | Exam     | Teacher |
| `archiveExamAction`            | examId                          | Exam     | Teacher |
| `duplicateExamAction`          | examId                          | Exam     | Teacher |
| `autoGenerateExamAction`       | criteria (subject, difficulty, count) | Exam | Teacher |

---

## Module: Exam Session (Student)

### Server Actions
| Action                         | Input                           | Output       | Roles   |
| ------------------------------ | ------------------------------- | ------------ | ------- |
| `startExamSessionAction`       | examId                          | Session      | Student |
| `saveAnswerAction`             | sessionId, questionId, answer   | Answer       | Student |
| `markForReviewAction`          | sessionId, questionId, toggle   | Success      | Student |
| `submitExamAction`             | sessionId                       | Submission   | Student |

### API Routes
| Method | Route                                  | Description                  | Roles   |
| ------ | -------------------------------------- | ---------------------------- | ------- |
| GET    | `/api/v1/exams/available`              | List exams available to student | Student |
| GET    | `/api/v1/exams/[id]/session`           | Get current session state    | Student |
| POST   | `/api/v1/exams/[id]/auto-save`         | Bulk auto-save answers       | Student |

### Auto-Save Strategy
- Client sends bulk answer save every 60 seconds
- Debounced answer save on each question change (5 second delay)
- Session heartbeat every 30 seconds (detect disconnection)
- Server validates session is still active before saving

---

## Module: Grading Engine

### Server Actions
| Action                         | Input                        | Output     | Roles   |
| ------------------------------ | ---------------------------- | ---------- | ------- |
| `overrideGradeAction`          | answerId, newMarks, feedback | Grade      | Teacher |
| `approveAiGradeAction`         | answerId                     | Grade      | Teacher |
| `bulkApproveAiGradesAction`    | answerIds[]                  | Success    | Teacher |
| `requestRegradeAction`         | answerId                     | Grade      | Teacher |
| `publishResultAction`          | examId                       | Success    | Teacher |

### API Routes (Internal — called by queue workers)
| Method | Route                                  | Description                    |
| ------ | -------------------------------------- | ------------------------------ |
| POST   | `/api/v1/grading/process`              | Queue worker callback          |
| GET    | `/api/v1/grading/status/[sessionId]`   | Check grading progress         |

### Background Jobs (BullMQ)
| Queue Name          | Job Type              | Description                              |
| ------------------- | --------------------- | ---------------------------------------- |
| `grading-queue`     | `grade-mcq`           | Auto-grade MCQ answers (instant)         |
| `grading-queue`     | `grade-short-answer`  | AI grade short answer (priority: normal) |
| `grading-queue`     | `grade-long-answer`   | AI grade long answer (priority: low)     |
| `grading-queue`     | `calculate-result`    | Calculate final result after all graded  |
| `notification-queue`| `result-ready`        | Notify student when result ready         |

---

## Module: Results & Analytics

### Server Actions
| Action                          | Input               | Output        | Roles     |
| ------------------------------- | -------------------- | ------------- | --------- |
| `publishResultsAction`          | examId               | Success       | Teacher   |
| `generateRankingsAction`        | examId               | Rankings[]    | Teacher   |

### API Routes
| Method | Route                                  | Description                    | Roles           |
| ------ | -------------------------------------- | ------------------------------ | --------------- |
| GET    | `/api/v1/results/exam/[examId]`        | Get all results for an exam    | Teacher         |
| GET    | `/api/v1/results/student/[studentId]`  | Get student's all results      | Teacher/Student |
| GET    | `/api/v1/results/[resultId]`           | Get detailed result             | Teacher/Student |
| GET    | `/api/v1/results/[resultId]/export`    | Export result as PDF            | Teacher/Student |
| GET    | `/api/v1/analytics/exam/[examId]`      | Exam-level analytics            | Teacher         |
| GET    | `/api/v1/analytics/class/[classId]`    | Class-level analytics           | Teacher/Admin   |
| GET    | `/api/v1/analytics/dashboard`          | Dashboard overview stats        | All (role-filtered) |

---

## Module: Notifications

### Server Actions
| Action                     | Input            | Output    | Roles |
| -------------------------- | -----------------| --------- | ----- |
| `markNotificationReadAction` | notificationId | Success   | All   |
| `markAllReadAction`        | —                | Success   | All   |
| `deleteNotificationAction` | notificationId   | Success   | All   |

### API Routes
| Method | Route                              | Description                    | Roles |
| ------ | ---------------------------------- | ------------------------------ | ----- |
| GET    | `/api/v1/notifications`            | List user notifications         | All   |
| GET    | `/api/v1/notifications/unread-count` | Get unread count              | All   |

---

## Module: Settings

### Server Actions
| Action                          | Input               | Output      | Roles |
| ------------------------------- | -------------------- | ----------- | ----- |
| `updateSchoolSettingsAction`    | settingsData         | Settings    | Admin |
| `updateGradingScaleAction`     | gradingScale         | Settings    | Admin |
| `updateAcademicYearAction`     | year                 | Settings    | Admin |

---

## Validation Strategy

Every Server Action and API Route follows this pipeline:

```
Request → Auth Check → Role Check → Input Validation (Zod) → Service Call → Response
```

### Zod Schema Examples
```
schemas/
├── auth.schema.ts          (login, password schemas)
├── user.schema.ts          (create/update user schemas)
├── question.schema.ts      (create/update question schemas)
├── exam.schema.ts          (create/update exam schemas)
├── answer.schema.ts        (save answer, submit schemas)
├── grading.schema.ts       (override grade schemas)
└── settings.schema.ts      (school settings schemas)
```

Each schema file exports:
- Input schemas (for validation)
- Output schemas (for type inference)
- Partial schemas (for update operations)

---

## Rate Limiting

| Endpoint Category    | Limit               | Window   |
| -------------------- | -------------------- | -------- |
| Auth (login)         | 5 requests           | 15 min   |
| Password Reset       | 3 requests           | 1 hour   |
| AI Grading           | 100 requests         | 1 min    |
| File Upload          | 10 requests          | 1 min    |
| General API          | 100 requests         | 1 min    |
| Auto-save            | 60 requests          | 1 min    |
