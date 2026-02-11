# ExamCore - System Architecture Document

## Architecture Overview

ExamCore follows a **Modular Monolith** architecture within Next.js 15 App Router. This gives us the simplicity of a monolith with the organizational benefits of microservices — perfect for a single-school deployment that demands SaaS-level code quality.

---

## Architecture Pattern: Modular Monolith + Feature-Sliced Design

```
┌───────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                           │
│  (React 19 Server/Client Components, shadcn/ui, Tailwind)    │
├───────────────────────────────────────────────────────────────┤
│                     PRESENTATION LAYER                        │
│  (Next.js App Router - Pages, Layouts, Loading, Error)        │
├───────────────────────────────────────────────────────────────┤
│                    SERVER ACTIONS LAYER                        │
│  (Next.js Server Actions - Mutations & Form Handling)         │
├───────────────────────────────────────────────────────────────┤
│                      API ROUTE LAYER                          │
│  (Next.js Route Handlers - REST endpoints for external use)   │
├───────────────────────────────────────────────────────────────┤
│                      SERVICE LAYER                            │
│  (Business Logic - Pure functions, orchestrators)             │
├───────────────────────────────────────────────────────────────┤
│                    REPOSITORY LAYER                           │
│  (Data Access - Prisma queries, abstracted DB operations)     │
├───────────────────────────────────────────────────────────────┤
│                     DATABASE LAYER                            │
│  (PostgreSQL - Prisma ORM - Migrations)                       │
├───────────────────────────────────────────────────────────────┤
│                    EXTERNAL SERVICES                          │
│  (OpenAI API, Redis/BullMQ, File Storage, Email)              │
└───────────────────────────────────────────────────────────────┘
```

---

## Layer Responsibilities

### 1. Client Layer (React Components)
- **Server Components**: Data display, non-interactive UI (default)
- **Client Components**: Interactivity, forms, state, event handlers
- **Rule**: Minimize `"use client"` — push interactivity to leaf components

### 2. Presentation Layer (App Router)
- `page.tsx` — Route entry point, data fetching orchestration
- `layout.tsx` — Shared layouts per route group
- `loading.tsx` — Streaming loading states
- `error.tsx` — Error boundaries per route
- `not-found.tsx` — 404 handling
- **Rule**: Pages are thin — they call services and pass data to components

### 3. Server Actions Layer
- Mutation operations (create, update, delete)
- Form submissions with validation
- Revalidation of cached data
- **Rule**: Each action file handles ONE entity's mutations

### 4. API Route Layer
- RESTful endpoints for operations that need HTTP semantics
- Webhook handlers
- File upload endpoints
- **Rule**: Route handlers delegate to services — zero business logic in handlers

### 5. Service Layer (Business Logic)
- Pure business logic functions
- Orchestration of multiple repository calls
- Validation and authorization checks
- **Rule**: Services are framework-agnostic — no Next.js imports

### 6. Repository Layer (Data Access)
- Prisma query abstractions
- Complex query builders
- Transaction management
- **Rule**: Only layer that imports Prisma client

### 7. External Services Layer
- AI grading service (OpenAI integration)
- Queue management (BullMQ)
- Email service
- File storage service
- **Rule**: Each external service has its own adapter with interface

---

## Domain Modules

The system is divided into these core domain modules:

```
┌─────────────────────────────────────────────────┐
│                  DOMAIN MODULES                  │
├──────────┬──────────┬──────────┬────────────────┤
│   Auth   │   User   │  Class   │    Subject     │
│ Module   │ Module   │ Module   │    Module      │
├──────────┼──────────┼──────────┼────────────────┤
│ Question │   Exam   │  Exam    │   Grading      │
│   Bank   │ Builder  │ Session  │   Engine       │
│  Module  │  Module  │  Module  │   Module       │
├──────────┼──────────┼──────────┼────────────────┤
│  Result  │Analytics │ Notific- │   Settings     │
│  Module  │  Module  │  ation   │   Module       │
│          │          │  Module  │                │
└──────────┴──────────┴──────────┴────────────────┘
```

### Module Descriptions

| Module          | Responsibility                                              |
| --------------- | ----------------------------------------------------------- |
| **Auth**        | Login, logout, sessions, password reset, middleware guards   |
| **User**        | CRUD for admin/teacher/student profiles, bulk import         |
| **Class**       | Class/section management, student-class assignments          |
| **Subject**     | Subject management, teacher-subject assignments              |
| **Question Bank** | Create/manage questions, tagging, search, import/export   |
| **Exam Builder**  | Create exams, configure settings, assign to classes        |
| **Exam Session**  | Student exam-taking flow, auto-save, submission            |
| **Grading Engine**| MCQ auto-grade, AI grading, manual review, score calc     |
| **Result**      | Result cards, grade sheets, export, certificate generation   |
| **Analytics**   | Dashboard stats, charts, performance tracking                |
| **Notification**| In-app notifications, exam reminders                         |
| **Settings**    | School profile, system config, grading policies              |

---

## Data Flow Diagrams

### Exam Creation Flow
```
Teacher → Exam Builder UI → Server Action (validate)
  → Exam Service (business rules)
    → Question Bank Repository (fetch questions)
    → Exam Repository (save exam)
      → PostgreSQL
  → Revalidate cache → UI updated
```

### Exam Taking Flow
```
Student → Exam Session UI → Auto-save (Server Action every 60s)
  → Exam Session Service
    → Session Repository (save progress)
      → PostgreSQL
  → On Submit → Grading Queue (BullMQ)
    → MCQ Grader (instant)
    → AI Grader (async via queue)
      → OpenAI API
      → Save grades → PostgreSQL
    → Notify student (result ready)
```

### AI Grading Flow
```
BullMQ Worker picks up job
  → Load submission + question + rubric
  → Build prompt from template
  → Call Vercel AI SDK → OpenAI API
  → Parse structured response (Zod validated)
  → Calculate confidence score
  → If confidence < threshold → flag for teacher review
  → Save grade to PostgreSQL
  → If all questions graded → calculate total → save result
  → Emit notification event
```

---

## Cross-Cutting Concerns

### Error Handling Strategy
```
├── Application Errors (custom error classes)
│   ├── ValidationError (400)
│   ├── AuthenticationError (401)
│   ├── AuthorizationError (403)
│   ├── NotFoundError (404)
│   ├── ConflictError (409)
│   └── RateLimitError (429)
├── External Service Errors
│   ├── AIServiceError (AI grading failures)
│   ├── DatabaseError (Prisma errors)
│   └── QueueError (BullMQ failures)
└── Unexpected Errors (500 — logged to Sentry)
```

### Logging Strategy
- **Pino** structured JSON logging
- Log levels: error, warn, info, debug
- Request ID tracking across layers
- Sensitive data redaction (passwords, tokens)

### Caching Strategy
```
├── Next.js Cache (built-in)
│   ├── Full Route Cache (static pages)
│   ├── Data Cache (fetch results)
│   └── Router Cache (client-side)
├── TanStack Query Cache (client-side)
│   ├── Stale-while-revalidate pattern
│   └── Optimistic updates for mutations
└── Redis Cache (server-side)
    ├── Session data
    ├── Rate limiting counters
    └── Cached analytics aggregations
```

### Security Measures
- CSRF protection via Server Actions (built-in)
- Input sanitization on all user inputs
- SQL injection prevention via Prisma (parameterized queries)
- XSS prevention via React (auto-escaping)
- Rate limiting on auth endpoints and AI grading
- Content Security Policy headers
- HTTP-only secure cookies for sessions

---

## Scalability Architecture

### Horizontal Scaling Points
```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Vercel      │     │   Vercel      │     │   Vercel      │
│  Instance 1   │     │  Instance 2   │     │  Instance N   │
│  (Serverless) │     │  (Serverless) │     │  (Serverless) │
└──────┬───────┘     └──────┬───────┘     └──────┬───────┘
       │                     │                     │
       └─────────────┬───────┘─────────────────────┘
                     │
            ┌────────┴────────┐
            │  Connection      │
            │  Pooler (PgBouncer│
            │  / Prisma Accel.) │
            └────────┬────────┘
                     │
            ┌────────┴────────┐
            │   PostgreSQL     │
            │   (Neon/Supabase)│
            └─────────────────┘
```

- **Stateless application**: No server-side state — all state in DB/Redis
- **Connection pooling**: Handle hundreds of concurrent connections
- **Edge caching**: Static assets and public pages at edge
- **Queue-based AI grading**: Decouple from request lifecycle
- **Database read replicas**: For analytics queries (future)

---

## Environment Configuration

```
├── .env.local          (local development — gitignored)
├── .env.development    (development defaults — committed)
├── .env.production     (production defaults — committed)
└── .env.test           (test environment — committed)
```

All environment variables validated at build time using `@t3-oss/env-nextjs` + Zod.
