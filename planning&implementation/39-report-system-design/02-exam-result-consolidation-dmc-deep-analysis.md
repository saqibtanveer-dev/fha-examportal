# 39 — Exam Result Consolidation & DMC Engine: Deep Technical Analysis

> **Created:** 2026-03-13  
> **Parent:** `01-report-system-master-plan.md`  
> **Focus:** The hardest part — how to reliably combine results from multiple exam types into unified DMC/reports  

---

## Table of Contents

1. [The Core Problem](#1-the-core-problem)
2. [How Exams Map to Results in the Current System](#2-how-exams-map-to-results-in-the-current-system)
3. [Real-World Exam Patterns in Pakistani Schools](#3-real-world-exam-patterns-in-pakistani-schools)
4. [Result Term Architecture — Complete Specification](#4-result-term-architecture--complete-specification)
5. [Consolidation Algorithm — Step by Step](#5-consolidation-algorithm--step-by-step)
6. [Grading System Integration](#6-grading-system-integration)
7. [Ranking System](#7-ranking-system)
8. [Edge Cases & Solutions — Exhaustive List](#8-edge-cases--solutions--exhaustive-list)
9. [DMC Data Assembly Pipeline](#9-dmc-data-assembly-pipeline)
10. [Multi-Section, Multi-Class Considerations](#10-multi-section-multi-class-considerations)
11. [Elective Subject Handling](#11-elective-subject-handling)
12. [Re-computation & Invalidation Strategy](#12-re-computation--invalidation-strategy)
13. [Data Integrity Guarantees](#13-data-integrity-guarantees)
14. [Example Scenarios — End to End](#14-example-scenarios--end-to-end)

---

## 1. The Core Problem

The system currently stores results **per exam, per student, per session**:

```
ExamResult {
  sessionId    → ExamSession (one attempt of one exam by one student)
  examId       → Exam (one specific exam)
  studentId    → User (student)
  totalMarks
  obtainedMarks
  percentage
  grade
  isPassed
  rank
}
```

This is **fine for individual exam tracking**, but a school needs to answer:

> "What is Ahmed's total result for this TERM across all subjects, combining his midterm (30%), final (50%) and quiz average (20%)?"

There is **NO model, NO query, NO aggregation** that does this today. The existing `report-queries.ts` only shows system-wide stats — completely useless for answering per-student, per-class questions.

---

## 2. How Exams Map to Results in the Current System

### Current Data Flow

```
                    Exam (one exam for one subject)
                      │
          ┌───────────┼───────────┐
          │           │           │
     [Section A]  [Section B]  [Section C]
          │           │           │
   ┌──────┼──────┐    │     ┌────┼────┐
   │      │      │    │     │    │    │
 Student1 Student2 Student3 ...  ...  ...
   │      │      │
ExamSession (per student attempt)
   │
ExamResult (marks, grade, rank)
```

### What We Need

```
ResultTerm ("Annual Result 2025-26" for Class 10)
├── ExamGroup: "Midterm" (30%)
│   ├── Exam: "Math Midterm"        → ExamResults for all Class 10 students
│   ├── Exam: "English Midterm"     → ExamResults for all Class 10 students
│   ├── Exam: "Physics Midterm"     → ExamResults for all Class 10 students
│   └── ... (one exam per subject)
├── ExamGroup: "Final" (50%)
│   ├── Exam: "Math Final"          → ExamResults for all Class 10 students
│   ├── Exam: "English Final"       → ExamResults for all Class 10 students
│   └── ...
└── ExamGroup: "Quizzes" (20%, aggregate: AVERAGE)
    ├── Exam: "Math Quiz 1"         → ExamResults
    ├── Exam: "Math Quiz 2"         → ExamResults
    ├── Exam: "English Quiz 1"      → ExamResults
    └── ... (multiple exams per subject possible)

                    ↓ CONSOLIDATION ENGINE ↓

ConsolidatedResult (per student, per subject)
├── groupScores: [
│   { "Midterm": obtained=42, total=50, pct=84% },
│   { "Final": obtained=87, total=100, pct=87% },
│   { "Quizzes": obtained=17, total=20, pct=85% }
│ ]
├── weightedTotal: (84×0.30) + (87×0.50) + (85×0.20) = 25.2 + 43.5 + 17.0 = 85.7
├── percentage: 85.7%
├── grade: A
└── isPassed: true

ConsolidatedStudentSummary (per student, all subjects)
├── grandTotal: 685.6 / 800
├── overallPercentage: 85.7%
├── overallGrade: A
├── rankInClass: 3
├── rankInSection: 2
└── isOverallPassed: true
```

---

## 3. Real-World Exam Patterns in Pakistani Schools

### Pattern 1: Standard 2-Term System (Most Common)

```
Academic Year
├── Term 1 (Aug - Dec)
│   ├── Monthly Test 1 (Sep) — 20 marks each subject
│   ├── Monthly Test 2 (Oct) — 20 marks each subject
│   ├── Midterm Exam (Nov) — 50 or 100 marks per subject
│   └── Term 1 Result = Midterm (60%) + Monthly Tests Avg (40%)
│
├── Term 2 (Jan - Apr)
│   ├── Monthly Test 3 (Feb) — 20 marks each subject
│   ├── Monthly Test 4 (Mar) — 20 marks each subject
│   ├── Final Exam (Apr) — 100 marks per subject
│   └── Term 2 Result = Final (60%) + Monthly Tests Avg (40%)
│
└── Annual Result = Term 1 (40%) + Term 2 (60%)
```

### Pattern 2: Phase-Based System

```
Academic Year
├── Phase 1 Exam — 50 marks per subject (25%)
├── Phase 2 Exam — 50 marks per subject (25%)
├── Phase 3 Exam — 50 marks per subject (25%)
└── Phase 4 (Final) Exam — 100 marks per subject (25%)
```

### Pattern 3: Simple Midterm + Final

```
Academic Year
├── Midterm Exam — 50 marks per subject (30%)
└── Final Exam — 100 marks per subject (70%)
```

### Pattern 4: Board-Style (Class 9-12)

```
Academic Year
├── First Session Exam — 100 marks per subject
├── Send-Up Exam — 100 marks per subject
└── Final/Board Prep Exam — 100 marks per subject
```

### Pattern 5: Continuous Assessment

```
Academic Year
├── Assignment 1 (10%)
├── Assignment 2 (10%)
├── Quiz Average (10%)
├── Project (20%)
└── Final Exam (50%)
```

**Key Insight:** The system MUST be flexible enough to support ALL these patterns. That's why the `ResultTerm + ExamGroup` model is designed to be fully configurable.

---

## 4. Result Term Architecture — Complete Specification

### 4.1 ResultTerm Model (Deep)

```
ResultTerm
├── id: UUID
├── name: "Annual Result 2025-26"
├── academicSessionId: → AcademicSession (required)
├── classId: → Class (required — results are always class-specific)
├── description: Optional description
├── isActive: Whether this term is being worked on
├── isPublished: Whether results are visible to students/families
├── publishedAt: When published
│
├── ExamGroups: [
│   {
│     name: "Midterm",
│     weight: 30.00,          // Percentage weight
│     aggregateMode: SINGLE,  // Expected: 1 exam per subject in this group
│     sortOrder: 1            // Display order in DMC columns
│   },
│   {
│     name: "Final",
│     weight: 50.00,
│     aggregateMode: SINGLE,
│     sortOrder: 2
│   },
│   {
│     name: "Quizzes",
│     weight: 20.00,
│     aggregateMode: AVERAGE,  // Multiple quizzes per subject → take average
│     sortOrder: 3
│   }
│ ]
```

### 4.2 AggregateMode Explained

| Mode | Meaning | Use Case |
|------|---------|----------|
| `SINGLE` | Exactly one exam per subject per group expected. If multiple found, take the latest. | Midterm, Final |
| `AVERAGE` | Average all exam results for the same subject within this group. | Monthly tests, quizzes |
| `BEST_OF` | Take the best N scores out of M available. Requires `bestOfCount`. | "Best 3 out of 5 quizzes" |
| `SUM` | Sum all exam results for the same subject within this group. | Rare — assignment portfolios |

### 4.3 Weight Validation Rules

1. All group weights must sum to exactly **100.00**
2. Each weight must be ≥ 0 and ≤ 100
3. At least ONE group must exist per ResultTerm
4. Groups with weight 0 are display-only (shown on DMC but not counted)

### 4.4 Exam-to-Group Linking Rules

1. An exam can only be linked to ONE group within a ResultTerm
2. An exam must belong to the same AcademicSession as the ResultTerm
3. An exam must be assigned to the same Class as the ResultTerm (via ExamClassAssignment)
4. An exam's status must be `COMPLETED` or have published results
5. Auto-linking matches by `ExamType`:
   - `MIDTERM` exams → group named "Midterm"
   - `FINAL` exams → group named "Final"
   - `QUIZ` exams → group named "Quizzes"
   - `CUSTOM` exams → manual linking required

---

## 5. Consolidation Algorithm — Step by Step

### 5.1 Input

```
computeConsolidatedResults(resultTermId: string) {
  // 1. Load ResultTerm with ExamGroups and ExamLinks
  // 2. Identify all students in the class (and section if specified)
  // 3. For each student, for each subject:
  //    a. For each ExamGroup:
  //       - Find ExamResults for this student + subject + linked exams
  //       - Apply aggregation (SINGLE/AVERAGE/BEST_OF/SUM)
  //       - Compute group score as percentage
  //    b. Apply weights to compute weighted percentage
  //    c. Convert to grade using GradingScale
  //    d. Determine pass/fail
  // 4. Compute per-student summary (grand total across all subjects)
  // 5. Rank students within class and section
  // 6. Save all ConsolidatedResult and ConsolidatedStudentSummary records
}
```

### 5.2 Detailed Algorithm (Pseudocode)

```typescript
async function computeConsolidatedResults(resultTermId: string) {
  // ─── Step 1: Load Configuration ───
  const term = await loadResultTerm(resultTermId); // includes groups + exam links
  const gradingScale = await loadGradingScale();
  
  // ─── Step 2: Identify Students ───
  const students = await getStudentsInClass(term.classId); // all sections
  
  // ─── Step 3: Identify Subjects ───
  const subjects = await getSubjectsForClass(term.classId); // via SubjectClassLink
  
  // ─── Step 4: Fetch ALL ExamResults in Bulk ───
  const allExamIds = term.examGroups.flatMap(g => g.examLinks.map(l => l.examId));
  const allResults = await fetchExamResultsBulk(allExamIds); // Map<examId, Map<studentId, ExamResult>>
  
  // ─── Step 5: Compute Per-Student Per-Subject ───
  const consolidatedResults: ConsolidatedResult[] = [];
  
  for (const student of students) {
    for (const subject of subjects) {
      // Skip if student is not enrolled in this subject (elective check)
      if (!isEnrolled(student, subject)) continue;
      
      const groupScores: GroupScore[] = [];
      let weightedSum = 0;
      let totalWeight = 0;
      
      for (const group of term.examGroups) {
        // Find exams in this group for this subject
        const groupExams = group.examLinks
          .filter(link => getExamSubject(link.examId) === subject.id);
        
        if (groupExams.length === 0) {
          // No exam in this group for this subject — skip or mark as N/A
          groupScores.push({ 
            groupId: group.id, groupName: group.name, 
            obtained: null, total: null, percentage: null, status: 'NO_EXAM' 
          });
          continue;
        }
        
        // Get results for this student in these exams
        const studentResults = groupExams
          .map(link => allResults.get(link.examId)?.get(student.userId))
          .filter(Boolean);
        
        if (studentResults.length === 0) {
          // Student has no result — absent or not attempted
          groupScores.push({ 
            groupId: group.id, groupName: group.name, 
            obtained: 0, total: getMaxMarks(groupExams), percentage: 0, status: 'ABSENT' 
          });
          totalWeight += group.weight; // Count as zero
          continue;
        }
        
        // Apply aggregation
        const aggregated = aggregate(studentResults, group.aggregateMode);
        const pct = (aggregated.obtained / aggregated.total) * 100;
        
        groupScores.push({ 
          groupId: group.id, groupName: group.name, 
          obtained: aggregated.obtained, total: aggregated.total, 
          percentage: pct, status: 'COMPUTED' 
        });
        
        weightedSum += pct * (Number(group.weight) / 100);
        totalWeight += Number(group.weight);
      }
      
      // Normalize if not all groups have data
      const finalPercentage = totalWeight > 0 
        ? (weightedSum / (totalWeight / 100)) 
        : 0;
      
      const grade = computeGrade(finalPercentage, gradingScale);
      const isPassed = finalPercentage >= passingThreshold; // from settings
      
      consolidatedResults.push({
        resultTermId: term.id,
        studentId: student.userId,
        subjectId: subject.id,
        groupScores,
        totalMarks: computeTotalMarks(groupScores),
        obtainedMarks: computeObtainedMarks(groupScores, term.examGroups),
        percentage: finalPercentage,
        grade,
        isPassed,
      });
    }
  }
  
  // ─── Step 6: Compute Student Summaries ───
  const studentSummaries = computeStudentSummaries(consolidatedResults, students);
  
  // ─── Step 7: Compute Rankings ───
  computeRankings(consolidatedResults, studentSummaries, term.classId);
  
  // ─── Step 8: Save Everything ───
  await saveConsolidatedResults(consolidatedResults, studentSummaries);
}
```

### 5.3 Aggregation Functions

```typescript
function aggregate(results: ExamResult[], mode: AggregateMode): { obtained: number, total: number } {
  switch (mode) {
    case 'SINGLE':
      // Take the latest result (or the only one)
      const latest = results.sort((a, b) => b.createdAt - a.createdAt)[0];
      return { obtained: latest.obtainedMarks, total: latest.totalMarks };
      
    case 'AVERAGE':
      // Average all results — normalize to percentage first, then average
      const avgPct = results.reduce((sum, r) => 
        sum + (Number(r.obtainedMarks) / Number(r.totalMarks) * 100), 0
      ) / results.length;
      // Present as X out of 100 (normalized)
      return { obtained: avgPct, total: 100 };
      
    case 'BEST_OF':
      // Sort by percentage descending, take best N
      const sorted = results
        .map(r => ({ ...r, pct: Number(r.obtainedMarks) / Number(r.totalMarks) * 100 }))
        .sort((a, b) => b.pct - a.pct);
      const bestN = sorted.slice(0, bestOfCount);
      const bestAvgPct = bestN.reduce((s, r) => s + r.pct, 0) / bestN.length;
      return { obtained: bestAvgPct, total: 100 };
      
    case 'SUM':
      return {
        obtained: results.reduce((s, r) => s + Number(r.obtainedMarks), 0),
        total: results.reduce((s, r) => s + Number(r.totalMarks), 0),
      };
  }
}
```

---

## 6. Grading System Integration

### 6.1 Current Grading Scale

The `SchoolSettings.gradingScale` is stored as JSON. Typical format:

```json
[
  { "grade": "A+", "minPercentage": 90, "maxPercentage": 100 },
  { "grade": "A",  "minPercentage": 80, "maxPercentage": 89.99 },
  { "grade": "A-", "minPercentage": 75, "maxPercentage": 79.99 },
  { "grade": "B+", "minPercentage": 70, "maxPercentage": 74.99 },
  { "grade": "B",  "minPercentage": 65, "maxPercentage": 69.99 },
  { "grade": "B-", "minPercentage": 60, "maxPercentage": 64.99 },
  { "grade": "C+", "minPercentage": 55, "maxPercentage": 59.99 },
  { "grade": "C",  "minPercentage": 50, "maxPercentage": 54.99 },
  { "grade": "D",  "minPercentage": 40, "maxPercentage": 49.99 },
  { "grade": "F",  "minPercentage": 0,  "maxPercentage": 39.99 }
]
```

### 6.2 Grade Computation

```typescript
function computeGrade(percentage: number, gradingScale: GradeEntry[]): string {
  const sorted = gradingScale.sort((a, b) => b.minPercentage - a.minPercentage);
  for (const entry of sorted) {
    if (percentage >= entry.minPercentage && percentage <= entry.maxPercentage) {
      return entry.grade;
    }
  }
  return 'F'; // fallback
}
```

### 6.3 Pass/Fail Determination

Two modes (configurable per ResultTerm or school-level):

1. **Overall Only:** Student passes if overall percentage ≥ passing threshold (e.g., 33%)
2. **Per-Subject + Overall:** Student passes only if EVERY subject ≥ passing threshold AND overall ≥ threshold
3. **Hybrid:** Student passes overall but individual failed subjects are marked as "Fail" on DMC

---

## 7. Ranking System

### 7.1 Ranking Scope

| Scope | Description | Use |
|-------|-------------|-----|
| **Within Section** | Rank among students in same class+section | Primary rank shown on DMC |
| **Within Class** | Rank among ALL students in same class (all sections) | Used for merit list |
| **Within School** | Rank among ALL students (rare — across grades) | Used for school awards |

### 7.2 Ranking Algorithm

```typescript
function computeRankings(
  summaries: ConsolidatedStudentSummary[],
  classId: string,
) {
  // ─── Section Rankings ───
  // Group by section
  const bySection = groupBy(summaries, s => getStudentSection(s.studentId));
  
  for (const [sectionId, sectionStudents] of Object.entries(bySection)) {
    const sorted = sectionStudents.sort((a, b) => 
      Number(b.overallPercentage) - Number(a.overallPercentage)
    );
    
    let currentRank = 1;
    for (let i = 0; i < sorted.length; i++) {
      // Handle ties — same percentage = same rank
      if (i > 0 && Number(sorted[i].overallPercentage) === Number(sorted[i-1].overallPercentage)) {
        sorted[i].rankInSection = sorted[i-1].rankInSection;
      } else {
        sorted[i].rankInSection = currentRank;
      }
      currentRank = i + 2; // Standard competition ranking (1224 method)
    }
  }
  
  // ─── Class Rankings ───
  const allSorted = summaries.sort((a, b) => 
    Number(b.overallPercentage) - Number(a.overallPercentage)
  );
  
  let classRank = 1;
  for (let i = 0; i < allSorted.length; i++) {
    if (i > 0 && Number(allSorted[i].overallPercentage) === Number(allSorted[i-1].overallPercentage)) {
      allSorted[i].rankInClass = allSorted[i-1].rankInClass;
    } else {
      allSorted[i].rankInClass = classRank;
    }
    classRank = i + 2;
  }
}
```

### 7.3 Subject-Level Rankings

For per-subject rankings in gazette:

```typescript
function computeSubjectRankings(
  results: ConsolidatedResult[],
  subjectId: string,
  scope: 'section' | 'class'
) {
  const subjectResults = results.filter(r => r.subjectId === subjectId);
  // Same ranking algorithm...
}
```

---

## 8. Edge Cases & Solutions — Exhaustive List

### 8.1 Student Attendance Issues

| Scenario | Handling | DMC Display |
|----------|----------|-------------|
| Student absent for ONE exam in a group | Marks = 0 for that exam, group score computed normally (with 0) | Show "ABS" instead of marks |
| Student absent for ALL exams in a group | Group score = 0 | Show "ABS" for entire column |
| Student absent for ALL exams (all groups) | All group scores = 0, overall = 0 | Show "ABSENT" as result status |
| Student exempt from exam (medical) | Admin marks as "EXEMPT" — group weight redistributed to other groups | Show "EX" instead of marks |

### 8.2 Missing/Incomplete Data

| Scenario | Handling | DMC Display |
|----------|----------|-------------|
| No exam created for a subject in a group | Skip that group for that subject, redistribute weight | Dash "-" or "N/A" |
| Exam created but not yet graded | Mark as "PENDING" — DO NOT include in consolidation | Show "Awaiting" |
| Exam partially graded (some questions not graded) | Use partial ExamResult if it exists | Show marks with warning |
| No ExamResult record for student | Treat as absent (0 marks) or missing | Show "ABS" |
| Multiple attempts on same exam | Take BEST attempt (configurable: best vs latest) | Show best attempt's marks |

### 8.3 Class/Section Changes

| Scenario | Handling |
|----------|----------|
| Student transferred from Section A to B mid-year | Include in BOTH section rankings for respective exams. Consolidated result uses current section. |
| Student transferred from another school mid-year | Only include exams they actually sat for. Adjust maximum possible marks. |
| Student promoted mid-year (skipped a class) | Extremely rare. Handle manually via admin override. |
| Student withdrawn before exams | Exclude from consolidated results completely. |

### 8.4 Different Total Marks Per Subject/Exam

| Scenario | Handling |
|----------|----------|
| Math midterm = 50 marks, English midterm = 100 marks | Normalize everything to PERCENTAGE before applying weights. |
| Quiz 1 = 20 marks, Quiz 2 = 30 marks | When aggregating via AVERAGE, convert each to percentage first, then average percentages. |
| Different sections have different total marks for same subject/exam | This shouldn't happen (same exam assigned to same class), but if it does, normalize to %. |

### 8.5 Elective Subjects

| Scenario | Handling |
|----------|----------|
| Student enrolled in CS but not Bio | Only show CS on DMC, skip Bio. Use `StudentSubjectEnrollment` to determine. |
| Subject is elective for some, compulsory for others | Check `SubjectClassLink.isElective` — if elective, check enrollment. If compulsory, include for all. |
| Grand total calculation with different subject counts | Sum only enrolled subjects. Total max = sum of max for enrolled subjects only. |
| Ranking fairness with different subject counts | Rank by PERCENTAGE, not raw marks. This normalizes across different subject counts. |

### 8.6 Re-evaluation & Corrections

| Scenario | Handling |
|----------|----------|
| Teacher corrects ExamResult after consolidation | Set a `needsRecompute` flag on affected ConsolidatedResults. Show warning to admin. |
| Admin triggers re-computation | Delete old ConsolidatedResult and ConsolidatedStudentSummary for this term, recompute all. |
| Grade scale changed after computation | Require full re-computation. Grade is derived, not stored independently. |
| Published results need correction | Admin unpublishes → corrects → re-computes → re-publishes. Audit trail logged. |

---

## 9. DMC Data Assembly Pipeline

### 9.1 DMC Data Structure

```typescript
type DmcData = {
  // School info
  school: {
    name: string;
    logo: string | null;
    address: string | null;
    phone: string | null;
    email: string | null;
    website: string | null;
  };
  
  // Result term info
  resultTerm: {
    name: string;        // "Annual Result 2025-26"
    examGroups: {         // Column headers for marks table
      id: string;
      name: string;      // "Midterm", "Final", "Quizzes"
      weight: number;
    }[];
  };
  
  // Class info
  className: string;     // "10-A"
  sectionName: string;
  academicSession: string; // "2025-2026"
  
  // Student info
  student: {
    name: string;
    fatherName: string;  // from guardianName
    rollNumber: string;
    registrationNo: string;
    dateOfBirth: string | null;
    gender: string | null;
  };
  
  // Subject-wise results (THE MEAT)
  subjects: {
    subjectName: string;
    subjectCode: string;
    isElective: boolean;
    groupScores: {
      groupId: string;
      groupName: string;
      obtained: number | null;  // null = no exam / absent
      total: number | null;
      status: 'COMPUTED' | 'ABSENT' | 'NO_EXAM' | 'PENDING';
    }[];
    consolidatedMarks: number;     // weighted total
    maxConsolidatedMarks: number;  // max possible weighted total
    percentage: number;
    grade: string;
    isPassed: boolean;
    subjectRank: number | null;
  }[];
  
  // Summary
  summary: {
    totalSubjects: number;
    passedSubjects: number;
    failedSubjects: number;
    grandTotalObtained: number;
    grandTotalMax: number;
    overallPercentage: number;
    overallGrade: string;
    isOverallPassed: boolean;
    rankInSection: number;
    totalStudentsInSection: number;
    rankInClass: number;
    totalStudentsInClass: number;
  };
  
  // Attendance (optional)
  attendance: {
    totalDays: number;
    presentDays: number;
    percentage: number;
  } | null;
  
  // Remarks
  classTeacherRemarks: string | null;
  principalRemarks: string | null;
  
  // Metadata
  dateOfIssue: string;
  printedAt: string | null;
};
```

### 9.2 Assembly Query (Optimized)

The DMC data should be assembled in **2-3 queries max**, not N+1:

```
Query 1: Fetch ConsolidatedResults + ConsolidatedStudentSummary 
          for this resultTermId + studentId (JOIN subject names, group scores)

Query 2: Fetch SchoolSettings + student profile + class/section info

Query 3 (optional): Fetch attendance aggregation for the period
```

### 9.3 Batch DMC Assembly

For printing entire section's DMCs:

```
Query 1: Fetch ALL ConsolidatedResults for resultTermId + all students in sectionId
Query 2: Fetch ALL ConsolidatedStudentSummaries for resultTermId + sectionId students
Query 3: Fetch ALL student profiles in section
Query 4: School settings
Query 5 (optional): Batch attendance query

→ Assemble into DmcData[] array
→ Render N DMC templates with page-break-before between them
```

---

## 10. Multi-Section, Multi-Class Considerations

### 10.1 ResultTerm is Per-Class

A `ResultTerm` is created for a specific **class** (e.g., Class 10). It covers ALL sections (A, B, C) of that class.

- Same weightage scheme for all sections
- Different subjects may apply to different sections? → Unlikely, handled by `SubjectClassLink`
- Ranking is computed both per-section AND per-class

### 10.2 Creating ResultTerms for Multiple Classes

Admin needs to create one ResultTerm per class:
- "Annual Result 2025-26 — Class 10"
- "Annual Result 2025-26 — Class 9"
- "Annual Result 2025-26 — Class 8"

We can provide a **bulk creation** action:
> "Create ResultTerm for ALL classes with same exam group structure"

### 10.3 Cross-Section Fairness

If Section A had an easier midterm than Section B (different exams), the consolidation still works because:
1. Each section's exam is linked to the same group
2. Percentage normalization handles different total marks
3. But cross-section ranking may be unfair if exams differ in difficulty

**Solution:** Allow admin to flag "cross-section ranking may not be accurate" when different exams are used across sections.

---

## 11. Elective Subject Handling

### 11.1 How Electives Work in the System

The system has:
- `SubjectClassLink.isElective` — marks a subject as elective for a class
- `StudentSubjectEnrollment` — tracks which students chose which elective
- `SubjectClassLink.electiveGroupName` — groups electives (e.g., "Science Elective" = CS or Bio)

### 11.2 DMC Rules for Electives

1. **Only show enrolled subjects** on DMC
2. **Grand total** = sum of marks for enrolled subjects only
3. **Ranking** uses percentage (not raw marks) — fair even if students have different subject counts
4. **DMC column** shows elective subjects in a separate section (optional grouping)

### 11.3 Implementation

```typescript
function getStudentSubjects(studentId: string, classId: string, sessionId: string) {
  // 1. Get all compulsory subjects via SubjectClassLink where isElective = false
  // 2. Get elective subjects via StudentSubjectEnrollment for this student
  // 3. Combine and return
}
```

---

## 12. Re-computation & Invalidation Strategy

### 12.1 When to Invalidate/Recompute

| Trigger | Action |
|---------|--------|
| ExamResult created/updated/deleted | Mark affected ConsolidatedResult as stale |
| Exam linked/unlinked from group | Mark ALL ConsolidatedResults for this term as stale |
| Exam group weight changed | Mark ALL ConsolidatedResults for this term as stale |
| Grading scale changed | Mark ALL ConsolidatedResults as stale (school-wide) |
| Student added/removed from class | Recompute for that student only |
| Student subject enrollment changed | Recompute for that student only |

### 12.2 Stale Detection

Add a `isStale` flag to ConsolidatedResult and ConsolidatedStudentSummary:

```prisma
model ConsolidatedResult {
  // ... existing fields ...
  isStale  Boolean @default(false) // true = needs recomputation
}
```

When admin views consolidated results with stale entries, show warning: "Some results are outdated and need recomputation."

### 12.3 Batch Recomputation

Admin triggers full recompute with a button. System:
1. Deletes all existing ConsolidatedResult + ConsolidatedStudentSummary for the term
2. Re-runs the consolidation algorithm
3. Clears stale flags

For large classes (1000+ students × 8 subjects = 8000+ records):
- Process in batches of 50 students
- Show progress bar
- Run in background with status polling

---

## 13. Data Integrity Guarantees

### 13.1 Transaction Boundaries

All consolidation writes must be within a single database transaction per student:
- All ConsolidatedResult records for one student → 1 transaction
- ConsolidatedStudentSummary for that student → same transaction

### 13.2 Concurrency Protection

- Only ONE consolidation job can run per ResultTerm at a time
- Use a `isComputing` flag on ResultTerm to prevent concurrent runs
- If server crashes mid-computation, admin can force-reset and recompute

### 13.3 Published vs Draft

- ConsolidatedResults are computed in "draft" state
- Admin previews and then explicitly "publishes"
- Publishing sets `isPublished = true` on ResultTerm and `publishedAt`
- Students/families can only see published results
- Admin can unpublish, make corrections, and re-publish

---

## 14. Example Scenarios — End to End

### Scenario 1: Standard School Annual Result

**Setup:**
- Class 10, Section A (35 students), Section B (30 students)
- 8 subjects: Math, English, Urdu, Physics, Chemistry, CS, Islamiat, Pak Studies
- Midterm (50 marks each), Final (100 marks each)

**Admin Steps:**
1. Creates ResultTerm: "Annual Result 2025-26 — Class 10"
2. Adds ExamGroup "Midterm" → weight 30%, aggregate SINGLE
3. Adds ExamGroup "Final" → weight 70%, aggregate SINGLE
4. Clicks "Auto-link exams" → system finds all MIDTERM/FINAL exams for Class 10 and links them
5. Verifies all 16 exams (8 subjects × 2 types) are linked
6. Clicks "Compute Consolidated Results"
7. System processes 65 students × 8 subjects = 520 ConsolidatedResult records
8. System generates 65 ConsolidatedStudentSummary records with rankings
9. Admin previews results, adds remarks for a few students
10. Admin clicks "Publish Results"
11. Students/families can now view DMC

### Scenario 2: Phase-Based Exam System

**Setup:**
- Class 7, 3 sections, 6 subjects
- Phase 1 (50 marks), Phase 2 (50 marks), Phase 3 (50 marks), Final (100 marks)

**Admin Steps:**
1. Creates ResultTerm: "Phase Result 2025-26 — Class 7"
2. Adds 4 ExamGroups: Phase 1 (20%), Phase 2 (20%), Phase 3 (20%), Final (40%)
3. All set to aggregate SINGLE
4. Links exams manually (since ExamType may all be CUSTOM)
5. Runs consolidation
6. DMC shows 4 columns per subject: P1, P2, P3, Final + consolidated total

### Scenario 3: Quizzes with Best-of

**Setup:**
- Class 9, 5 quizzes per subject, take best 3

**Admin Steps:**
1. ResultTerm: "Annual Result — Class 9"
2. ExamGroup "Quizzes" → weight 20%, aggregate BEST_OF(3)
3. ExamGroup "Midterm" → weight 30%, aggregate SINGLE
4. ExamGroup "Final" → weight 50%, aggregate SINGLE
5. Links all quiz exams to "Quizzes" group
6. System automatically takes best 3 out of 5 for each student per subject

---

> **This document provides the technical foundation for implementing the consolidation engine. Combined with `01-report-system-master-plan.md`, it covers the complete architecture needed for a production-grade school report system.**
