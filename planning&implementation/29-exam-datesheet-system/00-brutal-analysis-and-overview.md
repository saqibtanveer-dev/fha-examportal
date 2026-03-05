# Exam Datesheet System — Brutal Analysis & Overview

> **Date:** March 5, 2026  
> **Status:** Planning Phase  
> **Priority:** High — Core school operations feature

---

## What Is An Exam Datesheet?

A **datesheet** is the official schedule published before exams start. It tells:
- Which **class** has which **subject's paper** on which **date**
- What **time** each paper starts/ends
- Which **teacher** has invigilation (duty) on which day and in which class
- The **room/venue** assignment

### Real-World Flow
1. Admin decides exam dates (e.g., "Final Term: March 15-25")
2. Admin creates a datesheet: maps dates → subjects → classes
3. Admin assigns teacher duties (invigilation) per paper per class
4. Datesheet is published → visible to all stakeholders
5. Teachers see their duty roster alongside the datesheet
6. Students/Parents see their class's exam schedule
7. Principal sees the complete school-wide datesheet

---

## Current State Analysis

### What Exists
- **Exam model** has `scheduledStartAt` and `scheduledEndAt` fields — these are per-exam schedule times, NOT a datesheet
- **TimetableEntry** system — interactive grid creation with day × period slots. This is the UX pattern we will heavily reuse
- **ExamClassAssignment** — already maps exams to classes/sections
- **PeriodSlot** — reusable time slot concept
- No concept of a "datesheet" as a cohesive document in the current schema

### What's Missing — EVERYTHING
| Gap | Severity | Impact |
|-----|----------|--------|
| No `Datesheet` model | **CRITICAL** | Cannot create/manage datesheets |
| No `DatesheetEntry` model | **CRITICAL** | Cannot map date+class+subject+time |
| No `DutyAssignment` model | **CRITICAL** | Cannot assign teacher duties |
| No datesheet status workflow | **HIGH** | No draft/publish lifecycle |
| No teacher duty view | **HIGH** | Teachers can't see their invigilation schedule |
| No student/family datesheet view | **HIGH** | Students/parents blind about exam schedule |
| No conflict detection | **MEDIUM** | Same teacher two duties simultaneously |
| No validation rules | **MEDIUM** | Same class two papers same time |
| No datesheet navigation routes | **LOW** | Sidebar links missing |

### What Can Be Reused
| Component/Pattern | From | How |
|---|---|---|
| `TimetableGrid` component | Timetable module | Adapt for date × time slot grid |
| `ClassSectionSelector` component | Timetable module | As-is for class filtering |
| `PeriodSlotManager` pattern | Timetable module | Reference for time slot management |
| `buildTimetableGrid()` utility | Timetable module | Adapt for `buildDatesheetGrid()` |
| `TeacherScheduleView` pattern | Timetable module | Adapt for `TeacherDutyView` |
| Form patterns (Dialog-based) | Timetable module | Same UX for entry creation |
| `safeAction` wrapper | Auth utils | All server actions |
| `ActionResult<T>` pattern | Types | Standard response type |
| Zustand store pattern | Reference store | If needed for datesheet state |
| TanStack Query pattern | All modules | Data fetching & caching |
| Audit logging pattern | Audit module | Track datesheet changes |
| Notification system | Notifications | Datesheet published alerts |

---

## Design Philosophy

### 1. Datesheet ≠ Individual Exam Schedule
The existing `Exam.scheduledStartAt` is for when an *individual online exam* opens. A datesheet is a **school-wide document** that schedules all exams across all classes for a term/session.

### 2. Interactive Grid UX (Inherited from Timetable)
Admin builds the datesheet in a **date × class grid** — same interactive pattern as the timetable's **day × period grid**. Click a cell → assign subject + time + room. Batch operations supported.

### 3. Teacher Duty as First-Class Concept
Teacher invigilation is not an afterthought. It's a core entity with conflict detection, workload balancing visibility, and a dedicated teacher-facing view.

### 4. Multi-Role Visibility
Each role sees the datesheet from their perspective:
- **Admin:** Full control — create, edit, publish, assign duties
- **Principal:** Read-only school-wide view with analytics
- **Teacher:** Their duty roster + class datesheets they're assigned to
- **Student:** Their class's datesheet only
- **Family:** Their child's class datesheet

### 5. Lifecycle: Draft → Published → Archived
Datesheets have a clear lifecycle. A published datesheet sends notifications. An archived one is for historical records.

---

## Stakeholder Requirements Matrix

| Requirement | Admin | Principal | Teacher | Student | Family |
|-------------|-------|-----------|---------|---------|--------|
| Create datesheet | ✅ | ❌ | ❌ | ❌ | ❌ |
| Edit datesheet | ✅ | ❌ | ❌ | ❌ | ❌ |
| Publish datesheet | ✅ | ❌ | ❌ | ❌ | ❌ |
| View all datesheets | ✅ | ✅ | ❌ | ❌ | ❌ |
| View class datesheet | ✅ | ✅ | ✅ | ✅ | ✅ |
| Assign teacher duties | ✅ | ❌ | ❌ | ❌ | ❌ |
| View own duty roster | ❌ | ❌ | ✅ | ❌ | ❌ |
| Receive publish notification | ❌ | ✅ | ✅ | ✅ | ✅ |
| Print / Export datesheet | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Schema migration breaks existing data | Low | High | Additive-only schema changes |
| Teacher duty conflicts overlooked | Medium | Medium | Hard conflict validation + UI warnings |
| Datesheet published with errors | Medium | High | Preview step before publish |
| Performance with many classes | Low | Medium | Indexed queries, pagination |
| UI complexity on admin grid | Medium | Medium | Progressive disclosure, tabs per class group |
| Same subject scheduled twice for a class | Low | High | Unique constraint + validation |

---

## Success Criteria

1. Admin can create a complete datesheet in under 5 minutes for 10 classes
2. All stakeholders see their relevant datesheet within 1 second of page load
3. Zero possibility of scheduling conflicts (enforced at DB + app level)
4. Teacher duty roster is clear, printable, and accurate
5. Datesheet publish triggers notifications to all affected users
6. No file exceeds 300 lines of code
7. Existing timetable components reused where possible without breaking timetable
