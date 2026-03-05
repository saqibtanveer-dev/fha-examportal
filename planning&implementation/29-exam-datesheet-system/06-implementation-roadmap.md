# Exam Datesheet System — Implementation Roadmap

> **Date:** March 5, 2026  
> **Principle:** Incremental delivery. Each phase is independently testable and deployable.

---

## Phase Overview

```
Phase 1: Schema & Core Backend ──────────── (Foundation)
Phase 2: Admin CRUD & Grid UI ──────────── (Core Feature)
Phase 3: Duty Management ───────────────── (Teacher Assignment)
Phase 4: Multi-Role Read Views ─────────── (Visibility)
Phase 5: Publish Flow & Notifications ──── (Go-Live)
Phase 6: Dashboard Widgets & Polish ────── (Integration)
Phase 7: CT Scan & Hardening ──────────── (Quality Assurance)
```

---

## Phase 1: Schema & Core Backend

### Tasks
1. **Add Prisma schema models**
   - Add `DatesheetStatus` enum
   - Add `Datesheet`, `DatesheetEntry`, `DatesheetDuty` models
   - Add relation fields to existing models (`User`, `Class`, `Section`, `Subject`, `TeacherProfile`, `AcademicSession`)
   - Run `prisma migrate dev --name add_datesheet_system`

2. **Create module scaffold**
   ```
   src/modules/datesheet/
   ├── datesheet.types.ts
   ├── datesheet.constants.ts
   ├── datesheet.utils.ts
   ├── datesheet-queries.ts
   └── index.ts
   ```

3. **Implement database queries** (`datesheet-queries.ts`)
   - All select/include objects
   - `listDatesheets`, `getDatesheetById`, `getDatesheetWithEntries`
   - `listEntriesByDatesheet`, `listEntriesByClass`, `getEntryById`
   - `listDutiesByEntry`, `listDutiesByTeacher`
   - `hasEntryConflict`, `hasTeacherDutyConflict`
   - `getPublishedDatesheetForClass`, `getTeacherDutyRoster`
   - `getDatesheetStats`

4. **Create validation schemas** (`src/validations/datesheet-schemas.ts`)
   - All Zod schemas defined in the API design doc

5. **Add query keys** to `src/lib/query-keys.ts`

### Deliverable
- Prisma schema migrated and tested
- All queries tested via Prisma Studio / seed data
- Zero impact on existing features

---

## Phase 2: Admin CRUD & Grid UI

### Tasks
1. **Implement server actions**
   - `datesheet-lifecycle-actions.ts` — Create, Update, Delete datesheet
   - `datesheet-entry-actions.ts` — Create, Update, Delete, Bulk Create entries
   - `datesheet-fetch-actions.ts` — All read actions for admin

2. **Add routes** to `src/lib/constants.ts`
   - `ROUTES.ADMIN.DATESHEET`, `ROUTES.ADMIN.DATESHEET_NEW`

3. **Add nav item** to `nav-config.ts` for admin sidebar

4. **Build page structure**
   ```
   src/app/(dashboard)/admin/datesheet/
   ├── page.tsx
   ├── datesheet-list-client.tsx
   ├── error.tsx
   ├── new/
   │   ├── page.tsx
   │   └── create-datesheet-client.tsx
   └── [id]/
       ├── page.tsx
       ├── datesheet-detail-client.tsx
       └── error.tsx
   ```

5. **Build core components**
   - `DatesheetList` — datasheets table with filters and actions
   - `DatesheetForm` — create/edit datesheet metadata dialog
   - `DatesheetGrid` — the main interactive date × class grid
   - `DatesheetEntryForm` — dialog for adding/editing entries
   - `DatesheetStatusBadge` — status display component

6. **Build hooks**
   - `use-datesheet.ts` — query hooks
   - `use-datesheet-mutations.ts` — mutation hooks with invalidation

7. **Add cache invalidation** methods to `src/lib/cache-utils.ts`

### Deliverable
- Admin can create datesheets, add entries via interactive grid
- Grid UX matches timetable pattern (click cell → dialog)
- Entries validated for conflicts
- Full audit trail

---

## Phase 3: Duty Management

### Tasks
1. **Implement duty server actions** (`datesheet-duty-actions.ts`)
   - `assignDutyAction`, `updateDutyAction`, `removeDutyAction`
   - `bulkAssignDutiesAction`
   - Conflict detection for teacher overlaps

2. **Build duty components**
   - `DatesheetDutyForm` — assign teacher duties dialog
   - Update `DatesheetGrid` to show duty info in cells
   - Build Teacher Duties tab on admin datesheet detail page

3. **Duty summary view**
   - Table showing: Date → Paper → Class → Assigned Teachers
   - Warning indicators for papers with no teachers assigned
   - Conflict indicators if detected

### Deliverable
- Admin can assign teacher duties to any datesheet entry
- Conflicts prevented at action level
- Visual indicators for unassigned papers

---

## Phase 4: Multi-Role Read Views

### Tasks
1. **Add routes** to `src/lib/constants.ts`
   - `ROUTES.PRINCIPAL.DATESHEET`
   - `ROUTES.TEACHER.DATESHEET`
   - `ROUTES.STUDENT.DATESHEET`
   - `ROUTES.FAMILY.DATESHEET`

2. **Add nav items** to `nav-config.ts` for all roles

3. **Build read-only components**
   - `DatesheetClassView` — vertical cards grouped by date (student/family)
   - `TeacherDutyView` — duty roster cards (teacher)
   - `DatesheetPrintView` — print-optimized layout

4. **Build role-specific pages**
   - Principal: School-wide read-only grid view with class selector
   - Teacher: Tabs for "My Duties" and "Class Datesheets"
   - Student: Class-specific card view
   - Family: Child-specific card view with ChildSelector

5. **Implement role-scoped fetch actions**
   - `fetchPublishedDatesheetListAction` (Principal/Teacher)
   - `fetchMyDutyRosterAction` (Teacher)
   - `fetchMyDatesheetAction` (Student)
   - `fetchChildDatesheetAction` (Family)

### Deliverable
- All roles can view relevant datesheet data
- Teacher sees duty roster prominently
- Student/Family see clean card-based schedule
- Principal sees school-wide grid

---

## Phase 5: Publish Flow & Notifications

### Tasks
1. **Implement publish/unpublish/archive actions**
   - `publishDatesheetAction` with pre-publish validation
   - `unpublishDatesheetAction`
   - `archiveDatesheetAction`

2. **Pre-publish validation UI**
   - Validation check dialog showing errors/warnings
   - Admin confirms after reviewing warnings
   - Blocking on hard errors

3. **Notification integration**
   - `sendDatesheetPublishedNotifications()` helper
   - Bulk notification creation for all affected users
   - Fire-and-forget pattern

4. **Status transition UI**
   - Publish button with confirmation dialog
   - Status badge updates
   - Unpublish/Archive actions

### Deliverable
- Full datesheet lifecycle: Draft → Published → Archived
- All stakeholders notified on publish
- Pre-publish validation catches issues

---

## Phase 6: Dashboard Widgets & Polish

### Tasks
1. **Dashboard widgets** (small cards/sections)
   - Admin: "Upcoming Exams" widget
   - Teacher: "My Upcoming Duties" widget
   - Student: "My Upcoming Exams" widget
   - Principal: "Exam Overview" widget
   - Family: "Child's Exams" widget

2. **Print functionality**
   - Print-optimized CSS
   - Per-class print option
   - Teacher duty roster print

3. **UX Polish**
   - Loading states for all routes
   - Empty states for no datesheets
   - Error boundaries
   - Responsive design for tablets/mobile
   - Tooltips on grid cells

4. **Performance**
   - Ensure grid renders efficiently for 20+ classes
   - Paginate or virtualize if needed
   - Proper query caching

### Deliverable
- Datesheet visible from every dashboard
- Print-ready for physical distribution
- Mobile-friendly

---

## Phase 7: CT Scan & Hardening

### Tasks
1. **Full system CT scan**
   - Verify every route works with correct auth
   - Test all conflict detection scenarios
   - Test notification delivery
   - Test cascade deletes
   - Test concurrent access

2. **Edge case testing**
   - Empty datesheet
   - Single entry datesheet
   - Datesheet spanning weekends/holidays
   - Teacher with no profile
   - Student in a class with no datesheet entries
   - Family with multiple children in different classes

3. **Code quality audit**
   - No file > 300 lines
   - All types properly defined
   - All imports correct
   - No unused code

4. **Performance audit**
   - Query performance with 50+ classes
   - Grid rendering with 20+ dates × 50 classes
   - Notification bulk creation for 500+ users

5. **Security audit**
   - All actions use `requireRole()`
   - Family access uses `assertFamilyStudentAccess()`
   - No data leakage between roles
   - Input validation on every mutation

### Deliverable
- Production-ready, battle-tested datesheet system
- Zero known bugs or missing functionality

---

## File Count Summary

| Category | Files | Avg Lines |
|----------|-------|-----------|
| Module files | 8 | ~150 |
| Component files | 11 | ~180 |
| Hook files | 2 | ~120 |
| Validation file | 1 | ~100 |
| Page files (admin) | 6 | ~80 |
| Page files (principal) | 3 | ~60 |
| Page files (teacher) | 3 | ~60 |
| Page files (student) | 3 | ~60 |
| Page files (family) | 2 | ~50 |
| **Total** | **~39** | **~120** |

**No file exceeds 300 lines.** Maximum estimated file is `DatesheetGrid` at ~250 lines.

---

## Dependency Graph

```
Phase 1 (Schema)
    ↓
Phase 2 (Admin CRUD) ←───── CRITICAL PATH
    ↓
Phase 3 (Duties) ←── Phase 2 entries must exist first
    ↓
Phase 4 (Multi-Role Views) ←── Phase 2+3 data exists
    ↓
Phase 5 (Publish Flow) ←── Phase 2+3+4 all ready
    ↓
Phase 6 (Widgets & Polish) ←── Phase 5 publish works
    ↓
Phase 7 (CT Scan) ←── Everything built
```

---

## Testing Strategy

### Unit Tests
- `datesheet.utils.ts` — pure function tests
- `doTimesOverlap()`, `buildDatesheetGrid()`, `formatExamDate()`

### Integration Tests
- Conflict detection queries
- Entry CRUD with cascade deletes
- Duty assignment with conflict prevention
- Publish flow with notification creation

### E2E Scenarios
1. Admin creates datesheet → adds entries → assigns duties → publishes
2. Teacher views published datesheet → sees duty roster
3. Student views class datesheet
4. Family switches child → sees correct datesheet
5. Admin unpublishes → edits → republishes

### Manual QA Checklist
- [ ] Grid renders correctly for 1 class
- [ ] Grid renders correctly for 20+ classes
- [ ] Entry form validates all fields
- [ ] Conflict detection blocks duplicate entries
- [ ] Teacher duty conflict detection works
- [ ] Publish sends notifications
- [ ] All roles see correct data
- [ ] Print layout is clean
- [ ] Mobile layout is usable
- [ ] Empty states shown correctly
- [ ] Error states handled gracefully
