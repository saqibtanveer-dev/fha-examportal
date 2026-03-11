# Datesheet Section-Level Overhaul — Implementation Plan

## Phase 1: Schema Migration (sectionId Required)

### Files to Change
1. `prisma/schema.prisma` — Make sectionId required, update unique constraint
2. `src/validations/datesheet-schemas.ts` — Make sectionId required in create/bulk schemas

### Files to Create
1. `prisma/migrations/XXXX_datesheet_section_required/migration.sql` — Migration

---

## Phase 2: Server Actions Update

### Files to Change
1. `src/modules/datesheet/datesheet-queries.ts` — Update all queries to use exact sectionId match
2. `src/modules/datesheet/datesheet-entry-actions.ts` — require sectionId, add "apply to all sections" bulk mode
3. `src/modules/datesheet/datesheet-fetch-actions.ts` — Update student/family fetch to use exact section match

### Files to Create  
1. `src/modules/datesheet/datesheet-section-utils.ts` — Section expansion helper (expand class → all sections)

---

## Phase 3: Types & Utils Update

### Files to Change
1. `src/modules/datesheet/datesheet.types.ts` — section is required in DatesheetEntryWithRelations
2. `src/modules/datesheet/datesheet.utils.ts` — Update grid builder for section dimension

---

## Phase 4: Frontend Components Update

### Files to Change
1. `src/modules/datesheet/components/datesheet-grid.tsx` — Section-aware grid (date × class-section)
2. `src/modules/datesheet/components/datesheet-entry-form.tsx` — Required section + "Apply to All" checkbox
3. `src/modules/datesheet/components/datesheet-class-view.tsx` — Group by section
4. `src/modules/datesheet/components/datesheet-print-view.tsx` — Section column
5. `src/modules/datesheet/components/teacher-duty-view.tsx` — Show section info

### Files to Create
1. `src/modules/datesheet/components/section-select.tsx` — Reusable section selector with "Apply to All"

---

## Phase 5: Page Updates

### Files to Change
1. `src/app/(dashboard)/admin/datesheet/[id]/datesheet-detail-client.tsx` — Pass sections to grid
2. Student/Family client pages — Use exact sectionId

---

## Execution Order

```
1. Schema migration (sectionId required)
2. Validation schemas update  
3. Types update (section required in types)
4. Query functions update
5. Server actions update
6. Utils update (grid builder)
7. Components update (grid, forms, views)
8. Page updates
9. Testing
```
