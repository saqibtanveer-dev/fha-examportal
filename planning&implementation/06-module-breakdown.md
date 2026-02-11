# ExamCore - Module Breakdown & Service Layer Design

## Module Architecture Pattern

Every domain module follows this strict internal structure:

```
module-name/
├── components/          # UI components specific to this module
│   ├── ModuleList.tsx
│   ├── ModuleForm.tsx
│   └── ModuleCard.tsx
├── actions/             # Server Actions (mutations)
│   ├── create-module.action.ts
│   └── update-module.action.ts
├── services/            # Business logic (pure functions)
│   ├── module.service.ts
│   └── module-validation.service.ts
├── repositories/        # Database access (Prisma queries)
│   ├── module.repository.ts
│   └── module.queries.ts
├── schemas/             # Zod validation schemas
│   └── module.schema.ts
├── types/               # TypeScript type definitions
│   └── module.types.ts
├── hooks/               # React hooks (client-side)
│   └── use-module.ts
├── constants/           # Module-specific constants
│   └── module.constants.ts
└── utils/               # Module-specific utilities
    └── module.utils.ts
```

**RULE**: Each file MUST stay under 300 lines. Split further if needed.

---

## Module 1: Auth

### Responsibility
Handle all authentication flows — login, logout, sessions, password management.

### Files Breakdown

#### `services/auth.service.ts` (~80 lines)
```
- validateCredentials(email, password) → User | null
- createSession(userId) → Session
- destroySession(sessionId) → void
- hashPassword(password) → string
- verifyPassword(password, hash) → boolean
```

#### `services/password-reset.service.ts` (~60 lines)
```
- generateResetToken(email) → token
- validateResetToken(token) → userId
- resetPassword(token, newPassword) → void
```

#### `repositories/auth.repository.ts` (~50 lines)
```
- findUserByEmail(email) → User | null
- updateLastLogin(userId) → void
- updatePassword(userId, hash) → void
```

#### `schemas/auth.schema.ts` (~40 lines)
```
- loginSchema: { email, password }
- changePasswordSchema: { currentPassword, newPassword, confirmPassword }
- resetPasswordSchema: { email }
- newPasswordSchema: { token, password, confirmPassword }
```

#### `actions/login.action.ts` (~40 lines)
```
- loginAction(formData) → redirect or error
```

#### `actions/logout.action.ts` (~20 lines)
```
- logoutAction() → redirect to login
```

#### `actions/change-password.action.ts` (~40 lines)
```
- changePasswordAction(formData) → success or error
```

#### `components/LoginForm.tsx` (~80 lines)
#### `components/ChangePasswordForm.tsx` (~70 lines)
#### `components/ResetPasswordForm.tsx` (~60 lines)

---

## Module 2: User Management

### Responsibility
CRUD operations for admins, teachers, and students. Bulk import/export.

### Files Breakdown

#### `services/user.service.ts` (~100 lines)
```
- createUser(data, role) → User
- updateUser(userId, data) → User
- softDeleteUser(userId) → void
- toggleUserStatus(userId, isActive) → void
- getUserWithProfile(userId) → UserWithProfile
```

#### `services/user-import.service.ts` (~90 lines)
```
- parseCSV(file) → ParsedRow[]
- validateImportData(rows, role) → ValidationResult
- bulkCreateUsers(validRows) → ImportResult
- generateImportReport(result) → Report
```

#### `services/user-export.service.ts` (~50 lines)
```
- exportUsersToCSV(filters) → CSVBuffer
- formatUserForExport(user) → ExportRow
```

#### `repositories/user.repository.ts` (~90 lines)
```
- findMany(filters, pagination) → PaginatedUsers
- findById(id) → User | null
- findByEmail(email) → User | null
- create(data) → User
- update(id, data) → User
- softDelete(id) → void
- count(filters) → number
```

#### `repositories/student-profile.repository.ts` (~60 lines)
```
- findByUserId(userId) → StudentProfile
- create(data) → StudentProfile
- update(id, data) → StudentProfile
- findByClassAndSection(classId, sectionId?) → StudentProfile[]
```

#### `repositories/teacher-profile.repository.ts` (~50 lines)
```
- findByUserId(userId) → TeacherProfile
- create(data) → TeacherProfile
- update(id, data) → TeacherProfile
```

#### `schemas/user.schema.ts` (~80 lines)
```
- createUserSchema (with role-specific fields)
- updateUserSchema
- importUserSchema
- userFilterSchema
```

#### `components/UserTable.tsx` (~100 lines)
#### `components/UserForm.tsx` (~90 lines)
#### `components/UserCard.tsx` (~50 lines)
#### `components/UserImportDialog.tsx` (~80 lines)
#### `components/UserFilters.tsx` (~60 lines)

#### `hooks/use-users.ts` (~40 lines)
```
- useUsers(filters) → TanStack Query hook
- useUser(id) → Single user query
```

---

## Module 3: Class & Section

### Responsibility
Manage classes (grades) and their sections, student assignments.

### Files Breakdown

#### `services/class.service.ts` (~70 lines)
```
- createClass(data) → Class
- updateClass(classId, data) → Class
- deleteClass(classId) → void (with validation)
- getClassWithSections(classId) → ClassWithSections
- getClassStudentCount(classId) → number
```

#### `services/section.service.ts` (~60 lines)
```
- createSection(classId, data) → Section
- updateSection(sectionId, data) → Section
- deleteSection(sectionId) → void
- assignStudentToSection(studentId, sectionId) → void
```

#### `repositories/class.repository.ts` (~60 lines)
#### `repositories/section.repository.ts` (~50 lines)

#### `schemas/class.schema.ts` (~30 lines)
#### `components/ClassList.tsx` (~80 lines)
#### `components/ClassForm.tsx` (~60 lines)
#### `components/SectionManager.tsx` (~70 lines)

---

## Module 4: Subject & Department

### Responsibility
Manage academic departments, subjects, and teacher-subject assignments.

### Files Breakdown

#### `services/department.service.ts` (~50 lines)
#### `services/subject.service.ts` (~70 lines)
#### `services/teacher-assignment.service.ts` (~50 lines)

#### `repositories/department.repository.ts` (~40 lines)
#### `repositories/subject.repository.ts` (~60 lines)
#### `repositories/teacher-subject.repository.ts` (~40 lines)

#### `schemas/subject.schema.ts` (~40 lines)
#### `components/SubjectList.tsx` (~80 lines)
#### `components/SubjectForm.tsx` (~60 lines)
#### `components/TeacherAssignment.tsx` (~70 lines)
#### `components/DepartmentManager.tsx` (~60 lines)

---

## Module 5: Question Bank

### Responsibility
Create, manage, search, tag, and organize questions by type.

### Files Breakdown

#### `services/question.service.ts` (~100 lines)
```
- createQuestion(data) → Question
- updateQuestion(questionId, data) → Question
- deleteQuestion(questionId) → void
- duplicateQuestion(questionId) → Question
- incrementUsageCount(questionId) → void
```

#### `services/question-search.service.ts` (~70 lines)
```
- searchQuestions(filters, pagination) → PaginatedQuestions
- buildSearchQuery(filters) → PrismaQuery
- getQuestionsByIds(ids) → Questions[]
```

#### `services/tag.service.ts` (~50 lines)
```
- createTag(name, category) → Tag
- getTagsByCategory(category) → Tag[]
- assignTag(questionId, tagId) → void
- removeTag(questionId, tagId) → void
```

#### `services/question-import.service.ts` (~80 lines)
```
- parseQuestionCSV(file) → ParsedQuestion[]
- validateQuestionImport(questions) → ValidationResult
- bulkCreateQuestions(questions) → ImportResult
```

#### `repositories/question.repository.ts` (~90 lines)
#### `repositories/mcq-option.repository.ts` (~40 lines)
#### `repositories/tag.repository.ts` (~40 lines)
#### `repositories/question-tag.repository.ts` (~30 lines)

#### `schemas/question.schema.ts` (~80 lines)
```
- baseQuestionSchema
- mcqQuestionSchema (extends base + options)
- shortAnswerQuestionSchema (extends base + modelAnswer)
- longAnswerQuestionSchema (extends base + rubric)
- questionFilterSchema
```

#### `components/QuestionList.tsx` (~100 lines)
#### `components/QuestionCard.tsx` (~60 lines)
#### `components/QuestionForm.tsx` (~90 lines) — orchestrator
#### `components/McqOptionsEditor.tsx` (~80 lines)
#### `components/ModelAnswerEditor.tsx` (~50 lines)
#### `components/RubricEditor.tsx` (~80 lines)
#### `components/QuestionFilters.tsx` (~70 lines)
#### `components/TagSelector.tsx` (~60 lines)
#### `components/QuestionPreview.tsx` (~60 lines)

#### `hooks/use-questions.ts` (~50 lines)
#### `hooks/use-tags.ts` (~30 lines)

---

## Module 6: Exam Builder

### Responsibility
Create and configure exams, assign questions, set rules, assign to classes.

### Files Breakdown

#### `services/exam.service.ts` (~90 lines)
```
- createExam(data) → Exam
- updateExam(examId, data) → Exam
- deleteExam(examId) → void
- publishExam(examId) → Exam (with validations)
- archiveExam(examId) → Exam
- duplicateExam(examId) → Exam
- calculateTotalMarks(examId) → Decimal
```

#### `services/exam-question.service.ts` (~70 lines)
```
- addQuestion(examId, questionId, marks, order) → ExamQuestion
- removeQuestion(examQuestionId) → void
- reorderQuestions(examId, orderedIds) → void
- autoSelectQuestions(criteria) → Question[]
```

#### `services/exam-assignment.service.ts` (~50 lines)
```
- assignToClass(examId, classId, sectionId?) → void
- unassignFromClass(assignmentId) → void
- getAssignedClasses(examId) → ClassAssignment[]
- getEligibleStudents(examId) → Student[]
```

#### `repositories/exam.repository.ts` (~80 lines)
#### `repositories/exam-question.repository.ts` (~50 lines)
#### `repositories/exam-assignment.repository.ts` (~40 lines)

#### `schemas/exam.schema.ts` (~70 lines)
#### `components/ExamList.tsx` (~90 lines)
#### `components/ExamForm.tsx` (~90 lines)
#### `components/ExamQuestionSelector.tsx` (~100 lines)
#### `components/ExamQuestionList.tsx` (~80 lines) — drag-reorder
#### `components/ExamSettingsForm.tsx` (~80 lines)
#### `components/ExamClassAssigner.tsx` (~70 lines)
#### `components/ExamPreview.tsx` (~60 lines)
#### `components/ExamStatusBadge.tsx` (~20 lines)

#### `hooks/use-exams.ts` (~50 lines)
#### `hooks/use-exam-builder.ts` (~60 lines)

---

## Module 7: Exam Session

### Responsibility
Student exam-taking experience — timer, navigation, auto-save, submission.

### Files Breakdown

#### `services/exam-session.service.ts` (~90 lines)
```
- startSession(examId, studentId) → ExamSession
- validateSessionAccess(examId, studentId) → boolean
- checkTimeRemaining(sessionId) → seconds
- handleTimeout(sessionId) → void
- submitSession(sessionId) → void
- getSessionProgress(sessionId) → SessionProgress
```

#### `services/answer.service.ts` (~60 lines)
```
- saveAnswer(sessionId, questionId, answer) → StudentAnswer
- bulkSaveAnswers(sessionId, answers[]) → void
- toggleMarkForReview(sessionId, questionId) → void
- getAnswersForSession(sessionId) → StudentAnswer[]
```

#### `repositories/exam-session.repository.ts` (~70 lines)
#### `repositories/student-answer.repository.ts` (~60 lines)

#### `schemas/answer.schema.ts` (~40 lines)

#### `components/ExamTakingLayout.tsx` (~80 lines) — timer + navigation
#### `components/ExamTimer.tsx` (~60 lines)
#### `components/QuestionNavigator.tsx` (~70 lines) — question palette
#### `components/QuestionDisplay.tsx` (~50 lines) — routes to type-specific
#### `components/McqQuestionView.tsx` (~60 lines)
#### `components/ShortAnswerView.tsx` (~50 lines)
#### `components/LongAnswerView.tsx` (~60 lines)
#### `components/ExamSubmitDialog.tsx` (~50 lines)
#### `components/ExamInstructions.tsx` (~40 lines)

#### `hooks/use-exam-session.ts` (~70 lines) — timer, auto-save logic
#### `hooks/use-auto-save.ts` (~50 lines) — debounced saving

#### `stores/exam-session.store.ts` (~50 lines) — Zustand store for session state

---

## Module 8: Grading Engine

### Responsibility
MCQ auto-grading, AI grading orchestration, teacher review, result calculation.

### Files Breakdown

#### `services/grading-orchestrator.service.ts` (~80 lines)
```
- processSubmission(sessionId) → void
  - Grade MCQs immediately
  - Queue AI grading for short/long answers
  - Calculate partial results
```

#### `services/mcq-grader.service.ts` (~40 lines)
```
- gradeMcq(answer, correctOptionId) → Grade
- batchGradeMcqs(session) → Grade[]
```

#### `services/ai-grader.service.ts` (~90 lines)
```
- gradeShortAnswer(answer, modelAnswer, marks) → AIGradeResult
- gradeLongAnswer(answer, rubric, marks) → AIGradeResult
- buildGradingPrompt(type, params) → Prompt
- parseGradingResponse(response) → ParsedGrade
```

#### `services/result-calculator.service.ts` (~70 lines)
```
- calculateResult(sessionId) → ExamResult
- calculatePercentage(obtained, total) → Decimal
- determineGrade(percentage, scale) → string
- calculateRank(examId) → Rankings[]
```

#### `services/grade-review.service.ts` (~50 lines)
```
- overrideGrade(answerId, marks, feedback) → Grade
- approveAiGrade(answerId) → Grade
- bulkApproveGrades(answerIds) → void
- requestRegrade(answerId) → Grade
```

#### `repositories/answer-grade.repository.ts` (~60 lines)
#### `repositories/exam-result.repository.ts` (~50 lines)

#### `workers/grading.worker.ts` (~80 lines) — BullMQ worker
#### `queues/grading.queue.ts` (~40 lines) — Queue setup

#### `schemas/grading.schema.ts` (~40 lines)
#### `components/GradeReviewList.tsx` (~90 lines)
#### `components/GradeReviewCard.tsx` (~80 lines)
#### `components/GradeOverrideForm.tsx` (~60 lines)
#### `components/AiGradeDisplay.tsx` (~50 lines)
#### `components/GradingProgress.tsx` (~40 lines)

---

## Module 9: Results

### Responsibility
Display results, generate report cards, export functionality.

### Files Breakdown

#### `services/result.service.ts` (~70 lines)
#### `services/result-export.service.ts` (~80 lines)
#### `repositories/result.repository.ts` (~60 lines)

#### `components/ResultCard.tsx` (~80 lines)
#### `components/ResultDetailView.tsx` (~90 lines)
#### `components/ResultTable.tsx` (~80 lines)
#### `components/ExportResultButton.tsx` (~40 lines)

---

## Module 10: Analytics

### Responsibility
Dashboard stats, exam analytics, class performance, question statistics.

### Files Breakdown

#### `services/dashboard-analytics.service.ts` (~80 lines)
```
- getAdminDashboard() → AdminStats
- getTeacherDashboard(teacherId) → TeacherStats
- getStudentDashboard(studentId) → StudentStats
```

#### `services/exam-analytics.service.ts` (~90 lines)
```
- getExamAnalytics(examId) → ExamAnalytics
- getQuestionAnalytics(examId) → QuestionAnalytics[]
- getClassComparison(examId) → ClassComparison[]
- getDifficultyDistribution(examId) → Distribution
```

#### `services/student-analytics.service.ts` (~60 lines)
```
- getStudentPerformanceHistory(studentId) → Performance[]
- getSubjectWisePerformance(studentId) → SubjectPerformance[]
```

#### `repositories/analytics.repository.ts` (~80 lines)

#### `components/AdminDashboard.tsx` (~80 lines)
#### `components/TeacherDashboard.tsx` (~80 lines)
#### `components/StudentDashboard.tsx` (~70 lines)
#### `components/StatsCard.tsx` (~30 lines)
#### `components/PerformanceChart.tsx` (~60 lines)
#### `components/ScoreDistributionChart.tsx` (~50 lines)
#### `components/QuestionDifficultyChart.tsx` (~40 lines)
#### `components/ClassComparisonChart.tsx` (~50 lines)

---

## Module 11: Notifications

#### `services/notification.service.ts` (~60 lines)
#### `repositories/notification.repository.ts` (~50 lines)
#### `components/NotificationBell.tsx` (~40 lines)
#### `components/NotificationList.tsx` (~60 lines)
#### `components/NotificationItem.tsx` (~30 lines)
#### `hooks/use-notifications.ts` (~40 lines)

---

## Module 12: Settings

#### `services/settings.service.ts` (~50 lines)
#### `repositories/settings.repository.ts` (~40 lines)
#### `schemas/settings.schema.ts` (~50 lines)
#### `components/SchoolSettingsForm.tsx` (~80 lines)
#### `components/GradingScaleEditor.tsx` (~70 lines)
#### `components/AcademicYearSelector.tsx` (~30 lines)

---

## Shared Module (Cross-cutting)

```
shared/
├── components/       # Reusable UI components
│   ├── DataTable/    # Generic data table component
│   ├── FormField/    # Reusable form fields
│   ├── Modal/        # Modal dialog
│   ├── Pagination/   # Pagination component
│   ├── SearchInput/  # Debounced search input
│   └── StatusBadge/  # Generic status badges
├── hooks/            # Shared React hooks
│   ├── use-debounce.ts
│   ├── use-pagination.ts
│   └── use-confirm-dialog.ts
├── utils/            # Shared utilities
│   ├── format-date.ts
│   ├── format-number.ts
│   ├── cn.ts (classnames)
│   └── api-response.ts
├── lib/              # External service wrappers
│   ├── prisma.ts
│   ├── auth.ts
│   ├── ai.ts
│   ├── queue.ts
│   ├── logger.ts
│   └── redis.ts
├── errors/           # Custom error classes
│   ├── base-error.ts
│   ├── validation-error.ts
│   ├── auth-error.ts
│   └── not-found-error.ts
└── types/            # Global type definitions
    ├── api.types.ts
    ├── pagination.types.ts
    └── common.types.ts
```
