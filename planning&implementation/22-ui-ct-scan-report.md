# UI Layer CT Scan Report

**Date**: February 18, 2026  
**Scope**: Responsive design, text overflow, layout breakpoints, whitespace rendering, badge/chip overflow, card layouts, grid responsiveness, hardcoded widths, long text handling

---

## CRITICAL ISSUES (High Impact)

### 1. `whitespace-pre-wrap` on user-generated text — text breaks unnaturally

| File | Lines | Issue |
|------|-------|-------|
| `src/modules/results/components/answer-breakdown.tsx` | L88, L100, L145, L232 | `whitespace-pre-wrap` on answer text, model answers, feedback, and explanations. If the user pastes or types a very long unbroken string (e.g., a URL, code, or accidental keyboard mash), the container will stretch horizontally, potentially breaking the card layout. |

**Fix**: Add `break-words` alongside `whitespace-pre-wrap`:
```diff
- className="rounded-lg border bg-muted/50 p-3 text-sm whitespace-pre-wrap"
+ className="rounded-lg border bg-muted/50 p-3 text-sm whitespace-pre-wrap break-words"
```
Apply this to **all 4 occurrences** in answer-breakdown.tsx.

---

### 2. Question titles can overflow — no truncation or wrapping control

| File | Lines | Issue |
|------|-------|-------|
| `answer-breakdown.tsx` | L194 | `CardTitle` renders `answer.questionTitle` with no `truncate`, `break-words`, or `line-clamp`. Long question titles will push the card content beyond its container. |
| `exam-question-manager.tsx` | L167 | `<TableCell>{eq.question.title}</TableCell>` — no truncation on question titles in table cells. Long titles will stretch the table. |
| `exam-instructions-client.tsx` | L62 | `<h1 className="text-2xl font-bold">{exam.title}</h1>` — centered long title with no break-words could overflow on mobile. |

**Fix**: Add `break-words` to `CardTitle` and add `truncate max-w-xs` to table cells rendering titles.

---

### 3. `ExamTakingView` header — truncation cuts critical info on small screens

| File | Lines | Issue |
|------|-------|-------|
| `exam-taking-view.tsx` | L127–L136 | The exam header `truncate font-semibold` on the title will cut off text, but the user has no way to see the full title during exam. More importantly, the `flex-col gap-2 sm:flex-row` layout means on very narrow screens (~320px), the timer + submit button row may wrap awkwardly. |

**Fix**: Use `line-clamp-2` instead of `truncate` for the exam title, and ensure the timer/submit group has `flex-wrap` as fallback.

---

### 4. Question navigator grid overflow in `ExamTakingView`

| File | Lines | Issue |
|------|-------|-------|
| `exam-taking-view.tsx` | L247–L260 | The question navigator uses `flex flex-wrap justify-center gap-1 overflow-y-auto max-h-20`. With many questions (30+), this creates a tiny scrollable area. The `max-h-20` (5rem / 80px) only fits ~2 rows of buttons. Easy to miss questions outside the visible area. On mobile, the h-8 w-8 buttons + gap-1 means ~10 buttons per row at 320px width. |

**Fix**: Increase `max-h-20` to `max-h-32` and consider making the grid a horizontal scroll on mobile or a sheet/drawer.

---

### 5. MCQ option text can overflow on mobile

| File | Lines | Issue |
|------|-------|-------|
| `answer-breakdown.tsx` | L58 | `<span className="flex-1">{opt.text}</span>` — MCQ option text has no `break-words` or wrapping control. Long MCQ options (e.g., code snippets or mathematical expressions) will overflow. |
| `exam-taking-view.tsx` | L218–L224 | MCQ options rendered as `<span>{opt.text}</span>` inside a radio label — no overflow protection. |

**Fix**: Add `break-words min-w-0` to option text spans.

---

### 6. Badge row overflow in `AnswerBreakdown` summary

| File | Lines | Issue |
|------|-------|-------|
| `answer-breakdown.tsx` | L261–L286 | Summary bar uses `flex flex-wrap items-center gap-3`. With all badges visible (correct, partial, wrong, unanswered, pending grading), this can span 2-3 lines on mobile, pushing content down significantly. Not a "breaking" issue but wastes vertical space. |

**Minor**: Consider collapsing into a compact summary on mobile.

---

### 7. `ResultsTable` — student name cell has no truncation or min-w

| File | Lines | Issue |
|------|-------|-------|
| `results-table.tsx` | L62–L64 | Teacher view `{r.student.firstName} {r.student.lastName}` in a table cell with no truncation. Long names will stretch the column. |
| `results-table.tsx` | L66 | `{r.exam.title}` — exam title in table cell, no truncation. |

**Fix**: Add `max-w-[200px] truncate` to student name and exam title cells.

---

## MODERATE ISSUES (Medium Impact)

### 8. `exam-detailed-analytics.tsx` — enormous table with 12 columns

| File | Lines | Issue |
|------|-------|-------|
| `exam-detailed-analytics.tsx` | L465–L530 | `QuestionPerformanceTable` has 12 columns (#, Question, Type, Marks, Accuracy, Correct, Partial, Wrong, Skipped, Avg Marks, Difficulty, Discrimination). While wrapped in `overflow-x-auto`, the table is extremely wide. The `min-w-50` on the Question column header (L470) is hardcoded but the `max-w-62.5 truncate` on cells (L487) uses a non-standard Tailwind value. |

**Fix**: Verify `max-w-62.5` is configured in Tailwind. Consider hiding less important columns (Partial, Skipped, Avg Marks) on tablet with `hidden xl:table-cell`.

---

### 9. Charts in `analytics-charts.tsx` — XAxis label rotation may clip

| File | Lines | Issue |
|------|-------|-------|
| `analytics-charts.tsx` | L92 | `XAxis dataKey="exam" fontSize={10} angle={-20} textAnchor="end"` — rotated x-axis labels for exam names can clip at the edges of the chart container if exam names are long, especially in the `h-64` fixed-height container. |

**Fix**: Add `margin={{ bottom: 20 }}` to the chart to give space for rotated labels.

---

### 10. Admin `AuditLogClient` — entity ID rendering on mobile

| File | Lines | Issue |
|------|-------|-------|
| `audit-log-client.tsx` | L82 | `{log.entityType} <span className="text-muted-foreground">({log.entityId.slice(0, 8)})</span>` — EntityType + truncated UUID in a single cell. No responsive class hiding. All 5 columns visible on all screens. On mobile (<640px), table cells will be extremely cramped. |

**Fix**: Hide IP and Entity columns on mobile with `hidden sm:table-cell`.

---

### 11. `ReportsPageClient` — `SubjectTable` inner table missing `overflow-x-auto` (partially fixed)

| File | Lines | Issue |
|------|-------|-------|
| `reports-page-client.tsx` | L153–L157 | The `SubjectTable` and `RecentExamsTable` have `overflow-x-auto` wrappers around `<Table>` but the `<Table>` itself also wraps in its own `overflow-x-auto` (built into the UI component). This double-wrapping is harmless but redundant. The actual issue is that the outer `overflow-x-auto` is inside `CardContent` where Card has `px-6` padding, potentially causing the scrollbar to appear inside the card rather than at the card edge. |

**Minor**: No action needed — functionally correct.

---

### 12. `ExamGrid` — card header squishes on mobile

| File | Lines | Issue |
|------|-------|-------|
| `exam-grid.tsx` | L73–L92 | Card header uses `flex flex-row items-start justify-between pb-2` with the title + badge on the left and status badge + dropdown on the right. On narrow widths, the title area gets compressed while the right side (badge + icon button) takes up ~150px minimum. Long exam titles will overflow. |

**Fix**: Add `min-w-0` to the title div and `truncate` to the `CardTitle`.

---

### 13. `exam-detail-client.tsx` (principal) — 6-column grid on mobile

| File | Lines | Issue |
|------|-------|-------|
| `exam-detail-client.tsx` | L141 | `grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6` — Info cards grid. At `grid-cols-2` on mobile, these small stat cards will look fine. But the same pattern is used for the analytics section (L285) with `grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6` for 6 stat cards. This is fine. |

**Status**: OK, no issue.

---

### 14. `TabsList` with many tabs — overflow on mobile

| File | Lines | Issue |
|------|-------|-------|
| `exam-detailed-analytics.tsx` | L724–L733 | `TabsList className="flex-wrap"` with 4 tabs (Overview, Questions, Time, Integrity). `flex-wrap` allows wrapping but each tab trigger has an icon + text which takes ~120px wide minimum. On 320px screens, tabs will wrap to 2 rows. |
| `analytics-client.tsx` | L131 | `TabsList className="grid w-full grid-cols-2 sm:grid-cols-5"` with 5 tabs. On mobile, `grid-cols-2` means last tab gets `col-span-2 sm:col-span-1` which is handled. But the text might truncate. |

**Fix for exam-detailed-analytics**: Consider adding `overflow-x-auto` to `TabsList` parent and using `inline-flex` instead of `flex-wrap` for a scrollable tab bar on mobile.

---

### 15. `PrincipalDashboardClient` — recent activity cards rendering

| File | Lines | Issue |
|------|-------|-------|
| `dashboard-client.tsx` | L340–L345 | Recent Activity section uses `grid gap-4 md:grid-cols-2 lg:grid-cols-3` for 3 card columns. On mobile, all 3 stack vertically which is correct. However, inside each card, items with `truncate` on text are well-handled. |

**Status**: OK — good pattern used.

---

### 16. `StudentExamsClient` — exam card title has no truncation

| File | Lines | Issue |
|------|-------|-------|
| `student-exams-client.tsx` | L56 | `<CardTitle className="text-base">{exam.title}</CardTitle>` — long exam titles will cause the card to grow taller without control. No `truncate` or `line-clamp`. |

**Fix**: Add `line-clamp-2` or `truncate` to keep card heights consistent.

---

### 17. Hardcoded widths — `w-35`, `w-32.5`, `max-w-50`, `max-w-62.5`, `min-w-50`

| File | Lines | Issue |
|------|-------|-------|
| `exams-list-client.tsx` | L131, L141 | `w-35` on select triggers — non-standard Tailwind values. |
| `students-list-client.tsx` | L133, L140 | `w-35`, `w-32.5` — non-standard Tailwind values. |
| `exam-detailed-analytics.tsx` | L470, L487 | `min-w-50`, `max-w-62.5` — non-standard spacing values. |
| `exams-list-client.tsx` | L253 | `max-w-50` on exam title — non-standard. |

**Fix**: These will only work if configured in `tailwind.config`. Verify they're defined, or use standard Tailwind values (`w-36`, `w-32`, `max-w-xs`, etc.).

---

### 18. `teacher-detail-client.tsx` — stat grid with 5 columns

| File | Lines | Issue |
|------|-------|-------|
| `teacher-detail-client.tsx` | L157 | `grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5` with 5 items. On mobile 2-col grid, 5th item will be alone on its row, creating an uneven layout. |

**Fix**: Add `sm:grid-cols-3` is already there, which handles it. The lone item at mobile is acceptable but could use `last:col-span-2 sm:last:col-span-1` for aesthetic improvement.

---

### 19. `student-detail-client.tsx` — email on InfoRow can overflow

| File | Lines | Issue |
|------|-------|-------|
| `student-detail-client.tsx` | L156 | `<InfoRow icon={Mail} label="Email" value={student.email} />` — long email addresses rendered inline will overflow the card width on mobile. No truncation on the value. |
| `teacher-detail-client.tsx` | L122 | Same pattern — teacher email in InfoRow. |

**Fix**: Add `truncate` and `min-w-0` to the InfoRow value element.

---

### 20. `class-detail-client.tsx` — badges for sections/subjects can overflow

| File | Lines | Issue |
|------|-------|-------|
| `class-detail-client.tsx` | L237–L241 | `flex flex-wrap gap-2` for section badges. If many sections exist, badges will wrap correctly. But badges like `{sl.subject.name} ({sl.subject.code})` (L249) with long subject names will not truncate inside the badge. |
| `teacher-detail-client.tsx` | L245–L252 | Same pattern with `{ts.subject.name} ({ts.subject.code}) {ts.class && ` — ${ts.class.name}`}` — very long badge text. |

**Fix**: Add `max-w-xs truncate` to the badge inner text for long subject name + class combinations.

---

## LOW ISSUES (Minor Impact)

### 21. Double scroll wrapper on `Table` component

| File | Lines | Issue |
|------|-------|-------|
| `components/ui/table.tsx` | L9–L12 | The `Table` component itself wraps in `overflow-x-auto`. But multiple consumers also add their own `overflow-x-auto` wrapper (e.g., `user-table.tsx` L75, `subject-table.tsx` L80, `department-table.tsx` L60, `exam-question-manager.tsx` L147). |

**Impact**: Harmless but redundant. The outer wrapper could be removed OR the inner one could be removed.

**Fix**: Keep the `Table` component's built-in scroll wrapper and remove the outer ones from consumer components.

---

### 22. `csv-import-dialog.tsx` — preview table cells with hardcoded `max-w-[120px]`

| File | Lines | Issue |
|------|-------|-------|
| `csv-import-dialog.tsx` | L189 | `<td className="px-2 py-1 truncate max-w-[120px]">` — arbitrary width on CSV preview cells. Acceptable for preview but the outer container is a `max-w-lg` dialog. |

**Status**: OK — minor concern in preview context.

---

### 23. `CardHeader` flex layout in exam card (student)

| File | Lines | Issue |
|------|-------|-------|
| `student-exams-client.tsx` | L49–L57 | Card header uses `flex items-center justify-between` with badge on right. When both "Done" and "In Progress" badges are conditional, but if both states existed simultaneously, they'd stack horizontally. The current logic prevents this, so this is fine. |

**Status**: OK.

---

### 24. `ExamInstructionsClient` — anti-cheat card text wrapping

| File | Lines | Issue |
|------|-------|-------|
| `exam-instructions-client.tsx` | L100–L110 | The anti-cheat warning card uses `flex items-start gap-3 pt-6`. The text is in a `div className="text-sm"` with no overflow control. Long sentences will wrap naturally, which is correct behavior. |

**Status**: OK.

---

### 25. Accessibility concern — `class-grid.tsx` section delete button

| File | Lines | Issue |
|------|-------|-------|
| `class-grid.tsx` | L117–L125 | Delete section button `&times;` uses `h-6 w-6` inside a badge. The tap target is 24x24px which is below the recommended 44x44px minimum for mobile. |

**Fix**: Increase to `h-8 w-8` and add proper touch padding.

---

## COMPONENT-LEVEL SUMMARY

### Well-Implemented Patterns ✅
1. **Sidebar + TopNav**: Excellent mobile drawer implementation with Sheet component.
2. **DashboardShell**: Proper `pl-16`/`pl-64` offset with `md:` breakpoint.
3. **PageHeader**: Has `min-w-0`, `flex-wrap`, responsive title sizing — very well done.
4. **Principal pages**: Consistent mobile card view + desktop table pattern (`md:hidden` / `hidden md:block`).
5. **Badge component**: Built-in `shrink-0`, `whitespace-nowrap`, `overflow-hidden` — solid.
6. **TableHead component**: Has `whitespace-nowrap` by default — prevents header wrapping.
7. **TableCell component**: Has `whitespace-nowrap` by default — good for data consistency.
8. **ResultsTable**: Has `overflow-x-auto` wrapper and responsive column hiding.
9. **Charts**: All use `ResponsiveContainer width="100%" height="100%"` — proper pattern.
10. **All list pages**: Mobile/desktop split rendering pattern is consistently applied.

### Components Needing Attention ⚠️
1. **answer-breakdown.tsx**: Missing `break-words` on all `whitespace-pre-wrap` blocks
2. **exam-taking-view.tsx**: Question navigator overflow, MCQ option text overflow
3. **exam-grid.tsx**: Exam title truncation in card header
4. **user-table.tsx**: Very wide table with 8 columns, no mobile card fallback
5. **exam-question-manager.tsx**: Question title cell overflow
6. **audit-log-client.tsx**: No responsive column hiding
7. **reports-page-client.tsx**: Stat value rendering with `text-2xl font-bold` can be large on mobile

---

## PRIORITY FIX ORDER

1. **P0**: Add `break-words` to all `whitespace-pre-wrap` blocks (answer-breakdown.tsx) — affects student views
2. **P0**: Add `break-words min-w-0` to MCQ option text spans (answer-breakdown.tsx, exam-taking-view.tsx) — exam taking
3. **P1**: Fix `ExamTakingView` question navigator `max-h-20` → `max-h-32` 
4. **P1**: Add `truncate`/`line-clamp` to exam titles in cards (exam-grid.tsx, student-exams-client.tsx)
5. **P1**: Verify non-standard Tailwind values (`w-35`, `w-32.5`, `max-w-62.5`, `min-w-50`, `max-w-50`)
6. **P2**: Add responsive column hiding to audit-log-client.tsx
7. **P2**: Add `truncate` to email/name in InfoRow components 
8. **P2**: Consider mobile card view for user-table.tsx
9. **P3**: Remove redundant `overflow-x-auto` wrappers (cosmetic)
10. **P3**: Increase touch targets on section delete buttons in class-grid.tsx
