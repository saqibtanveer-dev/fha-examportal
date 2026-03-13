import { prisma } from '@/lib/prisma';
import type { DmcData, DmcSubjectRow, SchoolInfo, GroupScore } from '../types/report-types';
import { format } from 'date-fns';
import { buildSchoolInfo } from './shared-report-helpers';

// ============================================
// Fetch DMC data for a single student
// ============================================

export async function fetchDmcData(
  resultTermId: string,
  studentId: string,
): Promise<DmcData | null> {
  const [term, school, summary, subjectResults, studentProfile] = await Promise.all([
    fetchTermWithGroups(resultTermId),
    prisma.schoolSettings.findFirst(),
    prisma.consolidatedStudentSummary.findUnique({
      where: { resultTermId_studentId: { resultTermId, studentId } },
    }),
    prisma.consolidatedResult.findMany({
      where: { resultTermId, studentId },
      include: { subject: { select: { name: true, code: true } } },
      orderBy: { subject: { name: 'asc' } },
    }),
    prisma.studentProfile.findUnique({
      where: { userId: studentId },
      include: {
        user: { select: { firstName: true, lastName: true } },
        section: { select: { name: true } },
      },
    }),
  ]);

  if (!term || !school || !summary || !studentProfile) return null;

  const familyLink = await prisma.familyStudentLink.findFirst({
    where: { studentProfileId: studentProfile.id, isActive: true },
    include: {
      familyProfile: {
        include: { user: { select: { firstName: true, lastName: true } } },
      },
    },
  });

  const [sectionCount, classCount] = await Promise.all([
    prisma.consolidatedStudentSummary.count({ where: { resultTermId, sectionId: summary.sectionId } }),
    prisma.consolidatedStudentSummary.count({ where: { resultTermId } }),
  ]);

  return assembleDmc({
    school: buildSchoolInfo(school),
    term,
    summary,
    subjectResults,
    studentProfile,
    familyLink,
    sectionCount,
    classCount,
  });
}

// ============================================
// Fetch batch DMC data for a section (optimized — 7 queries total)
// ============================================

export async function fetchBatchDmcData(
  resultTermId: string,
  sectionId: string,
): Promise<DmcData[]> {
  // Query 1+2: Term config + school settings (parallel)
  const [term, school] = await Promise.all([
    fetchTermWithGroups(resultTermId),
    prisma.schoolSettings.findFirst(),
  ]);
  if (!term || !school) return [];

  const schoolInfo = buildSchoolInfo(school);

  // Query 3: ALL summaries for this section
  const summaries = await prisma.consolidatedStudentSummary.findMany({
    where: { resultTermId, sectionId },
    orderBy: { rankInSection: 'asc' },
  });
  if (summaries.length === 0) return [];

  const studentIds = summaries.map((s) => s.studentId);

  // Query 4+5+6: ALL results, ALL profiles, ALL family links (parallel)
  const [allResults, allProfiles, allFamilyLinks, classCount] = await Promise.all([
    prisma.consolidatedResult.findMany({
      where: { resultTermId, studentId: { in: studentIds } },
      include: { subject: { select: { name: true, code: true } } },
      orderBy: { subject: { name: 'asc' } },
    }),
    prisma.studentProfile.findMany({
      where: { userId: { in: studentIds } },
      include: {
        user: { select: { firstName: true, lastName: true } },
        section: { select: { name: true } },
      },
    }),
    prisma.familyStudentLink.findMany({
      where: {
        studentProfile: { userId: { in: studentIds } },
        isActive: true,
      },
      include: {
        studentProfile: { select: { userId: true } },
        familyProfile: {
          include: { user: { select: { firstName: true, lastName: true } } },
        },
      },
    }),
    // Query 7: Class-wide count (one query, not per-student)
    prisma.consolidatedStudentSummary.count({ where: { resultTermId } }),
  ]);

  // Index by studentId for O(1) lookups
  const resultsByStudent = new Map<string, typeof allResults>();
  for (const r of allResults) {
    const arr = resultsByStudent.get(r.studentId) ?? [];
    arr.push(r);
    resultsByStudent.set(r.studentId, arr);
  }

  const profileByStudent = new Map(allProfiles.map((p) => [p.userId, p]));
  const familyByStudent = new Map(
    allFamilyLinks.map((f) => [f.studentProfile.userId, f]),
  );

  const sectionCount = summaries.length;

  // Assemble DMCs from pre-fetched data — zero additional queries
  const dmcs: DmcData[] = [];
  for (const summary of summaries) {
    const studentProfile = profileByStudent.get(summary.studentId);
    if (!studentProfile) continue;

    const subjectResults = resultsByStudent.get(summary.studentId) ?? [];
    const familyLink = familyByStudent.get(summary.studentId) ?? null;

    const dmc = assembleDmc({
      school: schoolInfo,
      term,
      summary,
      subjectResults,
      studentProfile,
      familyLink,
      sectionCount,
      classCount,
    });
    if (dmc) dmcs.push(dmc);
  }

  return dmcs;
}

// ============================================
// Shared: fetch term with groups (reused in single + batch)
// ============================================

function fetchTermWithGroups(resultTermId: string) {
  return prisma.resultTerm.findUnique({
    where: { id: resultTermId },
    include: {
      academicSession: { select: { name: true } },
      class: { select: { name: true } },
      examGroups: {
        orderBy: { sortOrder: 'asc' },
        select: { id: true, name: true, weight: true, sortOrder: true },
      },
    },
  });
}

// ============================================
// Shared: assemble a single DmcData from pre-fetched data
// ============================================

type AssembleDmcInput = {
  school: SchoolInfo;
  term: NonNullable<Awaited<ReturnType<typeof fetchTermWithGroups>>>;
  summary: {
    totalSubjects: number;
    passedSubjects: number;
    failedSubjects: number;
    grandObtainedMarks: unknown;
    grandTotalMarks: unknown;
    overallPercentage: unknown;
    overallGrade: string | null;
    isOverallPassed: boolean;
    rankInSection: number | null;
    rankInClass: number | null;
    sectionId: string;
    totalDays: number | null;
    presentDays: number | null;
    attendancePercentage: unknown;
    classTeacherRemarks: string | null;
    principalRemarks: string | null;
  };
  subjectResults: {
    subject: { name: string; code: string };
    groupScores: unknown;
    obtainedMarks: unknown;
    totalMarks: unknown;
    percentage: unknown;
    grade: string | null;
    isPassed: boolean;
  }[];
  studentProfile: {
    rollNumber: string;
    registrationNo: string;
    dateOfBirth: Date | null;
    gender: string | null;
    user: { firstName: string; lastName: string };
    section: { name: string };
  };
  familyLink: {
    familyProfile: { user: { firstName: string; lastName: string } };
  } | null;
  sectionCount: number;
  classCount: number;
};

function assembleDmc(input: AssembleDmcInput): DmcData {
  const { school, term, summary, subjectResults, studentProfile, familyLink, sectionCount, classCount } = input;
  const student = studentProfile.user;

  const subjects: DmcSubjectRow[] = subjectResults.map((r) => ({
    subjectName: r.subject.name,
    subjectCode: r.subject.code,
    isElective: false,
    groupScores: (r.groupScores as GroupScore[]) ?? [],
    consolidatedMarks: Number(r.obtainedMarks),
    maxConsolidatedMarks: Number(r.totalMarks),
    percentage: Number(r.percentage),
    grade: r.grade,
    isPassed: r.isPassed,
  }));

  return {
    school,
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
    sectionName: studentProfile.section.name,
    academicSession: term.academicSession.name,
    student: {
      name: `${student.firstName} ${student.lastName}`,
      fatherName: familyLink
        ? `${familyLink.familyProfile.user.firstName} ${familyLink.familyProfile.user.lastName}`
        : null,
      rollNumber: studentProfile.rollNumber,
      registrationNo: studentProfile.registrationNo,
      dateOfBirth: studentProfile.dateOfBirth
        ? format(studentProfile.dateOfBirth, 'dd-MMM-yyyy')
        : null,
      gender: studentProfile.gender ?? null,
    },
    subjects,
    summary: {
      totalSubjects: summary.totalSubjects,
      passedSubjects: summary.passedSubjects,
      failedSubjects: summary.failedSubjects,
      grandTotalObtained: Number(summary.grandObtainedMarks),
      grandTotalMax: Number(summary.grandTotalMarks),
      overallPercentage: Number(summary.overallPercentage),
      overallGrade: summary.overallGrade,
      isOverallPassed: summary.isOverallPassed,
      rankInSection: summary.rankInSection,
      totalStudentsInSection: sectionCount,
      rankInClass: summary.rankInClass,
      totalStudentsInClass: classCount,
    },
    attendance: summary.totalDays
      ? {
          totalDays: summary.totalDays,
          presentDays: summary.presentDays ?? 0,
          percentage: Number(summary.attendancePercentage ?? 0),
        }
      : null,
    classTeacherRemarks: summary.classTeacherRemarks,
    principalRemarks: summary.principalRemarks,
    dateOfIssue: format(new Date(), 'dd-MMM-yyyy'),
  };
}
