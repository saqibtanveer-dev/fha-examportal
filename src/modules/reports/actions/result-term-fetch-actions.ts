'use server';

import { requireRole, assertTeacherClassAccess } from '@/lib/auth-utils';
import { safeFetchAction } from '@/lib/safe-action';
import {
  listResultTerms,
  getResultTermWithGroups,
  getAvailableExamsForTerm,
  validateResultTermWeights,
  type ResultTermListFilters,
} from '../queries/result-term-queries';
import { fetchDmcData, fetchBatchDmcData } from '../queries/dmc-queries';
import { fetchGazetteData } from '../queries/gazette-queries';
import { prisma } from '@/lib/prisma';

// ============================================
// Result Term Fetch Actions
// ============================================

export const getResultTermsAction = safeFetchAction(async function getResultTermsAction(
  filters: ResultTermListFilters,
) {
  await requireRole('ADMIN', 'PRINCIPAL', 'TEACHER');
  return listResultTerms(filters);
});

export const getResultTermAction = safeFetchAction(async function getResultTermAction(
  id: string,
) {
  await requireRole('ADMIN', 'PRINCIPAL', 'TEACHER');
  return getResultTermWithGroups(id);
});

export const getAvailableExamsForTermAction = safeFetchAction(
  async function getAvailableExamsForTermAction(resultTermId: string) {
    await requireRole('ADMIN', 'PRINCIPAL');
    return getAvailableExamsForTerm(resultTermId);
  },
);

export const validateResultTermWeightsAction = safeFetchAction(
  async function validateResultTermWeightsAction(resultTermId: string) {
    await requireRole('ADMIN', 'PRINCIPAL');
    return validateResultTermWeights(resultTermId);
  },
);

// ============================================
// DMC Fetch Actions
// ============================================

export const getDmcDataAction = safeFetchAction(async function getDmcDataAction(
  resultTermId: string,
  studentId: string,
) {
  const session = await requireRole('ADMIN', 'PRINCIPAL', 'TEACHER');
  const term = await prisma.resultTerm.findUnique({ where: { id: resultTermId }, select: { classId: true } });
  if (term) await assertTeacherClassAccess(session.user.id, session.user.role, term.classId);
  return fetchDmcData(resultTermId, studentId);
});

export const getBatchDmcDataAction = safeFetchAction(async function getBatchDmcDataAction(
  resultTermId: string,
  sectionId: string,
) {
  const session = await requireRole('ADMIN', 'PRINCIPAL', 'TEACHER');
  const term = await prisma.resultTerm.findUnique({ where: { id: resultTermId }, select: { classId: true } });
  if (term) await assertTeacherClassAccess(session.user.id, session.user.role, term.classId);
  return fetchBatchDmcData(resultTermId, sectionId);
});

// ============================================
// Gazette Fetch Actions
// ============================================

export const getGazetteDataAction = safeFetchAction(async function getGazetteDataAction(
  resultTermId: string,
  sectionId: string,
) {
  const session = await requireRole('ADMIN', 'PRINCIPAL', 'TEACHER');
  const term = await prisma.resultTerm.findUnique({ where: { id: resultTermId }, select: { classId: true } });
  if (term) await assertTeacherClassAccess(session.user.id, session.user.role, term.classId);
  return fetchGazetteData(resultTermId, sectionId);
});

// ============================================
// Consolidation Status
// ============================================

export const getConsolidationStatusAction = safeFetchAction(
  async function getConsolidationStatusAction(resultTermId: string) {
    await requireRole('ADMIN', 'PRINCIPAL');
    const term = await prisma.resultTerm.findUnique({
      where: { id: resultTermId },
      select: {
        id: true,
        name: true,
        isComputing: true,
        isPublished: true,
        computedAt: true,
        _count: { select: { consolidatedResults: true, consolidatedSummaries: true } },
      },
    });
    return term;
  },
);

// ============================================
// Section list for a class (used in DMC/gazette page filters)
// ============================================

export const getSectionsForClassAction = safeFetchAction(
  async function getSectionsForClassAction(classId: string) {
    await requireRole('ADMIN', 'PRINCIPAL', 'TEACHER');
    return prisma.section.findMany({
      where: { classId },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });
  },
);

// ============================================
// Students in a section with consolidation status
// ============================================

export const getSectionStudentsForDmcAction = safeFetchAction(
  async function getSectionStudentsForDmcAction(resultTermId: string, sectionId: string) {
    await requireRole('ADMIN', 'PRINCIPAL', 'TEACHER');

    const summaries = await prisma.consolidatedStudentSummary.findMany({
      where: { resultTermId, sectionId },
      orderBy: { rankInSection: 'asc' },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            studentProfile: { select: { rollNumber: true } },
          },
        },
      },
    });

    return summaries.map((s) => ({
      studentId: s.studentId,
      name: `${s.student.firstName} ${s.student.lastName}`,
      rollNumber: s.student.studentProfile?.rollNumber ?? '',
      rankInSection: s.rankInSection,
      overallPercentage: Number(s.overallPercentage),
      overallGrade: s.overallGrade,
      isOverallPassed: s.isOverallPassed,
    }));
  },
);

// ============================================
// Student own DMC (for student/family role)
// ============================================

export const getStudentDmcAction = safeFetchAction(async function getStudentDmcAction(
  resultTermId: string,
  studentId: string,
) {
  const session = await requireRole('STUDENT', 'FAMILY', 'ADMIN', 'PRINCIPAL');
  const { role, id: userId } = session.user;

  if (role === 'STUDENT' && userId !== studentId) {
    throw new Error('Access denied');
  }

  if (role === 'FAMILY') {
    const link = await prisma.familyStudentLink.findFirst({
      where: {
        familyProfile: { userId },
        studentProfile: { userId: studentId },
        isActive: true,
      },
    });
    if (!link) throw new Error('Access denied');
  }

  // Only published terms visible to students/family
  if (role === 'STUDENT' || role === 'FAMILY') {
    const term = await prisma.resultTerm.findUnique({
      where: { id: resultTermId },
      select: { isPublished: true },
    });
    if (!term?.isPublished) throw new Error('Results not yet published');
  }

  return fetchDmcData(resultTermId, studentId);
});

// ============================================
// Published result terms for student
// ============================================

export const getPublishedResultTermsForStudentAction = safeFetchAction(
  async function getPublishedResultTermsForStudentAction(studentId: string) {
    await requireRole('STUDENT', 'FAMILY', 'ADMIN', 'PRINCIPAL');

    const profile = await prisma.studentProfile.findUnique({
      where: { userId: studentId },
      select: { classId: true },
    });
    if (!profile) return [];

    return prisma.resultTerm.findMany({
      where: {
        classId: profile.classId,
        isPublished: true,
        consolidatedSummaries: { some: { studentId } },
      },
      orderBy: { publishedAt: 'desc' },
      select: {
        id: true,
        name: true,
        publishedAt: true,
        academicSession: { select: { name: true } },
      },
    });
  },
);
