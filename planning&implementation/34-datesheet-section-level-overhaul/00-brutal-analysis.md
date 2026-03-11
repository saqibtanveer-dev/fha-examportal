# Datesheet System — Brutal Deep Analysis: Section-Level Architecture Gap

## Problem Statement

The **datesheet system is designed CLASS-WISE** but **real-world schools need SECTION-LEVEL scheduling**.

### Real-World Scenario (BROKEN)

```
School: Class 10 has sections A, B, C

Current System:
  DatesheetEntry: { classId: "class10", sectionId: null, subject: "Math", date: Mar 15, 09:00-12:00 }
  → ALL sections (A, B, C) see "Math" on Mar 15

Reality Required:
  Section A: Math on Mar 15
  Section B: English on Mar 15    ← DIFFERENT PAPER
  Section C: Math on Mar 15       ← Same as A, BUT different room, different invigilator

  Even when paper IS same:
  Section A: Room 101, Invigilator: Sir Ahmad
  Section B: Room 102, Invigilator: Ma'am Sara  ← DIFFERENT DUTY STAFF
  Section C: Room 103, Invigilator: Sir Ahmad    ← DIFFERENT ROOM
```

### Why Current System Fails

| Issue | Current Behavior | Required Behavior | Severity |
|-------|------------------|-------------------|----------|
| Same subject, different rooms | One room for all sections | Room per section | 🔴 CRITICAL |
| Different subjects same day | Cannot differ per section | Subject per section per day | 🔴 CRITICAL |
| Different invigilators | Duty assigned to entry (class-wide) | Duty per section | 🔴 CRITICAL |
| Student view | Shows class-level schedule only | Shows section-specific schedule | 🔴 CRITICAL |
| Print view | One datesheet for class | Datesheet per section (or combined) | 🟠 HIGH |
| Grid view | Grid is date×class | Grid should be date×class-section | 🟠 HIGH |
| Conflict detection | Checks class-level overlap | Should check section-level overlap | 🔴 CRITICAL |

---

## Root Cause Analysis

### Issue 1: `sectionId` is OPTIONAL on DatesheetEntry

```prisma
model DatesheetEntry {
  classId    String
  sectionId  String?   // ← NULL means "all sections" — AMBIGUOUS
}
```

**Problem**: When `sectionId = null`, it's supposed to mean "applies to all sections". But then:
- You can't have different rooms per section
- You can't have different invigilators per section  
- You can't have different subjects per section

**Fix**: `sectionId` MUST be required. If an entry applies to all sections, create one entry per section.

### Issue 2: Grid Structure is Date × Class (Not Date × Class+Section)

```typescript
type DatesheetGridData = {
  grid: Record<string, Record<string, DatesheetEntryWithRelations | null>>;
  //     ^date             ^classId  ← NO SECTION DIMENSION
};
```

The grid only maps `date → classId → entry`. It has no concept of section.

### Issue 3: Unique Constraint Blocks Multi-Section Entries

```prisma
@@unique([datesheetId, classId, sectionId, subjectId])
```

This unique constraint means: one entry per (datesheet, class, section, subject). Since `sectionId` can be null, you can only have ONE null-section entry per class per subject. This blocks creating a "class-wide" entry AND section-specific entries simultaneously.

### Issue 4: Entry Form has "All Sections" Sentinel

The entry form uses `"__all__"` sentinel value meaning "no specific section". This design pattern doesn't scale to section-level scheduling.

### Issue 5: Duty is per Entry, Not per Section

```prisma
model DatesheetDuty {
  datesheetEntryId String     // ← Tied to entry, not to section
}
```

If entry is class-wide, duty is class-wide. No way to assign different teachers to different sections for the same exam.

---

## Architecture Decision: "Section-First" Design

### Philosophy

> **Every DatesheetEntry targets exactly ONE section.** 
> If the admin wants the same exam for all sections of a class, the system creates N entries (one per section).
> This is the ONLY correct way to handle rooms, duties, and schedules per section.

### Why Not Keep Optional sectionId?

| Approach | Pro | Con |
|----------|-----|-----|
| Optional sectionId (current) | Fewer records | Can't differentiate rooms/duties/times per section |
| Required sectionId (proposed) | Full section control | More records, but trivial with bulk create |

**Decision**: Required sectionId. Use "Apply to All Sections" checkbox in UI that creates N entries automatically.

---

## What Changes

### Database Schema
1. `DatesheetEntry.sectionId` → **Required** (no more null)
2. Unique constraint updated: `[datesheetId, classId, sectionId, subjectId, examDate]` (add examDate to allow retakes)
3. Index updated for optimal section queries

### Server Actions
1. Entry creation: Validate sectionId is required
2. Bulk create: Add "apply to all sections" mode
3. Conflict detection: Check per-section, not per-class
4. Student fetch: Filter by exact sectionId, not OR[sectionId, null]

### Frontend
1. Entry form: Section selector is REQUIRED (with "Apply to All" checkbox)
2. Grid view: Add section dimension → date × class-section
3. Class view: Group by section within class
4. Print view: Section-specific or combined view
5. Mobile responsive: Card-based layout for small screens

### Query Layer
1. `listEntriesByClass` → filter by exact sectionId
2. `getPublishedDatesheetForClass` → filter by exact sectionId
3. `hasEntryConflict` → check within same section only

---

## Impact on Production (1000+ Students)

### Performance Analysis

| Metric | Before (null section) | After (per-section entries) |
|--------|----------------------|----------------------------|
| Entries per datesheet | ~50 (class-wide) | ~150 (3 sections × 50) | 
| Index hit ratio | Good | Better (sectionId indexed) |
| Query complexity | OR[sectionId, null] | Exact match (faster) |
| Total duties | 50 × 2 = 100 | 150 × 1 = 150 (but more targeted) |
| Student query time | Filter after fetch | Direct indexed query |

**Verdict**: More rows but simpler queries. Net performance is BETTER because section-specific indexes eliminate OR-based queries.

### Scalability Numbers

For a school with:
- 30 classes × 3 sections = 90 class-sections
- 8 subjects per class
- 2 exam types per year (mid + final)

```
Entries per datesheet: 90 × 8 = 720
Entries per year: 720 × 2 = 1,440
Duties per year: 1,440 × 2 = 2,880
Total records: ~5,000/year
```

With Prisma + PostgreSQL indexes, this is trivially handleable even at 10x scale (50K records).
