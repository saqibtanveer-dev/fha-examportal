# ExamCore - Authentication & RBAC Design

## Authentication Strategy

### Technology
- **NextAuth.js v5 (Auth.js)** with Credentials Provider
- **JWT** for stateless session tokens
- **Database sessions** as fallback for critical operations
- **bcrypt** for password hashing (12 salt rounds)

---

## Auth Flow

### Login Flow
```
1. User enters email + password on /login
2. Server Action validates input (Zod schema)
3. Lookup user by email in database
4. Verify password against hash (bcrypt.compare)
5. Check user.isActive === true
6. Check user.deletedAt === null
7. Create session with NextAuth (JWT strategy)
   - Token contains: { userId, email, role, name }
8. Set HTTP-only secure cookie
9. Redirect to role-based dashboard:
   - ADMIN → /admin/dashboard
   - TEACHER → /teacher/dashboard
   - STUDENT → /student/dashboard
```

### Session Structure
```typescript
interface SessionUser {
  id: string;          // UUID
  email: string;
  name: string;        // firstName + lastName
  role: UserRole;      // ADMIN | TEACHER | STUDENT
  avatarUrl?: string;
}

interface Session {
  user: SessionUser;
  expires: string;     // ISO date string
}
```

### Token Refresh Strategy
```
- Access token lifespan: 1 hour
- Session max age: 24 hours
- Automatic refresh on page load if token near expiry
- Force re-login if session expired
```

---

## Role-Based Access Control (RBAC)

### Role Hierarchy
```
ADMIN (highest)
  └── Can manage everything
TEACHER
  └── Can manage own subjects, questions, exams
STUDENT (lowest)
  └── Can take exams, view own results
```

### Permission Matrix

| Resource              | Action         | Admin | Teacher | Student |
| --------------------- | -------------- | ----- | ------- | ------- |
| **Users**             | Create         | YES   | NO      | NO      |
| **Users**             | Read (all)     | YES   | NO      | NO      |
| **Users**             | Update (any)   | YES   | NO      | NO      |
| **Users**             | Delete         | YES   | NO      | NO      |
| **Own Profile**       | Read           | YES   | YES     | YES     |
| **Own Profile**       | Update         | YES   | YES     | YES     |
| **Classes**           | CRUD           | YES   | NO      | NO      |
| **Sections**          | CRUD           | YES   | NO      | NO      |
| **Departments**       | CRUD           | YES   | NO      | NO      |
| **Subjects**          | CRUD           | YES   | NO      | NO      |
| **Questions**         | Create         | NO    | YES     | NO      |
| **Questions**         | Read (own)     | NO    | YES     | NO      |
| **Questions**         | Read (all)     | YES   | NO      | NO      |
| **Questions**         | Update (own)   | NO    | YES     | NO      |
| **Questions**         | Delete (own)   | NO    | YES     | NO      |
| **Exams**             | Create         | NO    | YES     | NO      |
| **Exams**             | Read (own)     | NO    | YES     | NO      |
| **Exams**             | Read (all)     | YES   | NO      | NO      |
| **Exams**             | Update (own)   | NO    | YES     | NO      |
| **Exams**             | Delete (own)   | NO    | YES     | NO      |
| **Exams**             | Take           | NO    | NO      | YES     |
| **Grades**            | AI Auto-grade  | ---   | ---     | ---     |
| **Grades**            | Review/Override| NO    | YES     | NO      |
| **Results**           | View (own)     | NO    | NO      | YES     |
| **Results**           | View (class)   | YES   | YES     | NO      |
| **Results**           | Publish        | NO    | YES     | NO      |
| **Analytics**         | Admin Dashboard| YES   | NO      | NO      |
| **Analytics**         | Teacher Dash   | NO    | YES     | NO      |
| **Analytics**         | Student Dash   | NO    | NO      | YES     |
| **Settings**          | School Config  | YES   | NO      | NO      |
| **Notifications**     | Own            | YES   | YES     | YES     |
| **Audit Logs**        | View           | YES   | NO      | NO      |

---

## Implementation Architecture

### Middleware-Based Route Protection

```typescript
// middleware.ts — runs on EVERY request
// Pattern: /[role]/[...path]

const ROUTE_PERMISSIONS = {
  '/admin':   ['ADMIN'],
  '/teacher': ['ADMIN', 'TEACHER'],
  '/student': ['ADMIN', 'STUDENT'],
  '/api/v1':  ['ADMIN', 'TEACHER', 'STUDENT'], // further checked in handlers
};

// Flow:
// 1. Check if route is public (login, etc.) → allow
// 2. Get session from JWT cookie
// 3. No session → redirect to /login
// 4. Check role against route permissions
// 5. Unauthorized role → redirect to own dashboard
// 6. Authorized → continue
```

### Server Action Authorization Pattern

```typescript
// Every server action follows this pattern:

async function createExamAction(formData: FormData) {
  // 1. Get session
  const session = await auth();
  if (!session) throw new AuthenticationError();

  // 2. Check role
  assertRole(session.user.role, ['TEACHER']);

  // 3. Validate input
  const validated = createExamSchema.parse(parseFormData(formData));

  // 4. Check ownership/access (if applicable)
  // Teacher can only create exams for their assigned subjects
  await assertTeacherSubjectAccess(session.user.id, validated.subjectId);

  // 5. Execute business logic
  const exam = await examService.createExam(validated, session.user.id);

  // 6. Revalidate and return
  revalidatePath('/teacher/exams');
  return exam;
}
```

### Authorization Helper Functions

```typescript
// lib/auth/assert-role.ts (~20 lines)
function assertRole(userRole: UserRole, allowedRoles: UserRole[]): void

// lib/auth/assert-ownership.ts (~25 lines)
function assertOwnership(resourceOwnerId: string, userId: string): void

// lib/auth/assert-teacher-subject.ts (~30 lines)
async function assertTeacherSubjectAccess(teacherId: string, subjectId: string): Promise<void>

// lib/auth/assert-student-exam-access.ts (~30 lines)
async function assertStudentExamAccess(studentId: string, examId: string): Promise<void>

// lib/auth/get-session-user.ts (~15 lines)
async function getSessionUser(): Promise<SessionUser>  // throws if not authenticated
```

---

## Protected Route Groups (App Router)

```
app/
├── (public)/                    # No auth required
│   ├── login/page.tsx
│   ├── forgot-password/page.tsx
│   └── reset-password/page.tsx
│
├── (authenticated)/             # Any logged-in user
│   ├── layout.tsx               # Auth check layout
│   ├── profile/page.tsx
│   └── change-password/page.tsx
│
├── (admin)/                     # ADMIN only
│   └── admin/
│       ├── layout.tsx           # Admin sidebar layout
│       ├── dashboard/page.tsx
│       ├── users/page.tsx
│       ├── classes/page.tsx
│       ├── subjects/page.tsx
│       └── settings/page.tsx
│
├── (teacher)/                   # TEACHER only
│   └── teacher/
│       ├── layout.tsx           # Teacher sidebar layout
│       ├── dashboard/page.tsx
│       ├── questions/page.tsx
│       ├── exams/page.tsx
│       └── grading/page.tsx
│
└── (student)/                   # STUDENT only
    └── student/
        ├── layout.tsx           # Student sidebar layout
        ├── dashboard/page.tsx
        ├── exams/page.tsx
        ├── exam/[id]/page.tsx   # Exam taking
        └── results/page.tsx
```

---

## Security Measures

### Password Policy
```
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character
- Cannot be same as email
- Validated with Zod regex pattern
```

### Brute Force Protection
```
- 5 failed login attempts → 15 minute lockout
- Tracked per IP + email combination
- Stored in Redis with TTL
- Reset on successful login
```

### Session Security
```
- HTTP-only cookies (no JS access)
- Secure flag (HTTPS only in production)
- SameSite=Lax (CSRF protection)
- Session invalidation on password change
- Single session per user (optional — configurable)
```

### Exam Session Security
```
- Validate exam is in ACTIVE/PUBLISHED status
- Validate student is assigned to exam's class
- Validate exam is within scheduled time window
- Validate student hasn't exceeded max attempts
- Track IP and user agent for audit
- Prevent multiple simultaneous sessions for same exam
```

---

## Initial Admin Setup

### First-Run Seed
```
On first deployment:
1. Check if any ADMIN user exists
2. If not, create default admin:
   - Email: admin@school.com
   - Password: (from environment variable ADMIN_INITIAL_PASSWORD)
   - Role: ADMIN
3. Force password change on first login
```

### Admin Capabilities
```
- Create other admin accounts
- Create teacher accounts (or bulk import)
- Create student accounts (or bulk import)
- Reset any user's password
- Activate/deactivate any account
- View audit logs of all actions
```
