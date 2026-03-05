# Exam Datesheet System — Frontend Pages & Components Specification

> **Date:** March 5, 2026  
> **Principle:** Reuse timetable grid UX pattern. Role-specific views. Mobile-responsive.

---

## Route Structure

### New Routes to Add

| Role | Route | Page | Purpose |
|------|-------|------|---------|
| Admin | `/admin/datesheet` | DatesheetListPage | List all datesheets |
| Admin | `/admin/datesheet/new` | CreateDatesheetPage | Create new datesheet |
| Admin | `/admin/datesheet/[id]` | DatesheetDetailPage | View/edit datesheet with grid |
| Principal | `/principal/datesheet` | PrincipalDatesheetPage | View published datesheets |
| Teacher | `/teacher/datesheet` | TeacherDatesheetPage | View duty roster + datesheets |
| Student | `/student/datesheet` | StudentDatesheetPage | View class datesheet |
| Family | `/family/datesheet` | FamilyDatesheetPage | View child's datesheet |

### App Router File Structure

```
src/app/(dashboard)/
├── admin/datesheet/
│   ├── page.tsx                    # SSR wrapper
│   ├── datesheet-list-client.tsx   # Client list component
│   ├── error.tsx                   # Route error boundary
│   ├── new/
│   │   ├── page.tsx                # SSR wrapper
│   │   └── create-datesheet-client.tsx
│   └── [id]/
│       ├── page.tsx                # SSR wrapper
│       ├── datesheet-detail-client.tsx
│       └── error.tsx
├── principal/datesheet/
│   ├── page.tsx
│   ├── datesheet-page-client.tsx
│   └── error.tsx
├── teacher/datesheet/
│   ├── page.tsx
│   ├── datesheet-page-client.tsx
│   └── error.tsx
├── student/datesheet/
│   ├── page.tsx
│   ├── datesheet-page-client.tsx
│   └── error.tsx
└── family/datesheet/
    ├── page.tsx
    └── error.tsx
```

---

## Sidebar Navigation Updates

### Constants to Add (`src/lib/constants.ts`)
```typescript
// Add to ROUTES.ADMIN:
DATESHEET: '/admin/datesheet',
DATESHEET_NEW: '/admin/datesheet/new',

// Add to ROUTES.PRINCIPAL:
DATESHEET: '/principal/datesheet',

// Add to ROUTES.TEACHER:
DATESHEET: '/teacher/datesheet',

// Add to ROUTES.STUDENT:
DATESHEET: '/student/datesheet',

// Add to ROUTES.FAMILY:
DATESHEET: '/family/datesheet',
```

### Nav Config Updates (`src/components/layout/nav-config.ts`)
```typescript
// Import CalendarRange icon from lucide-react

// Admin → Management group:
{ label: 'Datesheet', href: ROUTES.ADMIN.DATESHEET, icon: CalendarRange },

// Principal → Monitoring group:
{ label: 'Datesheet', href: ROUTES.PRINCIPAL.DATESHEET, icon: CalendarRange },

// Teacher → Classroom group:
{ label: 'Datesheet', href: ROUTES.TEACHER.DATESHEET, icon: CalendarRange },

// Student → Classroom group:
{ label: 'Datesheet', href: ROUTES.STUDENT.DATESHEET, icon: CalendarRange },

// Family → Academics group:
{ label: 'Datesheet', href: ROUTES.FAMILY.DATESHEET, icon: CalendarRange },
```

---

## Component Specification

### 1. `DatesheetGrid` — The Core Interactive Grid

**Purpose:** Admin's main tool for building/viewing the datesheet. Similar to TimetableGrid but with Date on columns and Classes on rows.

**Grid Structure:**
```
              │ 15 Mar (Mon)  │ 16 Mar (Tue)  │ 17 Mar (Wed) │ ...
─────────────┼───────────────┼───────────────┼──────────────┼─────
Class 1-A    │ English       │ Math          │ —            │
             │ 09:00-11:00   │ 09:00-11:00   │              │
             │ 👨‍🏫 Ali, Sana  │ 👨‍🏫 Ahmed      │              │
─────────────┼───────────────┼───────────────┼──────────────┼─────
Class 1-B    │ English       │ Math          │ —            │
             │ 09:00-11:00   │ 09:00-11:00   │              │
─────────────┼───────────────┼───────────────┼──────────────┼─────
Class 2-A    │ Urdu          │ Science       │ English      │
             │ 09:00-11:00   │ 09:00-12:00   │ 09:00-11:00  │
```

**Props:**
```typescript
type DatesheetGridProps = {
  entries: DatesheetEntryWithRelations[];
  dates: string[];
  classes: { id: string; name: string; grade: number }[];
  onCellClick?: (date: string, classId: string, entry: DatesheetEntryWithRelations | null) => void;
  showDuties?: boolean;   // Show teacher names in cells
  compact?: boolean;      // Compact mode for smaller screens
  readOnly?: boolean;     // No click handler
};
```

**Reuse from Timetable:**
- Same `<table>` structure as `TimetableGrid`
- Same `cn()` for cell highlighting
- Same hover/click behavior pattern
- Same `Badge` usage for metadata

**Key Differences from TimetableGrid:**
- Columns = dates (not days of week)
- Rows = classes (not period slots)
- Cells show subject + time + teacher duties (not just subject + teacher)
- More content per cell → needs slightly more space

### 2. `DatesheetEntryForm` — Cell Editor Dialog

**Purpose:** Dialog for creating/editing a datesheet entry when admin clicks a grid cell.

**Reuse from Timetable:** Same dialog pattern as `TimetableEntryForm` — same Dialog/DialogContent structure, same Select components, same form state pattern.

**Fields:**
- Subject (Select — filtered by class via SubjectClassLink)
- Date (DatePicker — pre-filled from clicked column)
- Start Time (time input)
- End Time (time input)
- Room (optional text input)
- Instructions (optional textarea)
- Total Marks (optional number input)

**Actions:**
- Create / Update / Delete buttons
- Form validation with real-time error messages
- Teacher duty section embedded (or separate tab)

### 3. `DatesheetDutyForm` — Teacher Assignment Dialog

**Purpose:** Assign/manage teacher duties for a specific datesheet entry.

**Layout:**
- Primary: Select teacher + Select role
- Shows current duties as a list with remove buttons
- Conflict warning if teacher has another duty at same time

**Fields:**
- Teacher (Select from all active teachers)
- Role (Select: INVIGILATOR, HEAD_INVIGILATOR, SUPERVISOR)
- Room override (optional)
- Notes (optional)

### 4. `DatesheetForm` — Datesheet Metadata Creation

**Purpose:** Create/edit the datesheet container (title, type, dates).

**Layout:** Card-based form or Dialog.

**Fields:**
- Title (text)
- Description (textarea, optional)
- Exam Type (Select: MIDTERM, FINAL, etc.)
- Start Date (DatePicker)
- End Date (DatePicker)

### 5. `DatesheetList` — Datesheets Index

**Purpose:** List all datesheets with status filters and actions.

**Layout:** Table with columns: Title, Type, Session, Status, Date Range, Entries Count, Actions.

**Actions per row:**
- DRAFT: View/Edit, Publish, Delete
- PUBLISHED: View, Unpublish, Archive
- ARCHIVED: View only

### 6. `DatesheetStatusBadge` — Reusable Status Display

**Purpose:** Consistent status rendering.

```tsx
// Simple badge wrapper
<Badge variant={DATESHEET_STATUS_COLORS[status]}>
  {DATESHEET_STATUS_LABELS[status]}
</Badge>
```

### 7. `DatesheetClassView` — Read-Only Class Schedule

**Purpose:** Shows datesheet for a specific class. Used by Student and Family roles.

**Layout:** Vertical card list grouped by date:
```
📅 Monday, 15 March 2026
  ┌─────────────────────────────┐
  │ English Literature          │
  │ 09:00 AM - 11:00 AM        │
  │ Room 101                    │
  │ Total Marks: 100            │
  │ ⚠️ Bring calculator          │
  └─────────────────────────────┘

📅 Tuesday, 16 March 2026
  ┌─────────────────────────────┐
  │ Mathematics                  │
  │ 09:00 AM - 12:00 PM        │
  │ Room 201                    │
  └─────────────────────────────┘
```

### 8. `TeacherDutyView` — Teacher's Duty Roster

**Purpose:** Teacher sees all their invigilation duties.

**Reuse from Timetable:** Same card-per-day pattern as `TeacherScheduleView` but for dates.

**Layout:**
```
📅 Monday, 15 March 2026
  ┌─────────────────────────────────────────┐
  │ Role: Head Invigilator                   │
  │ Subject: English Literature              │
  │ Class: 10-A                              │
  │ Time: 09:00 AM - 11:00 AM              │
  │ Room: Room 101                           │
  │ Note: Handle paper distribution          │
  └─────────────────────────────────────────┘

📅 Tuesday, 16 March 2026
  ┌─────────────────────────────────────────┐
  │ Role: Invigilator                        │
  │ Subject: Mathematics                     │
  │ Class: 8-B                               │
  │ Time: 09:00 AM - 12:00 PM              │
  │ Room: Room 305                           │
  └─────────────────────────────────────────┘
```

### 9. `DatesheetPrintView` — Print-Optimized Layout

**Purpose:** Clean, printable datesheet for physical distribution.

**Layout:** Standard exam datesheet format:
- School name + logo header
- Datesheet title + date range
- Table: Date | Subject | Time | Room
- Class-specific (one printable sheet per class)

### 10. `DateSelector` — Date Column Manager

**Purpose:** Admin can add/remove date columns in the datesheet grid.

**Behavior:** 
- Auto-generate dates from datesheet's startDate to endDate
- Allow admin to exclude non-exam dates (holidays, Sundays)
- Display dates as column headers

---

## Page Specifications

### Admin — Datesheet List Page (`/admin/datesheet`)

```
┌─────────────────────────────────────────────────────────────────┐
│ 📋 Exam Datesheets                                              │
│ Manage exam schedules for all classes.                          │
│                                                                  │
│ [Session: 2025-26 ▼]  [Status: All ▼]  [+ Create Datesheet]   │
│                                                                  │
│ ┌──────────────────────────────────────────────────────────────┐ │
│ │ Title        │ Type    │ Status    │ Dates          │ #     ││
│ ├──────────────┼─────────┼───────────┼────────────────┼───────┤│
│ │ Final Term   │ FINAL   │ Published │ 15-25 Mar 2026 │ 58   ││
│ │ Mid-Term     │ MIDTERM │ Draft     │ 10-18 Feb 2026 │ 42   ││
│ │ Quiz Series 1│ QUIZ    │ Archived  │ 5-6 Jan 2026   │ 20   ││
│ └──────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Admin — Datesheet Detail Page (`/admin/datesheet/[id]`)

```
┌─────────────────────────────────────────────────────────────────┐
│ 📋 Final Term Exam 2025-26  [Draft ●]                          │
│ 15 March - 25 March 2026                                        │
│                                                                  │
│ [Publish]  [Edit Details]  [Print Preview]  [Delete]           │
│                                                                  │
│ ┌──────────────────────────────────────────────────────────────┐ │
│ │  Tabs: [📊 Schedule Grid] [👨‍🏫 Teacher Duties] [📈 Summary]   ││
│ └──────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  Schedule Grid Tab:                                              │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ Class filter: [All ▼] or specific class                    │  │
│  │                                                            │  │
│  │            │ 15 Mar │ 16 Mar │ 17 Mar │ 18 Mar │ ...     │  │
│  │ ──────────┼────────┼────────┼────────┼────────┼─────     │  │
│  │ Class 1-A │ Eng    │ Math   │ —      │ Sci    │         │  │
│  │           │ 9-11   │ 9-11   │        │ 9-11   │         │  │
│  │ ──────────┼────────┼────────┼────────┼────────┼─────     │  │
│  │ Class 1-B │ Eng    │ Math   │ —      │ Sci    │         │  │
│  │           │ 9-11   │ 9-11   │        │ 9-11   │         │  │
│  │ ...       │        │        │        │        │         │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  Click any cell to add/edit entry →                              │
│  ┌─── Dialog ───────────────────┐                                │
│  │ Add Entry for Class 1-A      │                                │
│  │ Date: 15 March 2026          │                                │
│  │ Subject: [English ▼]         │                                │
│  │ Start: [09:00]  End: [11:00] │                                │
│  │ Room: [Room 101]             │                                │
│  │ [Create]  [Cancel]           │                                │
│  └──────────────────────────────┘                                │
│                                                                  │
│  Teacher Duties Tab:                                             │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ Summary: 12 teachers assigned, 3 unassigned papers        │  │
│  │                                                            │  │
│  │ Date: 15 Mar 2026                                          │  │
│  │ ┌──────────┬───────────┬──────────┬──────────────────┐    │  │
│  │ │ Paper    │ Class     │ Time     │ Teachers          │    │  │
│  │ ├──────────┼───────────┼──────────┼──────────────────┤    │  │
│  │ │ English  │ 1-A, 1-B  │ 9-11     │ Ali (H), Sana   │    │  │
│  │ │ Urdu     │ 2-A       │ 9-11     │ ⚠️ No teacher    │    │  │
│  │ └──────────┴───────────┴──────────┴──────────────────┘    │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  Summary Tab:                                                    │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ Total Entries: 58                                          │  │
│  │ Classes Covered: 10                                        │  │
│  │ Exam Days: 8                                               │  │
│  │ Teacher Duties Assigned: 45/58                             │  │
│  │ Unassigned Papers: 13                                      │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Principal — Datesheet View (`/principal/datesheet`)

```
┌─────────────────────────────────────────────────────────────────┐
│ 📋 Exam Datesheets                                              │
│ School-wide exam schedule overview.                             │
│                                                                  │
│ [Session: 2025-26 ▼]  [Select Datesheet: Final Term ▼]        │
│                                                                  │
│ DatesheetGrid (read-only, showDuties=true)                      │
│                                                                  │
│ [🖨️ Print]                                                      │
└─────────────────────────────────────────────────────────────────┘
```

### Teacher — Datesheet & Duty View (`/teacher/datesheet`)

```
┌─────────────────────────────────────────────────────────────────┐
│ 📋 Exam Schedule & My Duties                                    │
│                                                                  │
│ Tabs: [My Duty Roster] [Class Datesheets]                       │
│                                                                  │
│ My Duty Roster:                                                  │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ TeacherDutyView — cards per date                            │ │
│ │ Upcoming duties highlighted                                  │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│ Class Datesheets:                                                │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ [Select Datesheet: Final Term ▼]                            │ │
│ │ [Class: 10-A ▼]                                             │ │
│ │ DatesheetClassView — vertical card list                     │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Student — My Datesheet (`/student/datesheet`)

```
┌─────────────────────────────────────────────────────────────────┐
│ 📋 My Exam Datesheet                                            │
│ Your upcoming exam schedule.                                    │
│                                                                  │
│ [Select: Final Term Exam 2025-26 ▼]                            │
│                                                                  │
│ DatesheetClassView — vertical card list for student's class     │
│                                                                  │
│ [🖨️ Print My Datesheet]                                         │
└─────────────────────────────────────────────────────────────────┘
```

### Family — Child's Datesheet (`/family/datesheet`)

```
┌─────────────────────────────────────────────────────────────────┐
│ 📋 Exam Datesheet                                               │
│                                                                  │
│ [Child: Ahmed (Class 10-A) ▼]  // ChildSelector reuse          │
│ [Select: Final Term Exam 2025-26 ▼]                            │
│                                                                  │
│ DatesheetClassView — same as student view                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## Component Reuse Matrix

| New Component | Reused From | Modification |
|---------------|------------|--------------|
| `DatesheetGrid` | `TimetableGrid` | Columns=dates, Rows=classes, cells=subject+time |
| `DatesheetEntryForm` | `TimetableEntryForm` | Add date/time/marks/instructions fields |
| `DatesheetDutyForm` | New | Follows same Dialog pattern |
| `DatesheetForm` | New | Standard form Card |
| `DatesheetList` | Pattern from admissions campaign list | Table with actions |
| `DatesheetClassView` | `TeacherScheduleView` | Cards grouped by date |
| `TeacherDutyView` | `TeacherScheduleView` | Cards with duty details |
| `DatesheetPrintView` | New | Print-only layout |
| `ClassSectionSelector` | Timetable `ClassSectionSelector` | Direct reuse |
| `DatesheetStatusBadge` | `StatusBadge` pattern | With datesheet status config |

---

## Responsive Design

### Desktop (> 1024px)
- Full datesheet grid with all dates visible
- Side-by-side layout for duty management

### Tablet (768px - 1024px)
- Horizontal scroll on grid
- Stacked layout for forms

### Mobile (< 768px)
- Grid collapses to list view (grouped by date)
- DatesheetClassView is the default (already list-based)
- Swipeable date navigation

---

## Loading States

Each page uses consistent loading patterns:

1. **Page-level:** `<Suspense fallback={<SkeletonPage />}>` (existing pattern)
2. **Component-level:** `<Spinner />` while queries load
3. **Empty state:** `<EmptyState />` when no datesheets exist
4. **Error state:** Route error boundaries using existing `RouteError`

---

## Print Support

### Print Stylesheet Approach
- CSS `@media print` rules
- Hide sidebar, navigation, action buttons
- Full-width datesheet table
- School header with name/logo from `SchoolSettings`
- Class name and date range in print header
- Page break per class for multi-class prints

### Per-Class Print
- Student/Family can print their class datesheet
- Admin/Principal can print individual class or all-class sheets
- Teacher can print their duty roster
