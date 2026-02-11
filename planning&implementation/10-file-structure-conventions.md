# ExamCore - File Structure & Coding Conventions

## GOLDEN RULE: No file exceeds 300 lines. EVER.

If a file approaches 250 lines, it MUST be split into smaller modules.

---

## Complete Project File Structure

```
examcore/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                    # Lint, type-check, test on PR
│   │   ├── deploy-preview.yml        # Deploy preview on PR
│   │   └── deploy-production.yml     # Deploy on main merge
│   └── PULL_REQUEST_TEMPLATE.md
│
├── prisma/
│   ├── schema/                       # Split schema into multiple files
│   │   ├── user.prisma               # User, StudentProfile, TeacherProfile
│   │   ├── organization.prisma       # Department, Subject, Class, Section
│   │   ├── question.prisma           # Question, McqOption, Tag, QuestionTag
│   │   ├── exam.prisma               # Exam, ExamQuestion, ExamClassAssignment
│   │   ├── session.prisma            # ExamSession, StudentAnswer
│   │   ├── grading.prisma            # AnswerGrade, ExamResult
│   │   └── system.prisma             # SchoolSettings, AuditLog, Notification
│   ├── schema.prisma                 # Main schema (imports above via prisma-merge)
│   ├── migrations/
│   └── seed/
│       ├── index.ts                  # Seed orchestrator
│       ├── seed-admin.ts             # Create default admin
│       ├── seed-development.ts       # Full dev data
│       └── seed-data/
│           ├── classes.json
│           ├── subjects.json
│           └── sample-questions.json
│
├── public/
│   ├── images/
│   │   ├── logo.svg
│   │   └── favicon.ico
│   └── fonts/
│
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx                # Root layout (~30 lines)
│   │   ├── globals.css               # Tailwind imports + custom CSS
│   │   ├── not-found.tsx             # Global 404
│   │   │
│   │   ├── (public)/                 # Public routes (no auth)
│   │   │   ├── layout.tsx            # Centered layout
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── forgot-password/
│   │   │   │   └── page.tsx
│   │   │   └── reset-password/
│   │   │       └── page.tsx
│   │   │
│   │   ├── (admin)/                  # Admin routes
│   │   │   └── admin/
│   │   │       ├── layout.tsx        # Admin shell layout
│   │   │       ├── dashboard/
│   │   │       │   ├── page.tsx
│   │   │       │   └── loading.tsx
│   │   │       ├── users/
│   │   │       │   ├── page.tsx
│   │   │       │   ├── loading.tsx
│   │   │       │   ├── [id]/
│   │   │       │   │   ├── page.tsx
│   │   │       │   │   └── loading.tsx
│   │   │       │   └── new/
│   │   │       │       └── page.tsx
│   │   │       ├── classes/
│   │   │       │   ├── page.tsx
│   │   │       │   └── loading.tsx
│   │   │       ├── subjects/
│   │   │       │   ├── page.tsx
│   │   │       │   └── loading.tsx
│   │   │       └── settings/
│   │   │           ├── page.tsx
│   │   │           └── loading.tsx
│   │   │
│   │   ├── (teacher)/                # Teacher routes
│   │   │   └── teacher/
│   │   │       ├── layout.tsx
│   │   │       ├── dashboard/
│   │   │       │   ├── page.tsx
│   │   │       │   └── loading.tsx
│   │   │       ├── questions/
│   │   │       │   ├── page.tsx
│   │   │       │   ├── loading.tsx
│   │   │       │   ├── new/
│   │   │       │   │   └── page.tsx
│   │   │       │   ├── [id]/
│   │   │       │   │   ├── page.tsx
│   │   │       │   │   └── edit/
│   │   │       │   │       └── page.tsx
│   │   │       │   └── tags/
│   │   │       │       └── page.tsx
│   │   │       ├── exams/
│   │   │       │   ├── page.tsx
│   │   │       │   ├── loading.tsx
│   │   │       │   ├── new/
│   │   │       │   │   └── page.tsx
│   │   │       │   └── [id]/
│   │   │       │       ├── page.tsx
│   │   │       │       ├── edit/
│   │   │       │       │   └── page.tsx
│   │   │       │       ├── preview/
│   │   │       │       │   └── page.tsx
│   │   │       │       └── results/
│   │   │       │           └── page.tsx
│   │   │       ├── grading/
│   │   │       │   ├── page.tsx
│   │   │       │   ├── loading.tsx
│   │   │       │   └── [sessionId]/
│   │   │       │       └── page.tsx
│   │   │       └── results/
│   │   │           ├── page.tsx
│   │   │           └── class/
│   │   │               └── page.tsx
│   │   │
│   │   ├── (student)/                # Student routes
│   │   │   └── student/
│   │   │       ├── layout.tsx
│   │   │       ├── dashboard/
│   │   │       │   ├── page.tsx
│   │   │       │   └── loading.tsx
│   │   │       ├── exams/
│   │   │       │   ├── page.tsx
│   │   │       │   └── loading.tsx
│   │   │       ├── exam/
│   │   │       │   └── [id]/
│   │   │       │       ├── layout.tsx   # Exam-taking layout (minimal)
│   │   │       │       ├── page.tsx     # Exam instructions + start
│   │   │       │       └── session/
│   │   │       │           └── page.tsx # Active exam session
│   │   │       └── results/
│   │   │           ├── page.tsx
│   │   │           ├── [resultId]/
│   │   │           │   └── page.tsx
│   │   │           └── performance/
│   │   │               └── page.tsx
│   │   │
│   │   └── api/
│   │       └── v1/
│   │           ├── users/
│   │           │   ├── route.ts
│   │           │   ├── [id]/route.ts
│   │           │   ├── import/route.ts
│   │           │   └── export/route.ts
│   │           ├── questions/
│   │           │   ├── route.ts
│   │           │   ├── [id]/route.ts
│   │           │   └── import/route.ts
│   │           ├── exams/
│   │           │   ├── available/route.ts
│   │           │   └── [id]/
│   │           │       ├── session/route.ts
│   │           │       └── auto-save/route.ts
│   │           ├── results/
│   │           │   ├── exam/[examId]/route.ts
│   │           │   ├── student/[studentId]/route.ts
│   │           │   └── [resultId]/
│   │           │       ├── route.ts
│   │           │       └── export/route.ts
│   │           ├── analytics/
│   │           │   ├── dashboard/route.ts
│   │           │   ├── exam/[examId]/route.ts
│   │           │   └── class/[classId]/route.ts
│   │           ├── notifications/
│   │           │   ├── route.ts
│   │           │   └── unread-count/route.ts
│   │           ├── grading/
│   │           │   ├── process/route.ts
│   │           │   └── status/[sessionId]/route.ts
│   │           └── upload/route.ts
│   │
│   ├── modules/                      # Feature modules
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   ├── ChangePasswordForm.tsx
│   │   │   │   └── ResetPasswordForm.tsx
│   │   │   ├── actions/
│   │   │   │   ├── login.action.ts
│   │   │   │   ├── logout.action.ts
│   │   │   │   └── change-password.action.ts
│   │   │   ├── services/
│   │   │   │   ├── auth.service.ts
│   │   │   │   └── password-reset.service.ts
│   │   │   ├── repositories/
│   │   │   │   └── auth.repository.ts
│   │   │   ├── schemas/
│   │   │   │   └── auth.schema.ts
│   │   │   └── types/
│   │   │       └── auth.types.ts
│   │   │
│   │   ├── user/
│   │   │   ├── components/
│   │   │   ├── actions/
│   │   │   ├── services/
│   │   │   ├── repositories/
│   │   │   ├── schemas/
│   │   │   ├── hooks/
│   │   │   ├── types/
│   │   │   └── constants/
│   │   │
│   │   ├── class/
│   │   │   └── ... (same pattern)
│   │   │
│   │   ├── subject/
│   │   │   └── ... (same pattern)
│   │   │
│   │   ├── question-bank/
│   │   │   └── ... (same pattern)
│   │   │
│   │   ├── exam-builder/
│   │   │   └── ... (same pattern)
│   │   │
│   │   ├── exam-session/
│   │   │   ├── components/
│   │   │   ├── actions/
│   │   │   ├── services/
│   │   │   ├── repositories/
│   │   │   ├── schemas/
│   │   │   ├── hooks/
│   │   │   ├── stores/          # Zustand store for exam timer
│   │   │   └── types/
│   │   │
│   │   ├── grading/
│   │   │   ├── components/
│   │   │   ├── actions/
│   │   │   ├── services/
│   │   │   ├── repositories/
│   │   │   ├── workers/         # BullMQ workers
│   │   │   ├── queues/          # Queue definitions
│   │   │   ├── prompts/         # AI prompt templates
│   │   │   │   ├── v1/
│   │   │   │   │   ├── short-answer.prompt.ts
│   │   │   │   │   └── long-answer.prompt.ts
│   │   │   │   └── index.ts
│   │   │   ├── schemas/
│   │   │   └── types/
│   │   │
│   │   ├── result/
│   │   │   └── ... (same pattern)
│   │   │
│   │   ├── analytics/
│   │   │   └── ... (same pattern)
│   │   │
│   │   ├── notification/
│   │   │   └── ... (same pattern)
│   │   │
│   │   └── settings/
│   │       └── ... (same pattern)
│   │
│   ├── components/               # Shared components
│   │   ├── ui/                   # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── ... (all shadcn components)
│   │   │
│   │   ├── shared/               # Custom shared components
│   │   │   ├── data-table/
│   │   │   │   ├── DataTable.tsx
│   │   │   │   ├── DataTableToolbar.tsx
│   │   │   │   ├── DataTablePagination.tsx
│   │   │   │   ├── DataTableColumnHeader.tsx
│   │   │   │   └── data-table.types.ts
│   │   │   ├── form-fields/
│   │   │   │   ├── TextField.tsx
│   │   │   │   ├── SelectField.tsx
│   │   │   │   ├── TextareaField.tsx
│   │   │   │   ├── CheckboxField.tsx
│   │   │   │   ├── DatePickerField.tsx
│   │   │   │   └── FileUploadField.tsx
│   │   │   ├── PageHeader.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── ConfirmDialog.tsx
│   │   │   ├── SearchInput.tsx
│   │   │   ├── StatusBadge.tsx
│   │   │   └── Pagination.tsx
│   │   │
│   │   └── layout/               # Layout components
│   │       ├── sidebar/
│   │       │   ├── Sidebar.tsx
│   │       │   ├── SidebarItem.tsx
│   │       │   ├── SidebarGroup.tsx
│   │       │   └── sidebar-config.ts
│   │       ├── top-nav/
│   │       │   ├── TopNav.tsx
│   │       │   ├── Breadcrumbs.tsx
│   │       │   └── UserMenu.tsx
│   │       └── MobileSidebar.tsx
│   │
│   ├── lib/                      # Core library code
│   │   ├── prisma.ts             # Prisma client singleton
│   │   ├── auth.ts               # NextAuth config
│   │   ├── auth-options.ts       # Auth options (separated for modularity)
│   │   ├── ai.ts                 # Vercel AI SDK setup
│   │   ├── queue.ts              # BullMQ connection
│   │   ├── redis.ts              # Redis client
│   │   ├── logger.ts             # Pino logger setup
│   │   └── env.ts                # Environment validation (t3-env)
│   │
│   ├── hooks/                    # Global shared hooks
│   │   ├── use-debounce.ts
│   │   ├── use-pagination.ts
│   │   ├── use-confirm-dialog.ts
│   │   ├── use-media-query.ts
│   │   └── use-local-storage.ts
│   │
│   ├── utils/                    # Global utilities
│   │   ├── cn.ts                 # classnames helper
│   │   ├── format-date.ts        # Date formatting
│   │   ├── format-number.ts      # Number/currency formatting
│   │   ├── api-response.ts       # API response helpers
│   │   ├── pagination.ts         # Pagination helpers
│   │   └── string.ts             # String utilities
│   │
│   ├── errors/                   # Custom error classes
│   │   ├── base-error.ts
│   │   ├── validation-error.ts
│   │   ├── authentication-error.ts
│   │   ├── authorization-error.ts
│   │   ├── not-found-error.ts
│   │   └── ai-service-error.ts
│   │
│   ├── types/                    # Global types
│   │   ├── api.types.ts
│   │   ├── pagination.types.ts
│   │   ├── common.types.ts
│   │   └── next-auth.d.ts        # NextAuth type augmentation
│   │
│   ├── config/                   # App configuration
│   │   ├── site.config.ts        # Site metadata
│   │   ├── navigation.config.ts  # Navigation items per role
│   │   └── grading.config.ts     # AI grading defaults
│   │
│   ├── providers/                # React context providers
│   │   ├── QueryProvider.tsx      # TanStack Query provider
│   │   ├── ThemeProvider.tsx      # Dark mode provider
│   │   └── Providers.tsx          # Combined providers wrapper
│   │
│   └── middleware.ts             # Next.js middleware (auth guard)
│
├── tests/
│   ├── unit/                     # Unit tests (mirror src/ structure)
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── grading/
│   │   │   └── ...
│   │   └── utils/
│   ├── integration/              # Integration tests
│   │   ├── api/
│   │   └── services/
│   ├── e2e/                      # Playwright E2E tests
│   │   ├── auth.spec.ts
│   │   ├── exam-flow.spec.ts
│   │   └── grading-flow.spec.ts
│   ├── fixtures/                 # Test data fixtures
│   │   ├── users.fixture.ts
│   │   ├── questions.fixture.ts
│   │   └── exams.fixture.ts
│   └── helpers/                  # Test utilities
│       ├── db.helper.ts
│       └── auth.helper.ts
│
├── .env.local                    # Local env (gitignored)
├── .env.development              # Dev defaults
├── .env.production               # Prod defaults (no secrets)
├── .env.test                     # Test environment
├── .eslintrc.json                # ESLint config
├── .prettierrc                   # Prettier config
├── .gitignore
├── .husky/
│   └── pre-commit                # Lint-staged hook
├── commitlint.config.js
├── lint-staged.config.js
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── vitest.config.ts
├── playwright.config.ts
├── package.json
├── pnpm-lock.yaml
└── README.md
```

---

## Naming Conventions

### Files & Directories
| Type                | Convention            | Example                        |
| ------------------- | --------------------- | ------------------------------ |
| Directory           | kebab-case            | `question-bank/`, `exam-session/` |
| React Component     | PascalCase            | `ExamForm.tsx`, `QuestionCard.tsx` |
| Hook                | camelCase with `use-` prefix | `use-debounce.ts`        |
| Server Action       | kebab-case with `.action` | `create-exam.action.ts`     |
| Service             | kebab-case with `.service` | `exam.service.ts`          |
| Repository          | kebab-case with `.repository` | `exam.repository.ts`    |
| Schema              | kebab-case with `.schema` | `exam.schema.ts`            |
| Type file           | kebab-case with `.types` | `exam.types.ts`              |
| Constant file       | kebab-case with `.constants` | `exam.constants.ts`      |
| Utility file        | kebab-case             | `format-date.ts`              |
| Test file           | same name + `.test`    | `exam.service.test.ts`        |
| Config file         | kebab-case with `.config` | `site.config.ts`           |

### Code Naming
| Type                | Convention            | Example                        |
| ------------------- | --------------------- | ------------------------------ |
| Component           | PascalCase            | `ExamForm`, `QuestionCard`     |
| Function            | camelCase             | `createExam`, `calculateResult`|
| Variable            | camelCase             | `examData`, `isLoading`        |
| Constant            | UPPER_SNAKE_CASE      | `MAX_FILE_SIZE`, `API_VERSION` |
| Type/Interface      | PascalCase            | `ExamSession`, `UserProfile`   |
| Enum                | PascalCase            | `UserRole`, `ExamStatus`       |
| Enum Value          | UPPER_SNAKE_CASE      | `ADMIN`, `SHORT_ANSWER`        |
| Zod Schema          | camelCase + Schema    | `createExamSchema`             |
| Server Action       | camelCase + Action    | `createExamAction`             |
| Hook                | camelCase + use       | `useExamSession`               |
| Zustand Store       | camelCase + Store     | `examSessionStore`             |

---

## Import Order Convention

```typescript
// 1. React/Next.js imports
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// 2. Third-party library imports
import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

// 3. Internal absolute imports (@/ alias)
import { Button } from '@/components/ui/button';
import { examService } from '@/modules/exam-builder/services/exam.service';

// 4. Relative imports (within same module)
import { ExamCard } from './ExamCard';
import type { ExamFormData } from '../types/exam.types';

// 5. Type-only imports (always last)
import type { Exam } from '@prisma/client';
```

---

## Code Quality Rules

### ESLint Rules (Enforced)
```
- no-console (warn — use logger instead)
- max-lines (error — 300 limit per file)
- max-lines-per-function (warn — 50 lines)
- complexity (warn — max 10)
- no-nested-ternary
- prefer-const
- no-unused-vars (error)
- @typescript-eslint/no-explicit-any (error)
- @typescript-eslint/no-non-null-assertion (warn)
- react/no-unescaped-entities
- import/order (auto-fixable)
```

### Prettier Configuration
```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "tabWidth": 2,
  "printWidth": 100,
  "bracketSpacing": true,
  "arrowParens": "always",
  "endOfLine": "lf",
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

### TypeScript Strict Mode
```json
{
  "strict": true,
  "noUncheckedIndexedAccess": true,
  "noImplicitReturns": true,
  "noFallthroughCasesInSwitch": true,
  "forceConsistentCasingInFileNames": true
}
```

---

## Git Conventions

### Branch Naming
```
feature/[module]-[description]    → feature/auth-login-flow
bugfix/[module]-[description]     → bugfix/grading-score-calculation
hotfix/[description]              → hotfix/session-timeout
chore/[description]               → chore/update-dependencies
```

### Commit Message Format (Conventional Commits)
```
type(scope): description

feat(auth): add login with email and password
fix(grading): correct score calculation for partial marks
docs(readme): update setup instructions
refactor(question-bank): split service into smaller modules
test(exam-session): add auto-save unit tests
chore(deps): update Next.js to 15.x
```
