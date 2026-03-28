# Year Transition Operator Runbook and Reliability Playbook

Date: 2026-03-28
Owner: Admin / Principal operations team
Scope: Session-based student transitions (promote, hold back, graduate), partial execution, partial rollback

## 1) Goals

- Run year transition safely for large schools without timeout failures.
- Allow class-wise and student-wise execution, not only all-school execution.
- Allow mistake recovery for selected students/classes without full rollback.
- Keep process simple for non-technical operators.

## 2) What changed in system behavior

- Transition can be executed in parts (multiple runs in same session).
- Already transitioned students are skipped automatically.
- Student can be promoted to custom target class + section (example: grade jump 7 -> 9).
- Partial undo is available (selected transitioned students only).
- Full undo is still available for selected session.

## 3) Pre-flight checklist (must pass before any execution)

1. Confirm target academic session is selected correctly.
2. Ensure required target classes exist (especially next grade and any custom jump classes).
3. Ensure target class has at least one active section.
4. Freeze student admissions/withdrawal edits during transition window.
5. Ensure admin performing transition has uninterrupted access for at least 20-30 minutes.
6. Run load simulation:
   - Command: pnpm year-transition:load-sim --chunk-size 250
   - If output shows classes with missing target sections, fix sections first.

## 4) Safe execution strategy (recommended)

Use phased execution instead of one-shot all-school run:

1. Pilot phase:
   - Execute one medium-size class first.
   - Validate 5-10 students manually in students list.
2. Main phase:
   - Execute class groups in multiple runs (example: grade bands).
3. Exception phase:
   - Handle special students individually (custom target class/section).
4. Reconciliation phase:
   - Verify processed table and totals.

## 5) UI operating instructions

### 5.1 Session selection

- Open Year Transition page.
- Select the correct academic session.
- Review "Already Processed In This Session" table.

### 5.2 Student-wise planning

In each class card:

- Use checkboxes to select only intended students.
- Set Action per student:
  - Promote
  - Hold Back
  - Graduate
- For Promote action:
  - Choose target class.
  - Choose target section.

### 5.3 Execute

- Click "Execute Year Transition".
- Read confirmation summary.
- Confirm and execute.

Expected result:

- Success toast with processed/promoted/graduated/heldBack/skipped counts.
- Newly processed students appear in session processed table.

## 6) Rollback strategy

### 6.1 Preferred: Partial undo (mistake recovery)

Use when only some students/classes were wrong.

1. In processed table, select affected students.
2. Click "Undo Selected".
3. Confirm dialog.
4. Re-check students in list and session table.

### 6.2 Last resort: Full session undo

Use only when large-scale wrong execution happened.

1. Click "Undo All In Session".
2. Confirm dialog.
3. Re-run transition in phased mode.

## 7) Edge-case handling

### Case A: Final class has no destination class

- Set action to Graduate where needed.
- Hold back can still be used in same class.

### Case B: Gender stream mismatch (example: boys 10 has no 11, girls 10 has 11)

- Promote only students with valid target class/section.
- Use Hold Back or Graduate for others as policy requires.
- Create missing class/section before promoting remaining students.

### Case C: Merit jump (example 7 -> 9)

- Select student.
- Set action = Promote.
- Choose target class 9 and valid section.

### Case D: Large data / timeout risk

- Execute in smaller class groups.
- Do not run large unrelated admin operations concurrently.
- If failures happen, rerun only pending students (already processed are skipped).

## 8) Post-run validation checklist

1. Open processed table and verify expected student count.
2. Spot-check random students from each class:
   - class
   - section
   - status
3. Verify graduated users are inactive.
4. Verify accidentally graduated users can be restored via partial undo.
5. Confirm no class is left with impossible mappings.

## 9) Incident playbook

### Symptom: Some students did not move

- Likely skipped due to invalid mapping or already processed.
- Fix mapping and run again for those students only.

### Symptom: Wrong class/section selected for many students

- Use Undo Selected for impacted rows.
- Reconfigure and execute again.

### Symptom: Operator executed wrong session

- Use Undo All In Session (if this session was not intended).
- Re-run in correct session.

## 10) Operational guardrails

- Never execute full school in first run.
- Never skip processed-table review before second run.
- Never use full undo before evaluating partial undo impact.
- Keep one designated operator and one verifier for each transition window.

## 11) Suggested cadence for large schools

- Run 1: pilot class
- Run 2-4: core classes in chunks
- Run 5+: special cases and jump promotions
- Final run: zero-pending reconciliation

## 12) Command quick reference

- Load simulation (human output):
  - pnpm year-transition:load-sim
- Load simulation (JSON output):
  - pnpm year-transition:load-sim --json
- Custom chunk simulation:
  - pnpm year-transition:load-sim --chunk-size 200
