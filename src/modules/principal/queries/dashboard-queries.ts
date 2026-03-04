import { prisma } from '@/lib/prisma';

// ============================================
// Dashboard Overview Stats (optimized — 3 queries instead of 12)
// ============================================

export async function getPrincipalDashboardStats() {
  const [entityCounts, examCounts, resultStats, pendingGrading] = await Promise.all([
    prisma.$queryRaw<[{ teachers: bigint; students: bigint; classes: bigint; subjects: bigint }]>`
      SELECT
        (SELECT COUNT(*) FROM "User" WHERE role = 'TEACHER' AND "isActive" = true AND "deletedAt" IS NULL) as teachers,
        (SELECT COUNT(*) FROM "User" WHERE role = 'STUDENT' AND "isActive" = true AND "deletedAt" IS NULL) as students,
        (SELECT COUNT(*) FROM "Class" WHERE "isActive" = true) as classes,
        (SELECT COUNT(*) FROM "Subject" WHERE "isActive" = true) as subjects
    `,
    prisma.$queryRaw<[{ total: bigint; active: bigint }]>`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'ACTIVE') as active
      FROM "Exam" WHERE "deletedAt" IS NULL
    `,
    prisma.$queryRaw<[{ total: bigint; passed: bigint; avg_pct: number | null }]>`
      SELECT
        COUNT(*)::bigint as total,
        COUNT(*) FILTER (WHERE "isPassed" = true)::bigint as passed,
        AVG(percentage)::float as avg_pct
      FROM "ExamResult"
    `,
    prisma.examSession.count({ where: { status: { in: ['SUBMITTED', 'GRADING'] } } }),
  ]);

  const ec = entityCounts[0] ?? { teachers: 0, students: 0, classes: 0, subjects: 0 };
  const ex = examCounts[0] ?? { total: 0, active: 0 };
  const rs = resultStats[0] ?? { total: 0, passed: 0, avg_pct: null };
  const totalResults = Number(rs.total);
  const passedCount = Number(rs.passed);
  const overallPassRate = totalResults > 0 ? (passedCount / totalResults) * 100 : 0;

  return {
    totalTeachers: Number(ec.teachers),
    totalStudents: Number(ec.students),
    totalClasses: Number(ec.classes),
    totalSubjects: Number(ec.subjects),
    totalExams: Number(ex.total),
    totalResults,
    activeExams: Number(ex.active),
    pendingGrading,
    overallPassRate: Math.round(overallPassRate * 100) / 100,
    overallAvgPercentage: Math.round(Number(rs.avg_pct ?? 0) * 100) / 100,
  };
}

// ============================================
// Recent Activity
// ============================================

export async function getRecentActivity(limit = 10) {
  const [recentExams, recentResults, recentSessions] = await Promise.all([
    prisma.exam.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        title: true,
        status: true,
        type: true,
        createdAt: true,
        createdBy: { select: { firstName: true, lastName: true } },
        subject: { select: { name: true, code: true } },
      },
    }),
    prisma.examResult.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        percentage: true,
        isPassed: true,
        grade: true,
        createdAt: true,
        exam: { select: { title: true } },
        student: { select: { firstName: true, lastName: true } },
      },
    }),
    prisma.examSession.findMany({
      where: { status: 'SUBMITTED' },
      orderBy: { submittedAt: 'desc' },
      take: limit,
      select: {
        id: true,
        submittedAt: true,
        exam: { select: { title: true } },
        student: { select: { firstName: true, lastName: true } },
      },
    }),
  ]);

  return { recentExams, recentResults, recentSessions };
}

// ============================================
// Filter Helpers
// ============================================

export async function getFilterOptions() {
  const [classes, subjects, sections] = await Promise.all([
    prisma.class.findMany({
      where: { isActive: true },
      orderBy: { grade: 'asc' },
      select: { id: true, name: true, grade: true },
    }),
    prisma.subject.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, code: true },
    }),
    prisma.section.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, classId: true },
    }),
  ]);

  return { classes, subjects, sections };
}
