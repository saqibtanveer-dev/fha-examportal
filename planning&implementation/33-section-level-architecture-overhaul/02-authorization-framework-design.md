# 02 — Authorization Framework Design

## Overview

The current authorization model is fragmented: each module implements its own ad-hoc checks at the action layer, while the query layer has ZERO authorization. This document designs a centralized, composable authorization framework that enforces section-level access control.

---

## 1. CURRENT STATE vs REQUIRED STATE

### Current Authorization Stack

```
Layer 1: Middleware (route-level)
  └── Role → Route mapping (ADMIN→/admin, TEACHER→/teacher, etc.)
  └── Active user check

Layer 2: Action (function-level)
  └── requireRole('TEACHER', 'ADMIN')  ← Role check only
  └── Ad-hoc module checks:
      - verifyTeacherAssignment(teacher, subject, class)  ← Diary only
      - isSubjectTeacherForSlot(...)                      ← Attendance only
      - canAccessSession(role, userId, createdById)       ← Exams only
      - assertFamilyStudentAccess(userId, studentId)      ← Family only

Layer 3: Query (NONE)
  └── Zero authorization
  └── Public functions returning all data
```

### Required Authorization Stack

```
Layer 1: Middleware (route-level) — KEEP AS-IS
  └── Role → Route mapping
  └── Active user check

Layer 2: Action (function-level) — ENHANCE
  └── requireRole()  ← Keep
  └── NEW: Centralized authorization guards:
      - assertTeacherSectionAccess(teacherId, classId, sectionId)
      - assertTeacherSubjectSectionAccess(teacherId, subjectId, classId, sectionId)
      - assertExamAccess(userId, role, examId)
      - assertStudentDataAccess(userId, role, studentId)
      - assertFamilyStudentAccess(userId, studentProfileId)  ← Already exists

Layer 3: Query (NEW — Scoped Queries)
  └── Role-aware query builders
  └── Mandatory scope parameters
  └── Separation of admin vs scoped queries
```

---

## 2. AUTHORIZATION GUARDS DESIGN

### 2.1 Core Guards File

**Location**: `src/lib/authorization-guards.ts`

```typescript
// === Teacher Section Access ===
// Verifies teacher is assigned to a specific section (as class teacher OR subject teacher)
assertTeacherSectionAccess(userId: string, classId: string, sectionId: string): Promise<void>

// === Teacher Subject-Section Access ===
// Verifies teacher teaches a specific subject in a specific section
assertTeacherSubjectSectionAccess(
  teacherProfileId: string, 
  subjectId: string, 
  classId: string, 
  sectionId: string
): Promise<void>

// === Exam Access ===
// Verifies user can access exam data (ADMIN=all, TEACHER=created or section-assigned)
assertExamAccess(userId: string, role: UserRole, examId: string): Promise<void>

// === Student Data Access ===
// Verifies user can view student data (section teacher, class teacher, admin, or principal)
assertStudentDataAccess(userId: string, role: UserRole, studentProfileId: string): Promise<void>

// === Grading Session Access ===
// Verifies teacher can grade a specific session (exam creator + student in their section)
assertGradingAccess(userId: string, role: UserRole, sessionId: string): Promise<void>
```

### 2.2 Guard Implementation Patterns

```typescript
// Pattern 1: Database lookup guard
export async function assertTeacherSubjectSectionAccess(
  teacherProfileId: string,
  subjectId: string,
  classId: string,
  sectionId: string
): Promise<void> {
  const assignment = await prisma.teacherSubject.findFirst({
    where: { teacherId: teacherProfileId, subjectId, classId, sectionId }
  });
  if (!assignment) {
    throw new AuthorizationError(
      'You are not assigned to teach this subject in this section'
    );
  }
}

// Pattern 2: Composite guard (OR logic)
export async function assertTeacherSectionAccess(
  userId: string,
  classId: string,
  sectionId: string
): Promise<void> {
  // Check 1: Is class teacher of this section?
  const isClassTeacher = await prisma.section.findFirst({
    where: { id: sectionId, classId, classTeacherId: userId }
  });
  if (isClassTeacher) return;

  // Check 2: Is subject teacher in this section?
  const teacherProfile = await prisma.teacherProfile.findUnique({
    where: { userId }
  });
  if (!teacherProfile) throw new AuthorizationError('Not a teacher');

  const hasAssignment = await prisma.teacherSubject.findFirst({
    where: { teacherId: teacherProfile.id, classId, sectionId }
  });
  if (hasAssignment) return;

  throw new AuthorizationError('You do not have access to this section');
}

// Pattern 3: Role-aware guard
export async function assertExamAccess(
  userId: string,
  role: UserRole,
  examId: string
): Promise<void> {
  if (role === 'ADMIN' || role === 'PRINCIPAL') return; // Full access

  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    select: { 
      createdById: true,
      examClassAssignments: { select: { classId: true, sectionId: true } }
    }
  });
  if (!exam) throw new NotFoundError('Exam not found');

  // Creator always has access
  if (exam.createdById === userId) return;

  if (role === 'TEACHER') {
    // Check if teacher teaches any section this exam is assigned to
    const teacherProfile = await prisma.teacherProfile.findUnique({ where: { userId } });
    if (!teacherProfile) throw new AuthorizationError('Not a teacher');

    const teacherSections = await prisma.teacherSubject.findMany({
      where: { teacherId: teacherProfile.id },
      select: { classId: true, sectionId: true }
    });

    const hasOverlap = exam.examClassAssignments.some(a =>
      teacherSections.some(ts => ts.classId === a.classId && ts.sectionId === a.sectionId)
    );
    if (!hasOverlap) throw new AuthorizationError('You do not teach any section assigned to this exam');
    return;
  }

  if (role === 'STUDENT') {
    const studentProfile = await prisma.studentProfile.findFirst({
      where: { userId },
      select: { classId: true, sectionId: true }
    });
    if (!studentProfile) throw new AuthorizationError('Not a student');

    const isAssigned = exam.examClassAssignments.some(
      a => a.classId === studentProfile.classId && a.sectionId === studentProfile.sectionId
    );
    if (!isAssigned) throw new AuthorizationError('This exam is not assigned to your section');
    return;
  }

  throw new AuthorizationError('Insufficient permissions');
}
```

---

## 3. AUTHORIZATION ERROR HANDLING

### 3.1 New Error Classes

**Location**: `src/errors/authorization-error.ts`

```typescript
export class AuthorizationError extends BaseError {
  constructor(message: string = 'Access denied') {
    super(message, 'AUTHORIZATION_ERROR', 403);
  }
}
```

### 3.2 Integration with safe-action

```typescript
// In safe-action.ts, catch AuthorizationError and return proper response
export function safeMutationAction<T>(fn: (...args: any[]) => Promise<T>) {
  return async (...args: any[]) => {
    try {
      return await fn(...args);
    } catch (error) {
      if (error instanceof AuthorizationError) {
        return { success: false, error: error.message };
      }
      // ... existing error handling
    }
  };
}
```

---

## 4. SCOPED QUERY PATTERN

### 4.1 Problem

Current queries are unscoped:

```typescript
// DANGEROUS: Returns all data regardless of caller
export async function getResultsByExam(examId: string) {
  return prisma.examResult.findMany({ where: { examId } });
}
```

### 4.2 Solution: Scope Context Object

```typescript
// Define scope context
interface QueryScope {
  role: UserRole;
  userId: string;
  teacherProfileId?: string;
  studentProfileId?: string;
  classId?: string;
  sectionId?: string;
}

// Scoped query
export async function getResultsByExam(examId: string, scope: QueryScope) {
  // Admin/Principal: see all results
  if (scope.role === 'ADMIN' || scope.role === 'PRINCIPAL') {
    return prisma.examResult.findMany({ where: { examId } });
  }

  // Teacher: see results for students in their sections only
  if (scope.role === 'TEACHER' && scope.teacherProfileId) {
    const teacherSections = await prisma.teacherSubject.findMany({
      where: { teacherId: scope.teacherProfileId },
      select: { classId: true, sectionId: true }
    });
    
    return prisma.examResult.findMany({
      where: {
        examId,
        student: {
          studentProfile: {
            OR: teacherSections.map(ts => ({
              classId: ts.classId,
              sectionId: ts.sectionId
            }))
          }
        }
      }
    });
  }

  // Student: see only own result
  if (scope.role === 'STUDENT') {
    return prisma.examResult.findMany({
      where: { examId, studentId: scope.userId }
    });
  }

  return [];
}
```

### 4.3 Query Naming Convention

```
// Unscoped (admin-only) — suffix: Admin
getResultsByExamAdmin(examId)

// Scoped (role-aware) — no suffix (default)
getResultsByExam(examId, scope)

// Student-specific — suffix: ForStudent
getResultsForStudent(studentId)
```

---

## 5. MODULE-LEVEL AUTHORIZATION MATRIX

### 5.1 Who Can Do What

| Action | ADMIN | PRINCIPAL | TEACHER | STUDENT | FAMILY |
|--------|-------|-----------|---------|---------|--------|
| **Create TeacherSubject** | ✅ Any | ❌ | ❌ | ❌ | ❌ |
| **Create Exam** | ✅ Any | ❌ | ✅ Own sections | ❌ | ❌ |
| **View Exam** | ✅ All | ✅ All | ✅ Own sections + created | ✅ Own section | ✅ Child's section |
| **Create Diary** | ✅ Any | ❌ | ✅ Own subject+section | ❌ | ❌ |
| **View Diary** | ✅ All | ✅ All | ✅ Own sections | ✅ Own section | ✅ Child's section |
| **Mark Daily Attendance** | ✅ Any | ❌ | ✅ Class teacher's section | ❌ | ❌ |
| **Mark Subject Attendance** | ✅ Any | ❌ | ✅ Own subject+section (via timetable) | ❌ | ❌ |
| **View Attendance** | ✅ All | ✅ All | ✅ Own sections | ✅ Own data | ✅ Child's data |
| **Grade Exam** | ✅ Any | ❌ | ✅ Created exam + own section students | ❌ | ❌ |
| **Enter Written Marks** | ✅ Any | ❌ | ✅ Created exam + own section students | ❌ | ❌ |
| **View Results** | ✅ All | ✅ All | ✅ Own exam results | ✅ Own results | ✅ Child's results |
| **View Analytics** | ✅ All | ✅ All | ✅ Own sections | ❌ | ❌ |
| **Create Questions** | ✅ Any | ❌ | ✅ Own assigned subjects | ❌ | ❌ |
| **Manage Timetable** | ✅ Any | ❌ | ❌ | ❌ | ❌ |
| **Manage Datesheet** | ✅ Any | ✅ Create/Edit | ❌ | ❌ | ❌ |
| **View Datesheet** | ✅ All | ✅ All | ✅ Own duties | ✅ Own class | ✅ Child's class |
| **Student Detail** | ✅ All | ✅ All | ✅ Own section students | ✅ Self only | ✅ Linked children only |

### 5.2 Teacher Access Scoping Rules

```
Rule 1: Teacher can ONLY see/modify data for sections where they have a TeacherSubject record
Rule 2: Class Teacher can see/modify daily attendance for their assigned section
Rule 3: Subject Teacher can see/modify subject-specific data for their assigned sections
Rule 4: Exam creator can see ALL data for their exam regardless of section assignment
Rule 5: ADMIN and PRINCIPAL bypass all section-level checks
```

---

## 6. IMPLEMENTATION PATTERN FOR ACTIONS

### 6.1 Standard Teacher Action Pattern

```typescript
export const createSomethingAction = safeMutationAction(async (input) => {
  // Step 1: Auth + Role
  const session = await requireRole('TEACHER', 'ADMIN');
  
  // Step 2: Validate input
  const validated = someSchema.parse(input);
  
  // Step 3: Section-level authorization (skip for ADMIN)
  if (session.user.role === 'TEACHER') {
    const teacherProfile = await getTeacherProfile(session.user.id);
    await assertTeacherSubjectSectionAccess(
      teacherProfile.id,
      validated.subjectId,
      validated.classId,
      validated.sectionId
    );
  }
  
  // Step 4: Business logic
  const result = await prisma.something.create({ data: validated });
  
  // Step 5: Audit + Revalidate
  await logAudit(session.user.id, 'CREATE', 'Something', result.id);
  revalidatePath('/teacher/something');
  
  return { success: true, data: result };
});
```

### 6.2 Standard Fetch Action Pattern

```typescript
export const fetchSomethingAction = safeFetchAction(async (classId, sectionId) => {
  const session = await requireRole('TEACHER', 'ADMIN', 'PRINCIPAL');
  
  // Build scope from session
  const scope = await buildQueryScope(session);
  
  // If teacher, verify section access
  if (session.user.role === 'TEACHER') {
    await assertTeacherSectionAccess(session.user.id, classId, sectionId);
  }
  
  // Use scoped query
  const data = await getSomethingBySection(classId, sectionId, scope);
  return serialize(data);
});
```

---

## 7. AUDIT LOGGING ENHANCEMENTS

### 7.1 Log Authorization Failures

```typescript
// In authorization-guards.ts
async function logAuthorizationFailure(
  userId: string,
  action: string,
  resource: string,
  details: Record<string, unknown>
) {
  await prisma.auditLog.create({
    data: {
      userId,
      action: 'AUTHORIZATION_FAILURE',
      entityType: resource,
      entityId: '',
      metadata: { attemptedAction: action, ...details }
    }
  });
}
```

### 7.2 Track Cross-Section Access Attempts

Every time a teacher tries to access data for a section they're not assigned to:
1. Log the attempt
2. Return generic "Access denied" (no information leakage)
3. If threshold exceeded → alert admin

---

## 8. PERFORMANCE CONSIDERATIONS

### 8.1 Caching Teacher Assignments

Teacher assignments change infrequently. Cache the `TeacherSubject` records per teacher:

```typescript
// Use in-memory cache (5-minute TTL)
const teacherAssignmentCache = new Map<string, { sections: TeacherSubject[], expiresAt: number }>();

export async function getTeacherAssignments(teacherProfileId: string): Promise<TeacherSubject[]> {
  const cached = teacherAssignmentCache.get(teacherProfileId);
  if (cached && cached.expiresAt > Date.now()) return cached.sections;

  const assignments = await prisma.teacherSubject.findMany({
    where: { teacherId: teacherProfileId }
  });
  
  teacherAssignmentCache.set(teacherProfileId, {
    sections: assignments,
    expiresAt: Date.now() + 5 * 60 * 1000
  });
  
  return assignments;
}
```

### 8.2 Invalidate on Assignment Change

When `TeacherSubject` records are created/updated/deleted, invalidate the cache:

```typescript
export function invalidateTeacherCache(teacherProfileId: string) {
  teacherAssignmentCache.delete(teacherProfileId);
}
```

---

## 9. FILE STRUCTURE FOR NEW AUTH CODE

```
src/lib/
├── auth.ts                      // Existing: NextAuth config
├── auth.config.ts               // Existing: Auth options
├── auth-utils.ts                // Existing: requireRole, requireAuth
├── authorization-guards.ts      // NEW: All guard functions
├── authorization-cache.ts       // NEW: Teacher assignment caching
└── query-scope.ts               // NEW: QueryScope type + builder

src/errors/
├── base-error.ts                // Existing
├── handle-error.ts              // Existing
└── authorization-error.ts       // NEW: AuthorizationError class
```
