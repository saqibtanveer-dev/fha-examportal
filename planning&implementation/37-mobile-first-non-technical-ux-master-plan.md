# ExamCore - Mobile-First and Non-Technical UX Master Plan

Date: 2026-03-13
Mode: Plan only
Goal: Make the product easy, safe, and fast for non-technical school staff, students, and families on mobile and desktop

## 1. UX North Star

This platform should feel like an operational assistant, not an admin control panel.

Every high-frequency flow should satisfy these rules:
- first action obvious within 3 seconds
- important actions visible without visual crowding
- secondary actions moved behind overflow or drawer menus
- mobile interaction targets at least 44x44 except rare dense desktop-only controls
- repeated work reducible through copy, apply, template, or batch patterns
- status changes instantly visible after action
- destructive actions always confirmed
- empty states explain next step in plain language

## 2. Design Principles for This Product

### 2.1 Use task-first navigation, not system-first navigation

Bad pattern:
- exposing raw categories, structures, discounts, reports, settings all at once

Better pattern:
- "Collect Payment"
- "Generate Monthly Fees"
- "Review Defaulters"
- "Manage Structures"

### 2.2 Use adaptive navigation primitives

Desktop:
- segmented tabs are acceptable for 2 to 4 short labels

Mobile:
- 2 short tabs: segmented control
- 3 to 5 labels: horizontally scrollable segmented strip
- 5+ labels or dynamic labels: dropdown/switcher/sheet menu

### 2.3 Prefer guided batch flows over repeated manual entry

Any workflow repeated for:
- multiple days
- multiple sections
- multiple children
- multiple classes
- monthly repetition

should have a replication or template option.

### 2.4 Never make mobile users decode compressed admin UI

If content becomes too dense on a phone, the answer is not just wrapping.
The answer is changing the interaction model.

## 3. Shared Component Plan

## 3.1 Introduce `MobileSegmentedTabs`

Purpose:
- replace current fragile mobile tab behavior

Behavior:
- 2 items: equal-width segmented control
- 3 to 4 items: horizontally scrollable strip with active pill
- dynamic items: switch to select/sheet-based mobile nav

Use in:
- admin attendance
- teacher attendance
- family fees
- admissions campaign detail
- principal analytics
- student attendance

## 3.2 Introduce `HeaderActionBar`

Purpose:
- normalize page header actions by priority

Rules:
- max 1 primary action visible on mobile
- max 1 secondary action visible on mobile
- all other actions go in overflow menu or bottom sheet
- on desktop, actions may expand inline

Use first in:
- fee overview
- users page
- exams page
- questions page
- reports pages

## 3.3 Introduce `ResponsiveEntitySwitcher`

Purpose:
- replace overloaded tab bars with a clearer entity picker

Use in:
- family child switching
- class/section switching in narrow layouts
- student subviews where the entity changes but the task stays same

## 3.4 Introduce `SafeCloseButton`

Purpose:
- replace current harsh close icon treatment in `Sheet` and `Dialog`

Requirements:
- proper 44x44 mobile hit target
- visually softer focus treatment
- safe inset from edge
- consistent icon sizing
- consistent dark theme appearance

## 3.5 Introduce `ResponsiveDataSurface`

Purpose:
- force deliberate choice between table, cards, and stacked lists

Rules:
- if more than 5 columns and mobile is a requirement, provide a card/list mode
- if key comparison is numeric, keep desktop table and mobile summary cards
- never let wide operational tables simply shrink and wrap unpredictably

## 4. Page and Flow-Level Plans

## 4.1 Attendance

Current issues:
- admin mobile tab state looks cramped
- selectors and dates compete for space
- marking and reporting are mixed in one surface without clear mode framing

Plan:
- use `MobileSegmentedTabs` for `Mark / View` and `Reports`
- collapse class/section/date into a mobile filter sheet
- show selected context as a compact sticky summary chip row
- add one-tap actions:
  - All Present
  - Copy Yesterday
  - Load Last Saved Draft
  - Mark Exceptions Only
- after submit, show immediate summary: Present, Absent, Late, Excused

Non-technical benefit:
- less fear of making mistakes
- less repeated input
- more obvious completion state

## 4.2 Timetable

This is the highest-value workflow improvement area for school operations.

Required UX additions:
- copy one day to other selected days
- copy one section timetable to another section with diff preview
- save as template for class/grade
- apply teacher or room changes in batch where safe
- preview conflicts before submit, not only after failure

Recommended interaction model:
- primary canvas on desktop
- step-based copy/apply wizard on mobile

Minimum batch actions required:
- Replicate Day
- Replicate Week
- Copy Section
- Apply to All Matching Periods
- Review Conflicts

## 4.3 Fees

Current issues:
- fee overview header is overloaded
- mobile action hierarchy is weak
- reports and operational tasks are not clearly separated

Plan:
- keep one primary CTA: `Collect Fees`
- move `Categories`, `Structures`, `Discounts`, `Settings` into overflow on mobile
- convert overview page into task cards with explicit intent labels
- add guided action groups:
  - Collection
  - Monthly Generation
  - Adjustments & Discounts
  - Reports & Recovery

Family mobile plan:
- replace wrapped child tabs with child switcher
- payment history should stay as its own tab or section
- use card summaries per child before any detailed table view

## 4.4 Admissions

Current risk:
- campaign detail uses multi-tab detail surface that will not scale well on mobile

Plan:
- desktop: keep tabs
- mobile: convert to a section switcher sheet with explicit labels
- allow quick jump between Applicants, Merit List, Analytics, Settings
- keep high-risk actions separated from review surfaces

## 4.5 Principal Analytics

Current risk:
- multiple tabs with data-dense views can become tap-heavy and cognitively heavy on mobile

Plan:
- keep Overview as default landing
- other analysis areas use scrollable segmented nav or picker
- prioritize summary cards first, then deeper charts
- on mobile, reduce simultaneous chart density

## 4.6 Student and Family Self-Service

Goal:
- remove admin-like complexity entirely

Rules:
- one primary context at a time
- less tab density
- more cards and timelines
- more summaries than raw tables

Immediate improvements:
- child switching by select/sheet, not growing tab lists
- attendance and fee history should open with summary first
- important states should use plain language: Paid, Remaining, Overdue, Absent, Late

## 5. Workflow Simplification Backlog

These are the highest-value no-code-spec product improvements to make work easier for users.

### 5.1 Replication and templates

- timetable day-to-days replication
- timetable weekly template save/apply
- attendance copy-yesterday
- datesheet copy to parallel sections where safe
- fee structure apply-to-many-classes with preview

### 5.2 Drafts and review

- save partially completed operational forms as draft
- review changes before batch submit
- show "what will happen" preview for large updates

### 5.3 Undo and safe recovery

- for low-risk actions, allow short undo window
- for high-risk actions, show explicit preview confirmation
- always show post-action feedback in plain language

### 5.4 Context persistence

- preserve class, section, month, child, and date filters across adjacent pages
- if a user leaves a page and returns, context should remain unless explicitly reset

### 5.5 Plain-language operator help

- inline helper text for school staff actions
- examples near complex fields
- labels based on school work, not database terms

## 6. Mobile-First Rules to Enforce Across the Project

1. No page-level action row may rely on uncontrolled button wrapping.
2. No dynamic multi-item tab strip may use the desktop tab primitive unchanged on mobile.
3. No icon-only close control may be smaller than a reliable mobile tap target.
4. No high-frequency workflow should require repeating the same class/section/date selection without persistence.
5. No wide operational table should ship without a mobile alternative.
6. No critical workflow should end without a visible success summary.
7. No user-generated or long labels should be rendered without truncation, wrapping, or alternate layout strategy.

## 7. Delivery Phases

## Phase 1: Shared UX primitives

- `MobileSegmentedTabs`
- `HeaderActionBar`
- `SafeCloseButton`
- `ResponsiveEntitySwitcher`

Expected result:
- fix whole classes of mobile defects instead of patching page by page

## Phase 2: High-traffic admin flows

- Attendance
- Timetable
- Fees
- Admissions campaign detail

Expected result:
- biggest improvement in school staff daily usage

## Phase 3: Student and family simplification

- child switching
- summary-first self-service views
- reduced table dependence

Expected result:
- better usability for non-technical parents and students

## Phase 4: Batch and template system

- replicate day/week
- copy previous patterns
- preview conflicts
- save reusable templates

Expected result:
- large reduction in repetitive clerical work

## 8. Success Criteria

This UX plan is successful when:
- mobile tabs never look cramped or broken
- close buttons no longer visually read as defects
- fee overview is usable one-handed on a phone
- attendance marking feels faster than paper correction workflows
- timetable setup for repeated structures becomes mostly batch-driven
- family users do not need to decode admin-like layouts
- operators can complete common tasks with less repeated input and less fear

## 9. Final Direction

The product should feel calm, guided, and forgiving.

Right now it feels capable but still somewhat dense. The correct next move is not cosmetic polishing only. The correct next move is to redesign the shared mobile interaction model and batch workflows so the system genuinely becomes easier for ordinary school staff to operate.