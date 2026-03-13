import { prisma } from '@/lib/prisma';
import { computeRanks, toNum } from './grading-utils';
import { CONSOLIDATION_BATCH_SIZE } from './report-constants';

// ============================================
// Assign ranks after all consolidation results are stored
// Computes both class-wide and per-section ranks
// Uses standard competition ranking (1224 method)
// Batched writes for scalability (2000+ students)
// ============================================

export async function assignRanks(resultTermId: string) {
  const summaries = await prisma.consolidatedStudentSummary.findMany({
    where: { resultTermId },
    select: {
      id: true,
      studentId: true,
      sectionId: true,
      overallPercentage: true,
    },
    orderBy: { overallPercentage: 'desc' },
  });

  if (summaries.length === 0) return;

  // Class ranks
  const withClassRanks = computeRanks(
    summaries.map((s) => ({ ...s, percentage: toNum(s.overallPercentage) })),
  );

  // Section ranks grouped
  const sectionGroups = new Map<string, typeof withClassRanks>();
  for (const s of withClassRanks) {
    const arr = sectionGroups.get(s.sectionId) ?? [];
    arr.push(s);
    sectionGroups.set(s.sectionId, arr);
  }

  const sectionRanks = new Map<string, number>();
  for (const [, students] of sectionGroups) {
    const ranked = computeRanks(students);
    for (const r of ranked) sectionRanks.set(r.id, r.rank);
  }

  // Batch update ranks in chunks to avoid overwhelming the DB
  for (let i = 0; i < withClassRanks.length; i += CONSOLIDATION_BATCH_SIZE) {
    const batch = withClassRanks.slice(i, i + CONSOLIDATION_BATCH_SIZE);
    await prisma.$transaction(
      batch.map((s) =>
        prisma.consolidatedStudentSummary.update({
          where: { id: s.id },
          data: {
            rankInClass: s.rank,
            rankInSection: sectionRanks.get(s.id) ?? null,
          },
        }),
      ),
    );
  }

  // Update result term computedAt
  await prisma.resultTerm.update({
    where: { id: resultTermId },
    data: { computedAt: new Date() },
  });
}
