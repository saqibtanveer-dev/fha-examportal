import { prisma } from '@/lib/prisma';
import type { GazetteData, GazetteStudentRow, GroupScore } from '../types/report-types';
import { buildSchoolInfo } from './shared-report-helpers';

// ============================================
// Fetch Gazette Data for a section
// ============================================

export async function fetchGazetteData(
  resultTermId: string,
  sectionId: string,
): Promise<GazetteData | null> {
  const [term, school] = await Promise.all([
    prisma.resultTerm.findUnique({
      where: { id: resultTermId },
      include: {
        academicSession: { select: { name: true } },
        class: { select: { name: true } },
        examGroups: {
          orderBy: { sortOrder: 'asc' },
          select: { id: true, name: true, weight: true, sortOrder: true },
        },
      },
    }),
    prisma.schoolSettings.findFirst(),
  ]);

  if (!term || !school) return null;

  const section = await prisma.section.findUnique({
    where: { id: sectionId },
    select: { name: true },
  });
  if (!section) return null;

  // Get all summaries for this section ordered by rank
  const summaries = await prisma.consolidatedStudentSummary.findMany({
    where: { resultTermId, sectionId },
    orderBy: { rankInSection: 'asc' },
    include: {
      student: {
        select: {
          firstName: true,
          lastName: true,
          studentProfile: { select: { rollNumber: true } },
        },
      },
    },
  });

  // Get all consolidated results for these students
  const studentIds = summaries.map((s) => s.studentId);
  const allResults = await prisma.consolidatedResult.findMany({
    where: { resultTermId, studentId: { in: studentIds } },
    include: { subject: { select: { id: true, name: true, code: true } } },
  });

  // Build subject list (unique, ordered by name)
  const subjectMap = new Map<string, { id: string; name: string; code: string }>();
  for (const r of allResults) {
    if (!subjectMap.has(r.subjectId)) {
      subjectMap.set(r.subjectId, {
        id: r.subjectId,
        name: r.subject.name,
        code: r.subject.code,
      });
    }
  }
  const subjects = Array.from(subjectMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  // Index results by studentId → subjectId
  type SubjectMark = {
    obtained: number | null;
    total: number;
    percentage: number | null;
    grade: string | null;
    isPassed: boolean;
    groupScores: GroupScore[];
  };
  const resultIndex = new Map<string, Map<string, SubjectMark>>();
  for (const r of allResults) {
    let bySubject = resultIndex.get(r.studentId);
    if (!bySubject) { bySubject = new Map(); resultIndex.set(r.studentId, bySubject); }
    bySubject.set(r.subjectId, {
      obtained: Number(r.obtainedMarks),
      total: Number(r.totalMarks),
      percentage: Number(r.percentage),
      grade: r.grade,
      isPassed: r.isPassed,
      groupScores: (r.groupScores as GroupScore[]) ?? [],
    });
  }

  // Build student rows
  const studentRows: GazetteStudentRow[] = summaries.map((s) => {
    const bySubject = resultIndex.get(s.studentId) ?? new Map();
    const subjectMarks: GazetteStudentRow['subjectMarks'] = {};
    for (const subj of subjects) {
      const sr = bySubject.get(subj.id);
      subjectMarks[subj.id] = sr ?? {
        obtained: null,
        total: 0,
        percentage: null,
        grade: null,
        isPassed: false,
        groupScores: [],
      };
    }

    return {
      studentId: s.studentId,
      studentName: `${s.student.firstName} ${s.student.lastName}`,
      rollNumber: s.student.studentProfile?.rollNumber ?? '',
      sectionName: section.name,
      subjectMarks,
      grandTotalObtained: Number(s.grandObtainedMarks),
      grandTotalMax: Number(s.grandTotalMarks),
      overallPercentage: Number(s.overallPercentage),
      overallGrade: s.overallGrade,
      isOverallPassed: s.isOverallPassed,
      rankInClass: s.rankInClass,
      rankInSection: s.rankInSection,
      attendancePercentage: s.attendancePercentage ? Number(s.attendancePercentage) : null,
    };
  });

  const passedCount = summaries.filter((s) => s.isOverallPassed).length;
  const percentages = summaries.map((s) => Number(s.overallPercentage));
  const avgPct =
    percentages.length > 0
      ? percentages.reduce((a, b) => a + b, 0) / percentages.length
      : 0;

  return {
    school: buildSchoolInfo(school),
    resultTerm: {
      id: term.id,
      name: term.name,
      examGroups: term.examGroups.map((g) => ({
        id: g.id,
        name: g.name,
        weight: Number(g.weight),
        sortOrder: g.sortOrder,
      })),
    },
    className: term.class.name,
    sectionName: section.name,
    academicSession: term.academicSession.name,
    subjects: subjects.map((s) => ({ ...s, isElective: false })),
    students: studentRows,
    summary: {
      totalStudents: summaries.length,
      passedStudents: passedCount,
      failedStudents: summaries.length - passedCount,
      passRate: summaries.length > 0 ? Math.round((passedCount / summaries.length) * 10000) / 100 : 0,
      avgPercentage: Math.round(avgPct * 100) / 100,
      highestPercentage: percentages.length > 0 ? Math.max(...percentages) : 0,
      lowestPercentage: percentages.length > 0 ? Math.min(...percentages) : 0,
    },
  };
}
