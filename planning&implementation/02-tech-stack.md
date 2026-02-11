# ExamCore - Tech Stack Decision Document

## Decision Philosophy

Every technology choice is made with these priorities:
1. **Production readiness** — battle-tested, well-maintained, large community
2. **Developer experience** — fast iteration, great tooling, strong TypeScript support
3. **Scalability** — horizontal scaling capability, stateless where possible
4. **Modularity** — supports clean architecture and separation of concerns
5. **Cost efficiency** — minimize operational costs for a single-school deployment

---

## Final Tech Stack

### Core Framework

| Layer      | Technology             | Version  | Justification                                                  |
| ---------- | ---------------------- | -------- | -------------------------------------------------------------- |
| Framework  | **Next.js 15**         | ^15.x    | App Router, RSC, Server Actions, API Routes, edge-ready        |
| Language   | **TypeScript 5**       | ^5.x     | Type safety, better DX, catch errors at compile time           |
| Runtime    | **Node.js 20 LTS**    | ^20.x    | Long-term support, stable, widely deployed                     |
| Package Mgr| **pnpm**              | ^9.x     | Fast, disk-efficient, strict dependency resolution             |

**Why Next.js 15 (App Router)?**
- Server Components reduce client bundle size
- Server Actions eliminate boilerplate API routes for mutations
- Built-in caching, streaming, and incremental static regeneration
- Edge runtime support for low-latency responses
- File-based routing with layouts and parallel routes
- Single deployment artifact (no separate frontend/backend)

---

### Database Layer

| Component    | Technology           | Justification                                               |
| ------------ | -------------------- | ----------------------------------------------------------- |
| Primary DB   | **PostgreSQL 16**    | ACID compliant, JSON support, full-text search, mature      |
| ORM          | **Prisma 6**         | Type-safe queries, auto-generated types, migrations, studio |
| Connection   | **Prisma Accelerate** or **pgBouncer** | Connection pooling for serverless environments    |

**Why PostgreSQL?**
- Rock-solid ACID compliance for exam data integrity
- JSONB columns for flexible question metadata storage
- Full-text search for question bank searching
- Excellent indexing (GIN, GiST) for performance
- Battle-tested at massive scale

**Why Prisma?**
- Auto-generated TypeScript types from schema
- Declarative schema with migration support
- Prisma Studio for visual DB management
- Excellent Next.js integration
- Query engine handles connection pooling

---

### Authentication & Authorization

| Component     | Technology           | Justification                                            |
| ------------- | -------------------- | -------------------------------------------------------- |
| Auth Library  | **NextAuth.js v5**   | Native Next.js integration, credential provider, RBAC    |
| Session       | **JWT + DB Sessions**| Stateless auth with server-side session validation        |
| Password Hash | **bcrypt**           | Industry standard, adaptive hashing                       |

**Why NextAuth.js v5 (Auth.js)?**
- First-class Next.js 15 App Router support
- Credential-based auth (email/password) — perfect for school login
- Built-in session management
- Middleware-based route protection
- TypeScript-first API

---

### AI / LLM Integration

| Component      | Technology                | Justification                                        |
| -------------- | ------------------------- | ---------------------------------------------------- |
| AI SDK         | **Vercel AI SDK 4**       | Streaming, structured output, provider-agnostic      |
| Primary LLM    | **OpenAI GPT-4o-mini**   | Cost-effective, fast, accurate for grading tasks     |
| Fallback LLM   | **OpenAI GPT-4o**        | Higher accuracy for complex long-answer grading      |
| Prompt Mgmt    | Custom prompt templates   | Version-controlled, testable prompt system           |

**Why Vercel AI SDK?**
- Provider-agnostic — swap LLMs without code changes
- Structured output with Zod schema validation
- Streaming support for real-time grading feedback
- Built-in token usage tracking
- Native Next.js integration

**Why GPT-4o-mini as primary?**
- 15x cheaper than GPT-4o
- Fast response times (< 2 seconds)
- Sufficient accuracy for short answer grading
- GPT-4o fallback for complex long answers or low-confidence grades

---

### UI / Frontend

| Component      | Technology              | Justification                                          |
| -------------- | ----------------------- | ------------------------------------------------------ |
| UI Library     | **React 19**            | Server Components, concurrent features, latest stable  |
| Styling        | **Tailwind CSS 4**      | Utility-first, zero-runtime, highly composable         |
| Component Lib  | **shadcn/ui**           | Copy-paste components, fully customizable, accessible  |
| Icons          | **Lucide React**        | Consistent, tree-shakeable, lightweight                |
| Forms          | **React Hook Form**     | Performant, minimal re-renders, great validation       |
| Validation     | **Zod**                 | Runtime + compile-time validation, schema reuse        |
| Tables         | **TanStack Table v8**   | Headless, sortable, filterable, paginated              |
| Charts         | **Recharts**            | Simple, responsive, composable chart components        |
| Rich Text      | **Tiptap**              | Extensible editor for long answer questions            |
| Toast/Notify   | **Sonner**              | Lightweight, accessible notifications                  |
| Date/Time      | **date-fns**            | Tree-shakeable, immutable, lightweight                 |

**Why shadcn/ui over Material UI or Ant Design?**
- Not a dependency — code lives in your project (full control)
- Built on Radix UI primitives (accessibility-first)
- Tailwind CSS styled (matches our styling strategy)
- Each component is a separate file (modularity)
- Easy to customize without fighting a design system

---

### State Management & Data Fetching

| Component       | Technology             | Justification                                         |
| --------------- | ---------------------- | ----------------------------------------------------- |
| Server State    | **TanStack Query v5**  | Caching, deduplication, background refetch             |
| Client State    | **Zustand**            | Lightweight, no boilerplate, TypeScript-first          |
| Form State      | **React Hook Form**    | Already handling form state, no extra lib needed       |
| URL State       | **nuqs**               | Type-safe URL search params state management           |

**Why TanStack Query?**
- Automatic caching and background refetching
- Optimistic updates for better UX
- Request deduplication
- Pagination and infinite scroll support
- DevTools for debugging

**Why Zustand over Redux?**
- Minimal boilerplate — define store in 10 lines
- No providers needed
- Built-in TypeScript support
- Perfect for UI state (modals, sidebars, exam timer)

---

### Background Jobs & Queues

| Component       | Technology             | Justification                                         |
| --------------- | ---------------------- | ----------------------------------------------------- |
| Job Queue       | **BullMQ**             | Redis-based, reliable, retries, rate limiting          |
| Queue Backend   | **Redis (Upstash)**    | Serverless Redis, pay-per-request, zero maintenance    |
| Cron Jobs       | **Vercel Cron** or **node-cron** | Scheduled tasks (exam reminders, cleanup)   |

**Why BullMQ?**
- AI grading is async — queue exam submissions for background grading
- Retry failed AI calls automatically
- Rate limit API calls to OpenAI
- Priority queues (grade MCQs first, then AI grading)
- Dashboard for monitoring queue health

---

### File Storage

| Component       | Technology             | Justification                                         |
| --------------- | ---------------------- | ----------------------------------------------------- |
| Object Storage  | **Uploadthing** or **AWS S3** | File uploads for question images, CSV imports  |
| Image Optim     | **Next.js Image**      | Built-in optimization, lazy loading                   |

---

### Testing

| Component       | Technology             | Justification                                         |
| --------------- | ---------------------- | ----------------------------------------------------- |
| Unit Tests      | **Vitest**             | Fast, ESM-native, Jest-compatible API                  |
| Component Tests | **React Testing Lib**  | Test behavior not implementation                       |
| E2E Tests       | **Playwright**         | Cross-browser, auto-waiting, reliable                  |
| API Tests       | **Vitest + supertest** | Fast API route testing                                 |
| Coverage        | **v8 (via Vitest)**    | Built-in coverage reporting                            |

---

### DevOps & Infrastructure

| Component       | Technology             | Justification                                         |
| --------------- | ---------------------- | ----------------------------------------------------- |
| Hosting         | **Vercel**             | Zero-config Next.js deployment, edge network           |
| Database Host   | **Neon** or **Supabase (Postgres)** | Serverless Postgres, auto-scaling        |
| Redis Host      | **Upstash**            | Serverless Redis, global edge                          |
| CI/CD           | **GitHub Actions**     | Free for public/private repos, great ecosystem         |
| Monitoring      | **Sentry**             | Error tracking, performance monitoring, session replay |
| Logging         | **Pino**               | Fast JSON logger, structured logging                   |
| Analytics       | **Vercel Analytics**   | Web Vitals, real-time, privacy-friendly                |

---

### Code Quality & DX

| Component       | Technology             | Justification                                         |
| --------------- | ---------------------- | ----------------------------------------------------- |
| Linting         | **ESLint 9** (flat config) | Catch bugs early, enforce patterns                |
| Formatting      | **Prettier**           | Consistent code style, zero debates                    |
| Git Hooks       | **Husky + lint-staged**| Pre-commit quality checks                              |
| Commit Msgs     | **Commitlint**         | Conventional commits for changelog generation          |
| Type Checking   | **tsc --noEmit**       | Strict type checking in CI                             |
| Bundle Analysis | **@next/bundle-analyzer** | Monitor bundle size                                |
| Env Validation  | **@t3-oss/env-nextjs** | Validate env vars at build time with Zod              |

---

## Technology Decision Matrix

| Criteria            | Weight | Our Stack Score (1-10) |
| ------------------- | ------ | ---------------------- |
| TypeScript Support  | 20%    | 10                     |
| Community Size      | 15%    | 9                      |
| Production Maturity | 20%    | 9                      |
| DX / Speed          | 15%    | 9                      |
| Scalability         | 15%    | 9                      |
| Modularity Support  | 15%    | 10                     |
| **Weighted Score**  |        | **9.35 / 10**          |

---

## Rejected Alternatives

| Alternative       | Reason for Rejection                                           |
| ----------------- | -------------------------------------------------------------- |
| tRPC              | Over-engineering for this scale; Server Actions + TanStack Query suffice |
| Drizzle ORM       | Prisma has better migration tooling and studio                  |
| MongoDB           | Relational data (students, exams, grades) fits SQL better       |
| Redux             | Too much boilerplate for our state management needs             |
| Chakra UI         | Runtime CSS-in-JS, larger bundle than Tailwind + shadcn        |
| Express.js        | Next.js API routes eliminate need for separate server           |
| Socket.io         | Real-time not critical; polling/SSE sufficient for V1           |
| Clerk Auth        | Paid service; NextAuth is free and sufficient                   |
| Jest              | Vitest is faster, ESM-native, same API                          |
