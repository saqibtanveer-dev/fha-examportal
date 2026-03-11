# 04 — UI/UX Design Specification

> **Date**: 2026-03-11
> **Depends On**: `02-timetable-enrollment-architecture.md`, `03-module-by-module-fix-plan.md`
> **Focus**: Mobile-first, production-grade UI for elective management

---

## 1. DESIGN PRINCIPLES

1. **Mobile-first**: All layouts designed for 375px first, scale up
2. **Progressive disclosure**: Don't overwhelm — show complexity only when needed
3. **Visual differentiation**: Elective slots visually distinct from regular slots
4. **Zero-confusion**: Any user (admin, teacher, student, parent) instantly understands the UI
5. **Accessibility**: WCAG 2.1 AA compliance, keyboard navigable

---

## 2. TIMETABLE GRID — ELECTIVE CELLS

### Desktop Layout (≥1024px)

```
┌──────────┬────────────┬────────────┬────────────┐
│ Period   │ Monday     │ Tuesday    │ Wednesday  │
├──────────┼────────────┼────────────┼────────────┤
│ Period 1 │ ┌────────┐ │ ┌────────┐ │ ┌────────┐ │
│ 08:00    │ │English │ │ │ Urdu   │ │ │ Math   │ │
│   —      │ │Sir Ali │ │ │Ma'am Z │ │ │Sir K   │ │
│ 08:45    │ │R: 101  │ │ │R: 101  │ │ │R: 102  │ │
│          │ └────────┘ │ └────────┘ │ └────────┘ │
├──────────┼────────────┼────────────┼────────────┤
│ Period 3 │ ┌────────┐ │            │            │
│ 10:00    │ │⚡ELECTIVE│ │            │            │
│   —      │ │┌──────┐│ │            │            │
│ 10:45    │ ││🟢Bio ││ │            │            │
│          │ ││20 stu ││ │            │            │
│          │ │├──────┤│ │            │            │
│          │ ││🔵CS  ││ │            │            │
│          │ ││15 stu ││ │            │            │
│          │ │├──────┤│ │            │            │
│          │ ││🟡Stat ││ │            │            │
│          │ ││10 stu ││ │            │            │
│          │ │└──────┘│ │            │            │
│          │ └────────┘ │            │            │
└──────────┴────────────┴────────────┴────────────┘
```

**Visual Cues:**
- ⚡ "ELECTIVE" badge at top of cell
- Each subject as a colored mini-card
- Student count badge on each
- Slightly larger cell height (auto-expand)

### Tablet Layout (768px – 1023px)

Same as desktop but subjects shown as pill badges:
```
│ Period 3 │ ⚡ Bio(20) CS(15) Stats(10) │
```

### Mobile Layout (< 768px)

Timetable becomes a vertical list per day:
```
┌─────────────────────────────────┐
│ 📅 Monday                       │
├─────────────────────────────────┤
│ Period 1 (08:00-08:45)          │
│ English — Sir Ali — Room 101    │
├─────────────────────────────────┤
│ Period 3 (10:00-10:45)          │
│ ⚡ Elective Block                │
│  ┌─ 🟢 Biology ──────────────┐  │
│  │  Sir Ahsan · Room 201     │  │
│  │  20 students enrolled     │  │
│  └────────────────────────────┘  │
│  ┌─ 🔵 Computer Science ─────┐  │
│  │  Ma'am Sana · CS Lab      │  │
│  │  15 students enrolled     │  │
│  └────────────────────────────┘  │
│  ┌─ 🟡 Statistics ───────────┐  │
│  │  Sir Kamran · Room 205    │  │
│  │  10 students enrolled     │  │
│  └────────────────────────────┘  │
└─────────────────────────────────┘
```

---

## 3. STUDENT'S PERSONAL TIMETABLE

Students ONLY see their enrolled subject for elective periods:

```
┌──────────┬────────────┬────────────┐
│ Period   │ Monday     │ Tuesday    │
├──────────┼────────────┼────────────┤
│ Period 3 │ ┌────────┐ │            │
│ 10:00    │ │Biology │ │            │
│   —      │ │Sir A   │ │            │
│ 10:45    │ │R: 201  │ │            │
│          │ │(Elect.)│ │            │
│          │ └────────┘ │            │
└──────────┴────────────┴────────────┘
```

- Small "(Elective)" label to indicate this is their chosen subject
- No stacked view — they see ONE subject per cell
- Color still matches the elective group color

---

## 4. ELECTIVE ENROLLMENT MANAGEMENT PAGE

### Page Location: `/admin/subjects/elective-enrollment`

### Layout

```
┌─────────────────────────────────────────────────────────┐
│ Elective Enrollment Management                          │
│ ┌─────────────────────┐ ┌────────────────────────────┐  │
│ │ Class: [11 ▼]       │ │ Session: [2025-26 ▼]       │  │
│ └─────────────────────┘ └────────────────────────────┘  │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 📦 Elective Group: "Science Elective"               │ │
│ │                                                     │ │
│ │ ┌──────────┐ ┌──────────┐ ┌──────────┐             │ │
│ │ │ 🟢 Bio   │ │ 🔵 CS    │ │ 🟡 Stats │             │ │
│ │ │ 20 / 45  │ │ 15 / 45  │ │ 10 / 45  │             │ │
│ │ └──────────┘ └──────────┘ └──────────┘             │ │
│ │                                                     │ │
│ │ ⚠️ 0 unassigned students                            │ │
│ │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 100% assigned    │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Section: [A ▼]                    [Bulk Assign ▼]   │ │
│ │                                                     │ │
│ │ ┌────┬──────────┬────────────┬──────────┬────────┐  │ │
│ │ │ #  │ Name     │ Roll No    │ Elective │ Action │  │ │
│ │ ├────┼──────────┼────────────┼──────────┼────────┤  │ │
│ │ │ 1  │ Ahmed K  │ 11A-001    │ 🟢 Bio   │ [✏️]  │  │ │
│ │ │ 2  │ Sara M   │ 11A-002    │ 🔵 CS    │ [✏️]  │  │ │
│ │ │ 3  │ Ali R    │ 11A-003    │ 🟡 Stats │ [✏️]  │  │ │
│ │ │ 4  │ Fatima B │ 11A-004    │ ⚠️ None  │ [📌]  │  │ │
│ │ └────┴──────────┴────────────┴──────────┴────────┘  │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Mobile Layout

```
┌─────────────────────────────────┐
│ Elective Enrollment             │
│ Class: 11 · Session: 2025-26   │
│                                 │
│ ┌─ Science Elective ─────────┐  │
│ │ 🟢 Bio: 20  🔵 CS: 15      │  │
│ │ 🟡 Stats: 10               │  │
│ │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ 100%  │  │
│ └─────────────────────────────┘  │
│                                 │
│ Section: [A ▼]                  │
│                                 │
│ ┌─── Ahmed Khan (11A-001) ───┐  │
│ │ Current: 🟢 Biology        │  │
│ │ [Change to ▼]              │  │
│ └─────────────────────────────┘  │
│ ┌─── Sara Malik (11A-002) ───┐  │
│ │ Current: 🔵 Computer Sci   │  │
│ │ [Change to ▼]              │  │
│ └─────────────────────────────┘  │
│ ┌─── Fatima Bibi (11A-004) ──┐  │
│ │ ⚠️ Not Assigned             │  │
│ │ [Assign ▼]                 │  │
│ └─────────────────────────────┘  │
└─────────────────────────────────┘
```

---

## 5. ATTENDANCE MARKING — ELECTIVE-AWARE

### Teacher View: Subject Attendance for Elective

When Bio teacher opens attendance for Period 3:

```
┌─────────────────────────────────────────────┐
│ Subject Attendance                           │
│ 🟢 Biology · Period 3 · Monday · 11-A       │
│ ⚡ Elective Subject (20 enrolled students)   │
│                                              │
│ ┌────┬───────────┬─────────────┬──────────┐  │
│ │ #  │ Name      │ Roll No     │ Status   │  │
│ ├────┼───────────┼─────────────┼──────────┤  │
│ │ 1  │ Ahmed K   │ 11A-001     │ [P][A][L]│  │
│ │ 2  │ Ali R     │ 11A-005     │ [P][A][L]│  │
│ │ .. │ ...       │ ...         │ ...      │  │
│ │ 20 │ Zara S    │ 11A-040     │ [P][A][L]│  │
│ └────┴───────────┴─────────────┴──────────┘  │
│                                              │
│ Present: 18  Absent: 1  Late: 1              │
│ [Mark All Present] [Save Attendance]         │
└─────────────────────────────────────────────┘
```

**Key UI Differences from Regular Attendance:**
- "⚡ Elective Subject" badge
- Student count shows "20 enrolled" not "45 in section"
- Only enrolled students appear in the list
- Quick stats at bottom

### Teacher View: Mobile

```
┌─────────────────────────────┐
│ 🟢 Biology · Period 3 · Mon │
│ ⚡ Elective · 20 students    │
│                             │
│ [Mark All Present]          │
│                             │
│ ┌───────────────────────┐   │
│ │ Ahmed Khan (11A-001)  │   │
│ │ [✅P] [❌A] [⏰L] [🔖E] │   │
│ └───────────────────────┘   │
│ ┌───────────────────────┐   │
│ │ Ali Raza (11A-005)    │   │
│ │ [✅P] [❌A] [⏰L] [🔖E] │   │
│ └───────────────────────┘   │
│ ...                         │
│                             │
│ [Save Attendance]           │
└─────────────────────────────┘
```

---

## 6. EXAM CREATION — ELECTIVE-AWARE

### Create Exam Dialog

When teacher selects an elective subject:

```
┌─────────────────────────────────────────┐
│ Create Exam                              │
│                                          │
│ Subject: [Biology ▼]                     │
│ ⚡ Elective Subject — enrolled students  │
│    only will receive this exam            │
│                                          │
│ Assign to:                               │
│ ☑ Class 11 - Section A (20 Bio students) │
│ ☑ Class 11 - Section B (18 Bio students) │
│ ☐ Class 11 - Section C (0 Bio students)  │
│                                          │
│ Total students: 38                       │
│                                          │
│ [Cancel]              [Create Exam]      │
└─────────────────────────────────────────┘
```

### Key Point
- Shows enrolled student count per section (not total section count)
- Sections with 0 enrolled students are greyed out
- Info banner explains "only enrolled students will receive this exam"

---

## 7. REPORT CARD — ELECTIVE-AWARE

### Report Card Layout

```
┌───────────────────────────────────────────────────┐
│              SCHOOL NAME                           │
│              REPORT CARD                           │
│                                                    │
│ Student: Ahmed Khan    │ Class: 11-A               │
│ Roll No: 11A-001       │ Session: 2025-26          │
│                                                    │
│ ═══ COMPULSORY SUBJECTS ═══════════════════════    │
│                                                    │
│ Subject      │ Total │ Obtained │ %     │ Grade    │
│ ────────────────────────────────────────────────   │
│ English      │ 100   │ 85      │ 85%   │ A        │
│ Urdu         │ 100   │ 78      │ 78%   │ B+       │
│ Islamiat     │ 75    │ 68      │ 90.7% │ A+       │
│ Pak Studies  │ 75    │ 66      │ 88%   │ A        │
│                                                    │
│ ═══ ELECTIVE: Pre-Medical ═════════════════════    │
│                                                    │
│ Biology      │ 100   │ 75      │ 75%   │ B+       │
│ Chemistry    │ 100   │ 82      │ 82%   │ A-       │
│ Physics      │ 100   │ 70      │ 70%   │ B        │
│                                                    │
│ ═══ SUMMARY ═══════════════════════════════════    │
│                                                    │
│ Total Marks: 650  │ Obtained: 524                  │
│ Percentage: 80.6% │ Grade: A-                      │
│ Position: 5/20 (among Pre-Medical students)        │
│                                                    │
└───────────────────────────────────────────────────┘
```

---

## 8. FAMILY PORTAL — ELECTIVE-AWARE

### Child's Subject View

```
┌─────────────────────────────────┐
│ 👧 Sara's Subjects — Class 11   │
│                                 │
│ ── Compulsory ─────────────     │
│ 📘 English                      │
│ 📕 Urdu                         │
│ 📗 Islamiat                     │
│ 📙 Pak Studies                  │
│                                 │
│ ── Elective (ICS) ──────────   │
│ 💻 Computer Science             │
│ 📐 Mathematics                  │
│ 🔬 Physics                      │
│                                 │
└─────────────────────────────────┘
```

### Attendance Summary

```
┌─────────────────────────────────────┐
│ 📊 Sara's Attendance                │
│                                     │
│ Overall: 92% (Present 184/200 days) │
│                                     │
│ Subject-wise:                       │
│ English    ████████████████░░ 94%   │
│ Urdu       ███████████████░░░ 88%   │
│ Comp. Sci  ████████████████░░ 95%   │ ← Only enrolled subjects
│ Mathematics████████████████░░ 91%   │
│ Physics    ███████████████░░░ 89%   │
│                                     │
│ ⚡ Showing only Sara's subjects      │
└─────────────────────────────────────┘
```

---

## 9. ADMIN DASHBOARD — ELECTIVE OVERVIEW

### Elective Summary Widget

```
┌───────────────────────────────────────────┐
│ ⚡ Elective Groups Overview               │
│                                           │
│ Class 11 — Science Elective               │
│ ┌─────────┬─────────┬─────────┐          │
│ │ 🟢 Bio  │ 🔵 CS   │ 🟡 Stats│          │
│ │ 53      │ 42      │ 25      │          │
│ └─────────┴─────────┴─────────┘          │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ 100%     │
│                                           │
│ Class 9 — Optional Subject                │
│ ┌─────────┬─────────┐                    │
│ │ 🔵 CS   │ 🟢 Bio  │                    │
│ │ 85      │ 115     │                    │
│ └─────────┴─────────┘                    │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ 95%        │
│ ⚠️ 10 students unassigned                 │
│                                           │
│ [Manage Enrollments →]                    │
└───────────────────────────────────────────┘
```

---

## 10. COLOR SYSTEM FOR ELECTIVE GROUPS

Consistent color coding across all views:

| Slot | Color | Use Case |
|------|-------|----------|
| Subject 1 in group | `green-500` (#22c55e) | First elective (alphabetical or by enrollment count) |
| Subject 2 in group | `blue-500` (#3b82f6) | Second elective |
| Subject 3 in group | `amber-500` (#f59e0b) | Third elective |
| Subject 4 in group | `purple-500` (#a855f7) | Fourth elective (rare) |
| Unassigned warning | `red-500` (#ef4444) | Students without enrollment |
| Elective badge | `violet-500` (#8b5cf6) | "⚡ Elective" label |

### Implementation

Colors assigned dynamically based on `electiveGroupName` sorted subjects, stored in a simple mapping function. NOT hardcoded per subject.

---

## 11. RESPONSIVE BREAKPOINTS

| Breakpoint | Layout | Key Differences |
|-----------|--------|-----------------|
| < 640px (mobile) | Single column, cards | Timetable as day list, enrollment as student cards |
| 640–1023px (tablet) | Compact grid | Timetable grid with pill badges, enrollment as table |
| ≥ 1024px (desktop) | Full grid | Timetable with stacked cells, enrollment with drag-drop |

### Touch Targets

All interactive elements: minimum 44×44px tap target (WCAG 2.5.5).
