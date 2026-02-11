# ExamCore - Frontend Architecture & UI Design

## UI Design Philosophy

1. **Clean & Professional** — School/institution aesthetic
2. **Distraction-Free Exam UI** — Minimal chrome during exam taking
3. **Accessible** — WCAG 2.1 AA compliant
4. **Responsive** — Desktop-first but fully mobile-friendly
5. **Consistent** — shadcn/ui design tokens across the entire app

---

## Layout Architecture

### Layout Hierarchy
```
RootLayout (app/layout.tsx)
├── Providers (QueryClient, ThemeProvider, Toaster)
│
├── PublicLayout (app/(public)/layout.tsx)
│   └── Centered card layout, no sidebar
│
├── AuthenticatedLayout (app/(authenticated)/layout.tsx)
│   ├── TopNav (with notification bell, profile dropdown)
│   └── Content area
│
├── AdminLayout (app/(admin)/admin/layout.tsx)
│   ├── Sidebar (admin navigation)
│   ├── TopNav (breadcrumbs, search, notifications, profile)
│   └── Main content area
│
├── TeacherLayout (app/(teacher)/teacher/layout.tsx)
│   ├── Sidebar (teacher navigation)
│   ├── TopNav (breadcrumbs, search, notifications, profile)
│   └── Main content area
│
├── StudentLayout (app/(student)/student/layout.tsx)
│   ├── Sidebar (student navigation)
│   ├── TopNav (notifications, profile)
│   └── Main content area
│
└── ExamLayout (app/(student)/student/exam/[id]/layout.tsx)
    ├── Minimal header (exam title, timer only)
    ├── Question navigator (side panel)
    └── Question content area (full width)
```

---

## Navigation Structure

### Admin Sidebar
```
Dashboard          /admin/dashboard
├── Overview stats
│
Users              /admin/users
├── Teachers       /admin/users?role=TEACHER
├── Students       /admin/users?role=STUDENT
└── Admins         /admin/users?role=ADMIN
│
Classes            /admin/classes
├── Manage Classes
└── Sections
│
Subjects           /admin/subjects
├── Departments
└── Subject List
│
Reports            /admin/reports
├── Exam Reports
└── Class Reports
│
Settings           /admin/settings
├── School Profile
├── Grading Scale
└── Academic Year
```

### Teacher Sidebar
```
Dashboard          /teacher/dashboard
├── Quick stats
│
Question Bank      /teacher/questions
├── All Questions  /teacher/questions
├── My Questions   /teacher/questions?mine=true
├── Create New     /teacher/questions/new
└── Tags           /teacher/questions/tags
│
Exams              /teacher/exams
├── All Exams      /teacher/exams
├── Draft          /teacher/exams?status=DRAFT
├── Active         /teacher/exams?status=ACTIVE
├── Create New     /teacher/exams/new
└── Completed      /teacher/exams?status=COMPLETED
│
Grading            /teacher/grading
├── Pending Review /teacher/grading?filter=pending
├── AI Flagged     /teacher/grading?filter=flagged
└── History        /teacher/grading?filter=reviewed
│
Results            /teacher/results
├── By Exam        /teacher/results
└── By Class       /teacher/results/class
```

### Student Sidebar
```
Dashboard          /student/dashboard
├── Upcoming exams
├── Recent results
│
Exams              /student/exams
├── Available      /student/exams?tab=available
├── In Progress    /student/exams?tab=in-progress
└── Completed      /student/exams?tab=completed
│
Results            /student/results
├── All Results    /student/results
└── Performance    /student/results/performance
```

---

## Page Compositions

### Admin Dashboard Page
```
┌───────────────────────────────────────────────┐
│ TopNav: breadcrumb, notifications, profile    │
├───────┬───────────────────────────────────────┤
│       │  Welcome, Admin Name                  │
│  S    │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐│
│  I    │  │Total │ │Active│ │Active│ │Exams ││
│  D    │  │Users │ │Teach │ │Stud  │ │Today ││
│  E    │  └──────┘ └──────┘ └──────┘ └──────┘│
│  B    │                                       │
│  A    │  ┌─────────────────┐ ┌──────────────┐│
│  R    │  │ Recent Activity │ │  Quick Stats  ││
│       │  │ (audit log)     │ │  (charts)     ││
│       │  └─────────────────┘ └──────────────┘│
└───────┴───────────────────────────────────────┘
```

### Teacher Exam Builder Page
```
┌───────────────────────────────────────────────┐
│ TopNav: breadcrumb > Exams > Create New       │
├───────┬───────────────────────────────────────┤
│       │  Create New Exam                      │
│  S    │  ┌────────────────────────────┐       │
│  I    │  │ Step 1: Basic Info         │       │
│  D    │  │ Title, Subject, Type, Dur. │       │
│  E    │  └────────────────────────────┘       │
│  B    │  ┌────────────────────────────┐       │
│  A    │  │ Step 2: Add Questions      │       │
│  R    │  │ Search/Filter/Add from bank│       │
│       │  │ [Drag to reorder]          │       │
│       │  └────────────────────────────┘       │
│       │  ┌────────────────────────────┐       │
│       │  │ Step 3: Settings & Assign  │       │
│       │  │ Classes, schedule, rules   │       │
│       │  └────────────────────────────┘       │
│       │  [Save Draft] [Preview] [Publish]     │
└───────┴───────────────────────────────────────┘
```

### Student Exam Taking Page (Distraction-Free)
```
┌───────────────────────────────────────────────┐
│ Math Final Exam    Q 3/20    ⏱ 45:32 remain  │
├──────────────┬────────────────────────────────┤
│  Questions   │                                │
│  ┌──┐┌──┐   │  Question 3                    │
│  │✓1││✓2│   │                                │
│  └──┘└──┘   │  What is the derivative of     │
│  ┌──┐┌──┐   │  f(x) = 3x² + 2x - 5?         │
│  │►3││ 4│   │                                │
│  └──┘└──┘   │  ○ A) 6x + 2                   │
│  ┌──┐┌──┐   │  ● B) 6x + 2                   │
│  │ 5││ 6│   │  ○ C) 3x + 2                   │
│  └──┘└──┘   │  ○ D) 6x - 5                   │
│  ...        │                                │
│  ┌──┐       │  ☐ Mark for review             │
│  │20│       │                                │
│  └──┘       │  [← Previous] [Next →]         │
│             │                                │
│ ✓ Answered  │  [Submit Exam]                 │
│ ► Current   │                                │
│ ⚑ Flagged   │  Auto-saved 30s ago            │
│ ○ Unanswered│                                │
└──────────────┴────────────────────────────────┘
```

---

## Component Architecture

### Component Categories

#### 1. Page Components (Server Components)
```
- Fetch data on server
- Pass to presentational components
- Handle loading/error states via Next.js conventions
- ZERO interactivity
- Max ~50 lines
```

#### 2. Feature Components (Client Components)
```
- Module-specific interactive components
- Use hooks for data fetching mutations
- Handle forms, modals, dialogs
- "use client" directive
- Max ~100 lines
```

#### 3. Shared UI Components (shadcn/ui + custom)
```
- Reusable across all modules
- No business logic
- Accept data via props
- Fully typed with generics where needed
- Max ~80 lines
```

### Shared Component Library

```
components/
├── ui/                      # shadcn/ui base components
│   ├── button.tsx
│   ├── input.tsx
│   ├── dialog.tsx
│   ├── select.tsx
│   ├── badge.tsx
│   ├── card.tsx
│   ├── table.tsx
│   ├── tabs.tsx
│   ├── dropdown-menu.tsx
│   ├── sheet.tsx            # mobile sidebar
│   ├── skeleton.tsx
│   ├── separator.tsx
│   ├── avatar.tsx
│   ├── tooltip.tsx
│   └── ...
│
├── shared/                  # Custom reusable components
│   ├── DataTable/
│   │   ├── DataTable.tsx          (~100 lines)
│   │   ├── DataTableToolbar.tsx   (~60 lines)
│   │   ├── DataTablePagination.tsx(~50 lines)
│   │   ├── DataTableColumnHeader.tsx (~40 lines)
│   │   └── data-table.types.ts   (~20 lines)
│   │
│   ├── FormField/
│   │   ├── TextField.tsx          (~40 lines)
│   │   ├── SelectField.tsx        (~50 lines)
│   │   ├── TextareaField.tsx      (~40 lines)
│   │   ├── CheckboxField.tsx      (~30 lines)
│   │   ├── DatePickerField.tsx    (~50 lines)
│   │   └── FileUploadField.tsx    (~60 lines)
│   │
│   ├── PageHeader.tsx             (~30 lines)
│   ├── EmptyState.tsx             (~25 lines)
│   ├── LoadingSpinner.tsx         (~15 lines)
│   ├── ConfirmDialog.tsx          (~40 lines)
│   ├── SearchInput.tsx            (~35 lines)
│   ├── StatusBadge.tsx            (~25 lines)
│   ├── RoleBadge.tsx              (~20 lines)
│   └── Pagination.tsx             (~40 lines)
│
└── layout/                  # Layout components
    ├── Sidebar/
    │   ├── Sidebar.tsx            (~60 lines)
    │   ├── SidebarItem.tsx        (~25 lines)
    │   ├── SidebarGroup.tsx       (~30 lines)
    │   └── sidebar-config.ts      (~40 lines per role)
    │
    ├── TopNav/
    │   ├── TopNav.tsx             (~50 lines)
    │   ├── Breadcrumbs.tsx        (~30 lines)
    │   ├── UserMenu.tsx           (~40 lines)
    │   └── NotificationBell.tsx   (~35 lines)
    │
    └── MobileSidebar.tsx          (~40 lines)
```

---

## State Management Architecture

### Server State (TanStack Query)
```typescript
// Query key factory pattern
const queryKeys = {
  users: {
    all: ['users'] as const,
    lists: () => [...queryKeys.users.all, 'list'] as const,
    list: (filters: UserFilters) => [...queryKeys.users.lists(), filters] as const,
    details: () => [...queryKeys.users.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
  },
  // ... same pattern for each module
};
```

### Client State (Zustand)
```typescript
// Minimal client state — only for UI concerns:
// - Sidebar open/closed
// - Active modal
// - Exam timer state
// - Exam answer buffer (before save)
// - Theme preference
```

### URL State (nuqs)
```typescript
// All filter/sort/pagination state lives in URL:
// /teacher/questions?type=MCQ&difficulty=HARD&page=2&sort=createdAt
// Makes every view bookmarkable and shareable
```

---

## Performance Patterns

### Server Components (Default)
- All data display pages are Server Components
- Data fetched at request time (dynamic) or build time (static)
- Zero JavaScript shipped for read-only pages

### Client Components (Opt-in)
- Only for interactivity: forms, modals, dropdowns, timers
- Pushed to leaf components (smallest possible boundary)
- Lazy loaded where appropriate

### Loading Strategy
```
- Streaming via loading.tsx (Suspense boundaries)
- Skeleton loading states for each module
- Optimistic updates for mutations
- Stale-while-revalidate for background data
```

### Image Optimization
```
- Next.js Image component for all images
- Question images served via CDN (Uploadthing/S3)
- Lazy loading for below-fold images
- WebP format with fallbacks
```

---

## Theme & Styling

### Tailwind CSS Configuration
```
- Custom color palette (school-friendly, professional)
- CSS custom properties for theme tokens
- Dark mode support via class strategy
- Consistent spacing scale (4px base)
- Typography plugin for rich text content
```

### Color Palette
```
Primary:     Blue-600  (#2563EB)  — Trust, education
Secondary:   Slate-600 (#475569)  — Professional
Success:     Green-600 (#16A34A)  — Correct, passed
Warning:     Amber-500 (#F59E0B)  — Review needed
Danger:      Red-600   (#DC2626)  — Error, failed
Info:        Sky-500   (#0EA5E9)  — Information

Background:  White / Slate-50 (light) | Slate-900/950 (dark)
Surface:     White / Slate-100 (light) | Slate-800 (dark)
```

### Responsive Breakpoints
```
sm:  640px   (mobile landscape)
md:  768px   (tablet)
lg:  1024px  (desktop)
xl:  1280px  (large desktop)
2xl: 1536px  (extra large)
```

---

## Accessibility Standards

- All interactive elements keyboard navigable
- Proper ARIA labels on custom components
- Focus management in modals and dialogs
- Color contrast ratio ≥ 4.5:1 (AA)
- Screen reader friendly exam taking experience
- Skip navigation links
- Proper heading hierarchy (h1 → h6)
- Form error messages linked to inputs
- Meaningful alt text on all images
