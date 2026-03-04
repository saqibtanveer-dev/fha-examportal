import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function getTeacherWiseAnalytics() {
  const rows = await prisma.$queryRaw<
    {
      teacher_id: string;
      first_name: string;
      last_name: string;
      exams_created: bigint;
      questions_created: bigint;
      total_results: bigint;
      avg_pct: number | null;
      pass_rate: number;
    }[]
  >`
    SELECT
      u.id as teacher_id,
      u."firstName" as first_name,
      u."lastName" as last_name,
      (SELECT COUNT(*) FROM "Exam" e WHERE e."createdById" = u.id AND e."deletedAt" IS NULL)::bigint as exams_created,
      (SELECT COUNT(*) FROM "Question" q WHERE q."createdById" = u.id AND q."deletedAt" IS NULL)::bigint as questions_created,
      COALESCE(stats.total_results, 0)::bigint as total_results,
      stats.avg_pct,
      COALESCE(stats.pass_rate, 0)::float as pass_rate
    FROM "User" u
    LEFT JOIN LATERAL (
      SELECT
        COUNT(*)::bigint as total_results,
        AVG(er.percentage)::float as avg_pct,
        CASE WHEN COUNT(*) > 0
          THEN (COUNT(*) FILTER (WHERE er."isPassed"))::float / COUNT(*)::float * 100
          ELSE 0
        END as pass_rate
      FROM "ExamResult" er
      JOIN "Exam" e ON er."examId" = e.id
      WHERE e."createdById" = u.id AND e."deletedAt" IS NULL
    ) stats ON true
    WHERE u.role = 'TEACHER' AND u."deletedAt" IS NULL AND u."isActive" = true
    ORDER BY u."firstName" ASC
  `;

  return rows.map((r) => ({
    teacherId: r.teacher_id,
    teacherName: `${r.first_name} ${r.last_name}`,
    examsCreated: Number(r.exams_created),
    questionsCreated: Number(r.questions_created),
    totalResults: Number(r.total_results),
    avgPercentage: Math.round(Number(r.avg_pct ?? 0) * 100) / 100,
    passRate: Math.round(r.pass_rate * 100) / 100,
  }));
}

export async function getClassWiseAnalytics() {
  const rows = await prisma.$queryRaw<
    {
      class_id: string;
      class_name: string;
      grade: number;
      total_students: bigint;
      total_results: bigint;
      avg_pct: number | null;
      pass_rate: number;
    }[]
  >`
    SELECT
      c.id as class_id,
      c.name as class_name,
      c.grade,
      (SELECT COUNT(*) FROM "StudentProfile" sp WHERE sp."classId" = c.id)::bigint as total_students,
      COALESCE(stats.total_results, 0)::bigint as total_results,
      stats.avg_pct,
      COALESCE(stats.pass_rate, 0)::float as pass_rate
    FROM "Class" c
    LEFT JOIN LATERAL (
      SELECT
        COUNT(*)::bigint as total_results,
        AVG(er.percentage)::float as avg_pct,
        CASE WHEN COUNT(*) > 0
          THEN (COUNT(*) FILTER (WHERE er."isPassed"))::float / COUNT(*)::float * 100
          ELSE 0
        END as pass_rate
      FROM "ExamResult" er
      JOIN "ExamClassAssignment" eca ON eca."examId" = er."examId"
      WHERE eca."classId" = c.id
    ) stats ON true
    WHERE c."isActive" = true
    ORDER BY c.grade ASC
  `;

  return rows.map((r) => ({
    classId: r.class_id,
    className: r.class_name,
    grade: r.grade,
    totalStudents: Number(r.total_students),
    totalResults: Number(r.total_results),
    avgPercentage: Math.round(Number(r.avg_pct ?? 0) * 100) / 100,
    passRate: Math.round(r.pass_rate * 100) / 100,
  }));
}

export async function getSubjectWiseAnalytics() {
  const rows = await prisma.$queryRaw<
    {
      subject_id: string;
      subject_name: string;
      subject_code: string;
      department_name: string;
      total_exams: bigint;
      total_results: bigint;
      avg_pct: number | null;
      pass_rate: number;
    }[]
  >`
    SELECT
      s.id as subject_id,
      s.name as subject_name,
      s.code as subject_code,
      COALESCE(d.name, 'Unassigned') as department_name,
      (SELECT COUNT(*) FROM "Exam" e WHERE e."subjectId" = s.id AND e."deletedAt" IS NULL)::bigint as total_exams,
      COALESCE(stats.total_results, 0)::bigint as total_results,
      stats.avg_pct,
      COALESCE(stats.pass_rate, 0)::float as pass_rate
    FROM "Subject" s
    LEFT JOIN "Department" d ON s."departmentId" = d.id
    LEFT JOIN LATERAL (
      SELECT
        COUNT(*)::bigint as total_results,
        AVG(er.percentage)::float as avg_pct,
        CASE WHEN COUNT(*) > 0
          THEN (COUNT(*) FILTER (WHERE er."isPassed"))::float / COUNT(*)::float * 100
          ELSE 0
        END as pass_rate
      FROM "ExamResult" er
      JOIN "Exam" e ON er."examId" = e.id
      WHERE e."subjectId" = s.id AND e."deletedAt" IS NULL
    ) stats ON true
    WHERE s."isActive" = true
    ORDER BY s.name ASC
  `;

  return rows.map((r) => ({
    subjectId: r.subject_id,
    subjectName: r.subject_name,
    subjectCode: r.subject_code,
    department: r.department_name,
    totalExams: Number(r.total_exams),
    totalResults: Number(r.total_results),
    avgPercentage: Math.round(Number(r.avg_pct ?? 0) * 100) / 100,
    passRate: Math.round(r.pass_rate * 100) / 100,
  }));
}

export async function getPerformanceTrends() {
  const rows = await prisma.$queryRaw<
    { month: string; avg_pct: number; pass_rate: number; total: bigint }[]
  >`
    SELECT
      TO_CHAR("createdAt", 'YYYY-MM') as month,
      AVG(percentage)::float as avg_pct,
      CASE WHEN COUNT(*) > 0
        THEN (COUNT(*) FILTER (WHERE "isPassed" = true))::float / COUNT(*)::float * 100
        ELSE 0
      END as pass_rate,
      COUNT(*)::bigint as total
    FROM "ExamResult"
    GROUP BY TO_CHAR("createdAt", 'YYYY-MM')
    ORDER BY month ASC
  `;

  return rows.map((r) => ({
    month: r.month,
    avgPercentage: Math.round(r.avg_pct * 100) / 100,
    passRate: Math.round(r.pass_rate * 100) / 100,
    totalExams: Number(r.total),
  }));
}

export async function getGradeDistributionOverall() {
  const results = await prisma.examResult.groupBy({
    by: ['grade'],
    _count: { _all: true },
    where: { grade: { not: null } },
    orderBy: { grade: 'asc' },
  });

  return results.map((r) => ({
    grade: r.grade ?? 'Unknown',
    count: r._count._all,
  }));
}

type StudentPerformanceRow = {
  studentId: string;
  studentName: string;
  rollNumber: string;
  className: string;
  section: string;
  examsTaken: number;
  avgPercentage: number;
  passRate: number;
};

async function getStudentPerformanceRanked(
  order: 'DESC' | 'ASC',
  limit = 10,
): Promise<StudentPerformanceRow[]> {
  const rows = await prisma.$queryRaw<
    {
      student_id: string;
      first_name: string;
      last_name: string;
      roll_number: string | null;
      class_name: string | null;
      section_name: string | null;
      exams_taken: bigint;
      avg_pct: number;
      pass_rate: number;
    }[]
  >`
    SELECT
      er."studentId" as student_id,
      u."firstName" as first_name,
      u."lastName" as last_name,
      sp."rollNumber" as roll_number,
      c.name as class_name,
      s.name as section_name,
      COUNT(*)::bigint as exams_taken,
      AVG(er.percentage)::float as avg_pct,
      CASE WHEN COUNT(*) > 0
        THEN (COUNT(*) FILTER (WHERE er."isPassed" = true))::float / COUNT(*)::float * 100
        ELSE 0
      END as pass_rate
    FROM "ExamResult" er
    JOIN "User" u ON er."studentId" = u.id
    LEFT JOIN "StudentProfile" sp ON sp."userId" = u.id
    LEFT JOIN "Class" c ON sp."classId" = c.id
    LEFT JOIN "Section" s ON sp."sectionId" = s.id
    WHERE u."isActive" = true AND u."deletedAt" IS NULL
    GROUP BY er."studentId", u."firstName", u."lastName", sp."rollNumber", c.name, s.name
    HAVING COUNT(*) > 0
    ORDER BY avg_pct ${order === 'DESC' ? Prisma.sql`DESC` : Prisma.sql`ASC`}
    LIMIT ${limit}
  `;

  return rows.map((r) => ({
    studentId: r.student_id,
    studentName: `${r.first_name} ${r.last_name}`,
    rollNumber: r.roll_number ?? '',
    className: r.class_name ?? '',
    section: r.section_name ?? '',
    examsTaken: Number(r.exams_taken),
    avgPercentage: Math.round(r.avg_pct * 100) / 100,
    passRate: Math.round(r.pass_rate * 100) / 100,
  }));
}

export async function getTopPerformingStudents(limit = 10) {
  return getStudentPerformanceRanked('DESC', limit);
}

export async function getBottomPerformingStudents(limit = 10) {
  return getStudentPerformanceRanked('ASC', limit);
}
