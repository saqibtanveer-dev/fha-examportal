import {
  createAuditLog,
  prisma
} from "../../../../../../../chunk-IJ3NSDH3.mjs";
import {
  task
} from "../../../../../../../chunk-3GKGWDKU.mjs";
import "../../../../../../../chunk-DEKBIM76.mjs";
import {
  __name,
  init_esm
} from "../../../../../../../chunk-CEGEFIIW.mjs";

// src/modules/reports/workflows/consolidation-workflow.ts
init_esm();

// src/modules/reports/engine/consolidation-engine.ts
init_esm();

// src/modules/reports/engine/grading-utils.ts
init_esm();
function computeGrade(percentage, gradingScale) {
  const sorted = [...gradingScale].sort(
    (a, b) => b.minPercentage - a.minPercentage
  );
  for (const entry of sorted) {
    if (percentage >= entry.minPercentage && percentage <= entry.maxPercentage) {
      return entry.grade;
    }
  }
  return "F";
}
__name(computeGrade, "computeGrade");
function parseGradingScale(gradingScaleJson) {
  if (!gradingScaleJson || !Array.isArray(gradingScaleJson)) {
    return getDefaultGradingScale();
  }
  const scale = gradingScaleJson;
  const parsed = [];
  for (const entry of scale) {
    if (typeof entry.grade === "string" && typeof entry.minPercentage === "number" && typeof entry.maxPercentage === "number") {
      parsed.push({
        grade: entry.grade,
        minPercentage: entry.minPercentage,
        maxPercentage: entry.maxPercentage
      });
    }
  }
  return parsed.length > 0 ? parsed : getDefaultGradingScale();
}
__name(parseGradingScale, "parseGradingScale");
function getDefaultGradingScale() {
  return [
    { grade: "A+", minPercentage: 90, maxPercentage: 100 },
    { grade: "A", minPercentage: 80, maxPercentage: 89.99 },
    { grade: "A-", minPercentage: 75, maxPercentage: 79.99 },
    { grade: "B+", minPercentage: 70, maxPercentage: 74.99 },
    { grade: "B", minPercentage: 65, maxPercentage: 69.99 },
    { grade: "B-", minPercentage: 60, maxPercentage: 64.99 },
    { grade: "C+", minPercentage: 55, maxPercentage: 59.99 },
    { grade: "C", minPercentage: 50, maxPercentage: 54.99 },
    { grade: "D", minPercentage: 40, maxPercentage: 49.99 },
    { grade: "F", minPercentage: 0, maxPercentage: 39.99 }
  ];
}
__name(getDefaultGradingScale, "getDefaultGradingScale");
function isPassing(percentage, passingPercentage) {
  return percentage >= passingPercentage;
}
__name(isPassing, "isPassing");
function computeRanks(items) {
  const sorted = [...items].sort((a, b) => b.percentage - a.percentage);
  const ranked = [];
  let currentRank = 1;
  for (let i = 0; i < sorted.length; i++) {
    const item = sorted[i];
    const prev = sorted[i - 1];
    if (i > 0 && prev && item.percentage === prev.percentage) {
      ranked.push({ ...item, rank: currentRank });
    } else {
      currentRank = i + 1;
      ranked.push({ ...item, rank: currentRank });
    }
  }
  return ranked;
}
__name(computeRanks, "computeRanks");
function roundTo2(value) {
  return Math.round(value * 100) / 100;
}
__name(roundTo2, "roundTo2");
function toNum(value) {
  if (value === null || value === void 0) return 0;
  return Number(value);
}
__name(toNum, "toNum");

// src/modules/reports/engine/report-constants.ts
init_esm();
var CONSOLIDATION_BATCH_SIZE = 50;
var DEFAULT_PASSING_PERCENTAGE = 33;

// src/modules/reports/engine/rank-computer.ts
init_esm();
async function assignRanks(resultTermId) {
  const summaries = await prisma.consolidatedStudentSummary.findMany({
    where: { resultTermId },
    select: {
      id: true,
      studentId: true,
      sectionId: true,
      overallPercentage: true
    },
    orderBy: { overallPercentage: "desc" }
  });
  if (summaries.length === 0) return;
  const withClassRanks = computeRanks(
    summaries.map((s) => ({ ...s, percentage: toNum(s.overallPercentage) }))
  );
  const sectionGroups = /* @__PURE__ */ new Map();
  for (const s of withClassRanks) {
    const arr = sectionGroups.get(s.sectionId) ?? [];
    arr.push(s);
    sectionGroups.set(s.sectionId, arr);
  }
  const sectionRanks = /* @__PURE__ */ new Map();
  for (const [, students] of sectionGroups) {
    const ranked = computeRanks(students);
    for (const r of ranked) sectionRanks.set(r.id, r.rank);
  }
  for (let i = 0; i < withClassRanks.length; i += CONSOLIDATION_BATCH_SIZE) {
    const batch = withClassRanks.slice(i, i + CONSOLIDATION_BATCH_SIZE);
    await prisma.$transaction(
      batch.map(
        (s) => prisma.consolidatedStudentSummary.update({
          where: { id: s.id },
          data: {
            rankInClass: s.rank,
            rankInSection: sectionRanks.get(s.id) ?? null
          }
        })
      )
    );
  }
  await prisma.resultTerm.update({
    where: { id: resultTermId },
    data: { computedAt: /* @__PURE__ */ new Date() }
  });
}
__name(assignRanks, "assignRanks");

// src/modules/reports/engine/consolidation-batch-processor.ts
init_esm();

// src/modules/reports/engine/subject-score-computer.ts
init_esm();
function computeSubjectGroupScores(subjectId, studentId, groups, byExam, absentIndex, examSubjectMap) {
  const groupScores = [];
  let obtainedWeighted = 0;
  let totalScaled = 0;
  for (const group of groups) {
    const subjectExamIds = Array.from(group.examIds).filter(
      (eid) => examSubjectMap.get(eid) === subjectId
    );
    if (subjectExamIds.length === 0) {
      groupScores.push({
        groupId: group.id,
        groupName: group.name,
        obtained: null,
        total: null,
        percentage: null,
        status: "NO_EXAM"
      });
      continue;
    }
    const results = subjectExamIds.map((eid) => byExam.get(eid)).filter(Boolean);
    const allAbsent = subjectExamIds.every(
      (eid) => absentIndex.has(`${studentId}:${eid}`)
    );
    const allPending = results.length === 0 && !allAbsent;
    if (allPending) {
      groupScores.push({
        groupId: group.id,
        groupName: group.name,
        obtained: null,
        total: null,
        percentage: null,
        status: "PENDING"
      });
      continue;
    }
    if (allAbsent) {
      const maxTotals = subjectExamIds.map((eid) => byExam.get(eid)?.totalMarks ?? 0).reduce((s, v) => s + v, 0);
      groupScores.push({
        groupId: group.id,
        groupName: group.name,
        obtained: 0,
        total: maxTotals,
        percentage: 0,
        status: "ABSENT"
      });
      totalScaled += group.weight;
      continue;
    }
    const { obtained, total } = aggregateResults(results, group.aggregateMode, group.bestOfCount);
    const pct = total > 0 ? roundTo2(obtained / total * 100) : 0;
    groupScores.push({
      groupId: group.id,
      groupName: group.name,
      obtained,
      total,
      percentage: pct,
      status: "COMPUTED"
    });
    if (total > 0) {
      obtainedWeighted += obtained / total * group.weight;
      totalScaled += group.weight;
    }
  }
  return { groupScores, obtainedWeighted, totalScaled };
}
__name(computeSubjectGroupScores, "computeSubjectGroupScores");
function aggregateResults(results, mode, bestOfCount) {
  if (results.length === 0) return { obtained: 0, total: 0 };
  switch (mode) {
    case "SINGLE":
      return { obtained: results[0].obtainedMarks, total: results[0].totalMarks };
    case "SUM":
      return {
        obtained: results.reduce((s, r) => s + r.obtainedMarks, 0),
        total: results.reduce((s, r) => s + r.totalMarks, 0)
      };
    case "AVERAGE": {
      const avgPct = results.reduce(
        (sum, r) => sum + (r.totalMarks > 0 ? r.obtainedMarks / r.totalMarks * 100 : 0),
        0
      ) / results.length;
      return { obtained: roundTo2(avgPct), total: 100 };
    }
    case "BEST_OF": {
      const n = bestOfCount ?? 1;
      const sorted = [...results].map((r) => ({ ...r, pct: r.totalMarks > 0 ? r.obtainedMarks / r.totalMarks * 100 : 0 })).sort((a, b) => b.pct - a.pct);
      const best = sorted.slice(0, n);
      const bestAvgPct = best.reduce((s, r) => s + r.pct, 0) / best.length;
      return { obtained: roundTo2(bestAvgPct), total: 100 };
    }
  }
}
__name(aggregateResults, "aggregateResults");

// src/modules/reports/engine/consolidation-batch-processor.ts
async function processConsolidationBatch(studentIds, ctx) {
  let processed = 0;
  let skipped = 0;
  const existingSummaryStudentIds = /* @__PURE__ */ new Set();
  if (!ctx.recompute) {
    const existingSummaries = await prisma.consolidatedStudentSummary.findMany({
      where: {
        resultTermId: ctx.resultTermId,
        studentId: { in: studentIds }
      },
      select: { studentId: true }
    });
    for (const summary of existingSummaries) {
      existingSummaryStudentIds.add(summary.studentId);
    }
  }
  for (const studentId of studentIds) {
    try {
      if (!ctx.recompute && existingSummaryStudentIds.has(studentId)) {
        skipped++;
        continue;
      }
      const byExam = ctx.resultIndex.get(studentId) ?? /* @__PURE__ */ new Map();
      const sectionId = ctx.sectionMap.get(studentId);
      if (!sectionId) {
        skipped++;
        continue;
      }
      const subjectIds = new Set(ctx.commonSubjectIds);
      for (const subjId of subjectIds) {
        if (ctx.electiveSubjectIds.has(subjId) && !ctx.enrolledElectives.has(`${studentId}:${subjId}`)) {
          subjectIds.delete(subjId);
        }
      }
      const subjectResults = [];
      for (const subjectId of subjectIds) {
        const { groupScores, obtainedWeighted, totalScaled } = computeSubjectGroupScores(
          subjectId,
          studentId,
          ctx.groups,
          byExam,
          ctx.absentIndex,
          ctx.examSubjectMap
        );
        const percentage = totalScaled > 0 ? roundTo2(obtainedWeighted / totalScaled * 100) : 0;
        const grade = computeGrade(percentage, ctx.gradingScale);
        const passed = isPassing(percentage, ctx.passingPct);
        subjectResults.push({
          subjectId,
          groupScores,
          totalMarks: roundTo2(totalScaled),
          obtainedMarks: roundTo2(obtainedWeighted),
          percentage,
          isPassed: passed,
          grade
        });
      }
      const grandTotal = subjectResults.reduce((s, r) => s + r.totalMarks, 0);
      const grandObtained = subjectResults.reduce((s, r) => s + r.obtainedMarks, 0);
      const overallPct = grandTotal > 0 ? roundTo2(grandObtained / grandTotal * 100) : 0;
      const overallGrade = computeGrade(overallPct, ctx.gradingScale);
      const overallPassed = isPassing(overallPct, ctx.passingPct);
      const passedCount = subjectResults.filter((r) => r.isPassed).length;
      const failedCount = subjectResults.filter((r) => !r.isPassed).length;
      await prisma.$transaction(async (tx) => {
        for (const sr of subjectResults) {
          const data = {
            groupScores: sr.groupScores,
            totalMarks: sr.totalMarks,
            obtainedMarks: sr.obtainedMarks,
            percentage: sr.percentage,
            grade: sr.grade,
            isPassed: sr.isPassed,
            isStale: false
          };
          await tx.consolidatedResult.upsert({
            where: {
              resultTermId_studentId_subjectId: {
                resultTermId: ctx.resultTermId,
                studentId,
                subjectId: sr.subjectId
              }
            },
            create: { resultTermId: ctx.resultTermId, studentId, subjectId: sr.subjectId, ...data },
            update: { ...data, computedAt: /* @__PURE__ */ new Date() }
          });
        }
        const summaryData = {
          sectionId,
          totalSubjects: subjectResults.length,
          passedSubjects: passedCount,
          failedSubjects: failedCount,
          grandTotalMarks: grandTotal,
          grandObtainedMarks: grandObtained,
          overallPercentage: overallPct,
          overallGrade,
          isOverallPassed: overallPassed,
          isStale: false
        };
        await tx.consolidatedStudentSummary.upsert({
          where: { resultTermId_studentId: { resultTermId: ctx.resultTermId, studentId } },
          create: { resultTermId: ctx.resultTermId, studentId, ...summaryData },
          update: { ...summaryData, computedAt: /* @__PURE__ */ new Date() }
        });
      });
      processed++;
    } catch (err) {
      console.error(`[consolidation] Failed for student ${studentId}:`, err);
      skipped++;
    }
  }
  return { processed, skipped };
}
__name(processConsolidationBatch, "processConsolidationBatch");

// src/modules/reports/engine/consolidation-engine.ts
async function computeConsolidatedResults(resultTermId, options) {
  const term = await prisma.resultTerm.findUnique({
    where: { id: resultTermId },
    include: {
      examGroups: {
        include: { examLinks: { select: { examId: true } } }
      }
    }
  });
  if (!term) throw new Error("Result term not found");
  const settings = await prisma.schoolSettings.findFirst({
    select: { gradingScale: true, passingPercentage: true }
  });
  const gradingScale = parseGradingScale(settings?.gradingScale);
  const passingPct = settings?.passingPercentage ? toNum(settings.passingPercentage) : DEFAULT_PASSING_PERCENTAGE;
  const groups = term.examGroups.map((g) => ({
    id: g.id,
    name: g.name,
    weight: toNum(g.weight),
    aggregateMode: g.aggregateMode,
    bestOfCount: g.bestOfCount,
    examIds: new Set(g.examLinks.map((l) => l.examId))
  }));
  const allExamIds = groups.flatMap((g) => Array.from(g.examIds));
  if (allExamIds.length === 0) throw new Error("No exams linked to this result term");
  const studentProfiles = await prisma.studentProfile.findMany({
    where: {
      classId: term.classId,
      status: "ACTIVE",
      ...options.sectionId && { sectionId: options.sectionId },
      user: { isActive: true }
    },
    orderBy: { userId: "asc" },
    select: { userId: true, sectionId: true }
  });
  const studentIds = studentProfiles.map((s) => s.userId);
  const sectionMap = new Map(
    studentProfiles.map((s) => [s.userId, s.sectionId])
  );
  const rawResults = await prisma.examResult.findMany({
    where: {
      examId: { in: allExamIds },
      studentId: { in: studentIds }
    },
    select: {
      examId: true,
      studentId: true,
      obtainedMarks: true,
      totalMarks: true
    }
  });
  const absentSessions = await prisma.examSession.findMany({
    where: {
      examId: { in: allExamIds },
      studentId: { in: studentIds },
      status: "ABSENT"
    },
    select: { examId: true, studentId: true }
  });
  const resultIndex = /* @__PURE__ */ new Map();
  for (const r of rawResults) {
    let byExam = resultIndex.get(r.studentId);
    if (!byExam) {
      byExam = /* @__PURE__ */ new Map();
      resultIndex.set(r.studentId, byExam);
    }
    byExam.set(r.examId, {
      examId: r.examId,
      studentId: r.studentId,
      obtainedMarks: toNum(r.obtainedMarks),
      totalMarks: toNum(r.totalMarks)
    });
  }
  const absentIndex = new Set(
    absentSessions.map((a) => `${a.studentId}:${a.examId}`)
  );
  const exams = await prisma.exam.findMany({
    where: { id: { in: allExamIds } },
    select: { id: true, subjectId: true }
  });
  const examSubjectMap = new Map(exams.map((e) => [e.id, e.subjectId]));
  const allSubjectIds = [...new Set(exams.map((e) => e.subjectId))];
  const subjectClassLinks = await prisma.subjectClassLink.findMany({
    where: { classId: term.classId, subjectId: { in: allSubjectIds }, isActive: true },
    select: { subjectId: true, isElective: true }
  });
  const electiveSubjectIds = new Set(
    subjectClassLinks.filter((l) => l.isElective).map((l) => l.subjectId)
  );
  const enrolledElectives = /* @__PURE__ */ new Set();
  if (electiveSubjectIds.size > 0) {
    const enrollments = await prisma.studentSubjectEnrollment.findMany({
      where: {
        studentProfile: { userId: { in: studentIds } },
        subjectId: { in: [...electiveSubjectIds] },
        academicSessionId: term.academicSessionId,
        isActive: true
      },
      select: { studentProfile: { select: { userId: true } }, subjectId: true }
    });
    for (const e of enrollments) {
      enrolledElectives.add(`${e.studentProfile.userId}:${e.subjectId}`);
    }
  }
  const commonSubjectIds = /* @__PURE__ */ new Set();
  for (const group of groups) {
    for (const examId of group.examIds) {
      const subjId = examSubjectMap.get(examId);
      if (subjId) commonSubjectIds.add(subjId);
    }
  }
  let processed = 0;
  let skipped = 0;
  const startOffset = Math.max(0, Math.min(options.startOffset ?? 0, studentIds.length));
  for (let i = startOffset; i < studentIds.length; i += CONSOLIDATION_BATCH_SIZE) {
    const batch = studentIds.slice(i, i + CONSOLIDATION_BATCH_SIZE);
    const result = await processConsolidationBatch(batch, {
      resultTermId,
      groups,
      sectionMap,
      resultIndex,
      absentIndex,
      examSubjectMap,
      gradingScale,
      passingPct,
      recompute: options.recompute ?? false,
      electiveSubjectIds,
      enrolledElectives,
      commonSubjectIds
    });
    processed += result.processed;
    skipped += result.skipped;
    if (options.onCheckpoint) {
      const nextOffset = Math.min(i + CONSOLIDATION_BATCH_SIZE, studentIds.length);
      try {
        await options.onCheckpoint({
          processed,
          skipped,
          nextOffset,
          totalStudents: studentIds.length,
          batchSize: CONSOLIDATION_BATCH_SIZE
        });
      } catch (checkpointError) {
        console.warn("[consolidation] Checkpoint write failed:", checkpointError);
      }
    }
  }
  await assignRanks(resultTermId);
  return { processed, skipped };
}
__name(computeConsolidatedResults, "computeConsolidatedResults");

// src/modules/reports/workflows/consolidation-workflow.ts
var CONSOLIDATION_LOCK_LEASE_MS = 15 * 60 * 1e3;
function readOffsetFromMetadata(metadata) {
  if (!metadata || typeof metadata !== "object") return 0;
  const candidate = metadata.nextOffset;
  return typeof candidate === "number" && Number.isFinite(candidate) && candidate >= 0 ? Math.floor(candidate) : 0;
}
__name(readOffsetFromMetadata, "readOffsetFromMetadata");
var consolidationWorkflow = task({
  id: "reports-consolidation-workflow",
  run: /* @__PURE__ */ __name(async (payload) => {
    try {
      const term = await prisma.resultTerm.findUnique({
        where: { id: payload.resultTermId },
        select: { id: true, isComputing: true, lockOwner: true }
      });
      if (!term) {
        throw new Error("Result term not found");
      }
      if (!term.isComputing) {
        throw new Error("Consolidation lock missing; refusing to run duplicate workflow");
      }
      if (!term.lockOwner || term.lockOwner !== payload.lockOwner) {
        throw new Error("Consolidation lock owner mismatch; aborting stale or duplicate worker");
      }
      const latestQueueAudit = await prisma.auditLog.findFirst({
        where: {
          entityType: "RESULT_TERM",
          entityId: payload.resultTermId,
          action: "QUEUE_CONSOLIDATED_RESULTS"
        },
        orderBy: { createdAt: "desc" },
        select: { createdAt: true }
      });
      const checkpoint = await prisma.auditLog.findFirst({
        where: {
          entityType: "RESULT_TERM",
          entityId: payload.resultTermId,
          action: "COMPUTE_CONSOLIDATED_RESULTS_CHECKPOINT",
          ...latestQueueAudit ? { createdAt: { gte: latestQueueAudit.createdAt } } : {}
        },
        orderBy: { createdAt: "desc" },
        select: { metadata: true }
      });
      const resumeFromOffset = readOffsetFromMetadata(checkpoint?.metadata);
      const result = await computeConsolidatedResults(payload.resultTermId, {
        sectionId: payload.sectionId,
        recompute: payload.recompute,
        startOffset: resumeFromOffset,
        onCheckpoint: /* @__PURE__ */ __name(async ({ processed, skipped, nextOffset, totalStudents, batchSize }) => {
          const leaseUpdate = await prisma.resultTerm.updateMany({
            where: {
              id: payload.resultTermId,
              isComputing: true,
              lockOwner: payload.lockOwner
            },
            data: {
              lockExpiresAt: new Date(Date.now() + CONSOLIDATION_LOCK_LEASE_MS)
            }
          });
          if (leaseUpdate.count === 0) {
            throw new Error("Consolidation lock lost during execution");
          }
          await createAuditLog(
            payload.requestedByUserId,
            "COMPUTE_CONSOLIDATED_RESULTS_CHECKPOINT",
            "RESULT_TERM",
            payload.resultTermId,
            {
              sectionId: payload.sectionId ?? null,
              recompute: payload.recompute,
              processed,
              skipped,
              nextOffset,
              totalStudents,
              batchSize,
              resumedFromOffset: resumeFromOffset
            }
          );
        }, "onCheckpoint")
      });
      await createAuditLog(
        payload.requestedByUserId,
        "COMPUTE_CONSOLIDATED_RESULTS",
        "RESULT_TERM",
        payload.resultTermId,
        {
          processed: result.processed,
          skipped: result.skipped,
          resumedFromOffset: resumeFromOffset,
          sectionId: payload.sectionId ?? null,
          recompute: payload.recompute
        }
      );
      return {
        success: true,
        processed: result.processed,
        skipped: result.skipped
      };
    } catch (error) {
      await createAuditLog(
        payload.requestedByUserId,
        "COMPUTE_CONSOLIDATED_RESULTS_FAILED",
        "RESULT_TERM",
        payload.resultTermId,
        {
          sectionId: payload.sectionId ?? null,
          recompute: payload.recompute,
          error: error instanceof Error ? error.message : "Unknown workflow error"
        }
      );
      throw error;
    } finally {
      await prisma.resultTerm.updateMany({
        where: {
          id: payload.resultTermId,
          lockOwner: payload.lockOwner
        },
        data: {
          isComputing: false,
          lockOwner: null,
          lockAcquiredAt: null,
          lockExpiresAt: null
        }
      });
    }
  }, "run")
});
export {
  consolidationWorkflow
};
//# sourceMappingURL=consolidation-workflow.mjs.map
