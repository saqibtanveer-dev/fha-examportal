import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// ============================================
// Dashboard Overview Stats (optimized — 3 queries instead of 12)
// ============================================

export async function getPrincipalDashboardStats() {
  const [entityCounts, examCounts, resultStats, pendingGrading] = await Promise.all([
    // Single raw query for all entity counts
    prisma.$queryRaw<[{ teachers: bigint; students: bigint; classes: bigint; subjects: bigint }]>`
      SELECT
        (SELECT COUNT(*) FROM "User" WHERE role = 'TEACHER' AND "isActive" = true AND "deletedAt" IS NULL) as teachers,
        (SELECT COUNT(*) FROM "User" WHERE role = 'STUDENT' AND "isActive" = true AND "deletedAt" IS NULL) as students,
        (SELECT COUNT(*) FROM "Class" WHERE "isActive" = true) as classes,
        (SELECT COUNT(*) FROM "Subject" WHERE "isActive" = true) as subjects
    `,
    // Single raw query for exam counts (total + active)
    prisma.$queryRaw<[{ total: bigint; active: bigint }]>`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'ACTIVE') as active
      FROM "Exam" WHERE "deletedAt" IS NULL
    `,
    // Single raw query for ALL result stats (count + passed + avg)
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
// Teachers Queries
// ============================================

export type TeacherListItem = {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  employeeId: string;
  qualification: string | null;
  specialization: string | null;
  joiningDate: Date;
  isActive: boolean;
  lastLoginAt: Date | null;
  subjectCount: number;
  examCount: number;
  questionCount: number;
};

export async function getTeachersList(params?: {
  search?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ teachers: TeacherListItem[]; total: number }> {
  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 20;
  const skip = (page - 1) * pageSize;

  const where: Prisma.UserWhereInput = {
    role: 'TEACHER',
    deletedAt: null,
    ...(params?.search
      ? {
          OR: [
            { firstName: { contains: params.search, mode: 'insensitive' } },
            { lastName: { contains: params.search, mode: 'insensitive' } },
            { email: { contains: params.search, mode: 'insensitive' } },
            { teacherProfile: { employeeId: { contains: params.search, mode: 'insensitive' } } },
          ],
        }
      : {}),
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { firstName: 'asc' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        isActive: true,
        lastLoginAt: true,
        teacherProfile: {
          select: {
            id: true,
            employeeId: true,
            qualification: true,
            specialization: true,
            joiningDate: true,
            teacherSubjects: { select: { id: true } },
          },
        },
        _count: {
          select: {
            examsCreated: { where: { deletedAt: null } },
            questions: { where: { deletedAt: null } },
          },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  const teachers: TeacherListItem[] = users.map((u) => ({
    id: u.teacherProfile!.id,
    userId: u.id,
    firstName: u.firstName,
    lastName: u.lastName,
    email: u.email,
    phone: u.phone,
    employeeId: u.teacherProfile!.employeeId,
    qualification: u.teacherProfile?.qualification ?? null,
    specialization: u.teacherProfile?.specialization ?? null,
    joiningDate: u.teacherProfile!.joiningDate,
    isActive: u.isActive,
    lastLoginAt: u.lastLoginAt,
    subjectCount: u.teacherProfile?.teacherSubjects.length ?? 0,
    examCount: u._count.examsCreated,
    questionCount: u._count.questions,
  }));

  return { teachers, total };
}

export async function getTeacherDetail(teacherUserId: string) {
  const user = await prisma.user.findUnique({
    where: { id: teacherUserId, role: 'TEACHER' },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      isActive: true,
      lastLoginAt: true,
      createdAt: true,
      teacherProfile: {
        select: {
          id: true,
          employeeId: true,
          qualification: true,
          specialization: true,
          joiningDate: true,
          teacherSubjects: {
            select: {
              subject: { select: { id: true, name: true, code: true } },
              class: { select: { id: true, name: true, grade: true } },
            },
          },
        },
      },
    },
  });

  if (!user || !user.teacherProfile) return null;

  // Parallelize all independent queries
  const [exams, questionStats, gradingStats, examResults] = await Promise.all([
    // Get exams created by this teacher
    prisma.exam.findMany({
      where: { createdById: teacherUserId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        type: true,
        status: true,
        totalMarks: true,
        duration: true,
        scheduledStartAt: true,
        createdAt: true,
        subject: { select: { name: true, code: true } },
        _count: {
          select: {
            examQuestions: true,
            examSessions: true,
            examResults: true,
          },
        },
      },
    }),
    // Get question stats
    prisma.question.groupBy({
      by: ['type'],
      where: { createdById: teacherUserId, deletedAt: null },
      _count: { _all: true },
    }),
    // Get grading stats (use groupBy instead of fetching rows)
    prisma.examSession.groupBy({
      by: ['status'],
      where: {
        exam: { createdById: teacherUserId },
        status: { in: ['SUBMITTED', 'GRADING', 'GRADED'] },
      },
      _count: { _all: true },
    }),
    // Get exam performance summary via SQL aggregate
    prisma.$queryRaw<[{ total: bigint; passed: bigint; avg_pct: number | null }]>`
      SELECT
        COUNT(*)::bigint as total,
        COUNT(*) FILTER (WHERE er."isPassed" = true)::bigint as passed,
        AVG(er.percentage)::float as avg_pct
      FROM "ExamResult" er
      JOIN "Exam" e ON er."examId" = e.id
      WHERE e."createdById" = ${teacherUserId} AND e."deletedAt" IS NULL
    `,
  ]);

  const pendingGrading = gradingStats
    .filter((s) => s.status === 'SUBMITTED' || s.status === 'GRADING')
    .reduce((sum, s) => sum + s._count._all, 0);
  const gradedCount = gradingStats
    .filter((s) => s.status === 'GRADED')
    .reduce((sum, s) => sum + s._count._all, 0);

  const rs = examResults[0]!;
  const totalResults = Number(rs.total);
  const passedResults = Number(rs.passed);

  return {
    ...user,
    teacherProfile: user.teacherProfile,
    exams,
    questionStats: questionStats.map((qs) => ({
      type: qs.type,
      count: qs._count._all,
    })),
    gradingStats: { pendingGrading, gradedCount },
    performanceSummary: {
      totalResults,
      passedResults,
      failedResults: totalResults - passedResults,
      passRate: totalResults > 0 ? Math.round((passedResults / totalResults) * 10000) / 100 : 0,
      avgPercentage: Math.round(Number(rs.avg_pct ?? 0) * 100) / 100,
    },
  };
}

// ============================================
// Students Queries
// ============================================

export type StudentListItem = {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  rollNumber: string;
  registrationNo: string;
  className: string;
  classId: string;
  sectionName: string;
  status: string;
  gender: string | null;
  isActive: boolean;
  lastLoginAt: Date | null;
  examsTaken: number;
  avgPercentage: number;
};

export async function getStudentsList(params?: {
  search?: string;
  classId?: string;
  sectionId?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ students: StudentListItem[]; total: number }> {
  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 20;
  const skip = (page - 1) * pageSize;

  const where: Prisma.UserWhereInput = {
    role: 'STUDENT',
    deletedAt: null,
    ...(params?.search
      ? {
          OR: [
            { firstName: { contains: params.search, mode: 'insensitive' } },
            { lastName: { contains: params.search, mode: 'insensitive' } },
            { email: { contains: params.search, mode: 'insensitive' } },
            { studentProfile: { rollNumber: { contains: params.search, mode: 'insensitive' } } },
            { studentProfile: { registrationNo: { contains: params.search, mode: 'insensitive' } } },
          ],
        }
      : {}),
    ...(params?.classId ? { studentProfile: { classId: params.classId } } : {}),
    ...(params?.sectionId ? { studentProfile: { sectionId: params.sectionId } } : {}),
    ...(params?.status ? { studentProfile: { status: params.status as any } } : {}),
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { firstName: 'asc' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        isActive: true,
        lastLoginAt: true,
        studentProfile: {
          select: {
            id: true,
            rollNumber: true,
            registrationNo: true,
            status: true,
            gender: true,
            classId: true,
            class: { select: { name: true } },
            section: { select: { name: true } },
          },
        },
        _count: { select: { examResults: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  // Batch-fetch average percentages via SQL for this page of students
  const userIds = users.map((u) => u.id);
  const avgStats =
    userIds.length > 0
      ? await prisma.$queryRaw<{ student_id: string; avg_pct: number; cnt: bigint }[]>`
          SELECT "studentId" as student_id, AVG(percentage)::float as avg_pct, COUNT(*)::bigint as cnt
          FROM "ExamResult" WHERE "studentId" = ANY(${userIds})
          GROUP BY "studentId"
        `
      : [];
  const avgMap = new Map(avgStats.map((r) => [r.student_id, { avg: r.avg_pct, count: Number(r.cnt) }]));

  const students: StudentListItem[] = users
    .filter((u) => u.studentProfile)
    .map((u) => {
      const stats = avgMap.get(u.id);

      return {
        id: u.studentProfile!.id,
        userId: u.id,
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        phone: u.phone,
        rollNumber: u.studentProfile!.rollNumber,
        registrationNo: u.studentProfile!.registrationNo,
        className: u.studentProfile!.class.name,
        classId: u.studentProfile!.classId,
        sectionName: u.studentProfile!.section.name,
        status: u.studentProfile!.status,
        gender: u.studentProfile?.gender ?? null,
        isActive: u.isActive,
        lastLoginAt: u.lastLoginAt,
        examsTaken: stats?.count ?? 0,
        avgPercentage: Math.round((stats?.avg ?? 0) * 100) / 100,
      };
    });

  return { students, total };
}

export async function getStudentDetail(studentUserId: string) {
  const user = await prisma.user.findUnique({
    where: { id: studentUserId, role: 'STUDENT' },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      isActive: true,
      lastLoginAt: true,
      createdAt: true,
      studentProfile: {
        select: {
          id: true,
          rollNumber: true,
          registrationNo: true,
          status: true,
          gender: true,
          guardianName: true,
          guardianPhone: true,
          dateOfBirth: true,
          enrollmentDate: true,
          class: { select: { id: true, name: true, grade: true } },
          section: { select: { id: true, name: true } },
        },
      },
    },
  });

  if (!user || !user.studentProfile) return null;

  // Parallelize independent queries
  const [results, sessions] = await Promise.all([
    // Get all exam results with details
    prisma.examResult.findMany({
    where: { studentId: studentUserId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      totalMarks: true,
      obtainedMarks: true,
      percentage: true,
      grade: true,
      isPassed: true,
      rank: true,
      createdAt: true,
      exam: {
        select: {
          id: true,
          title: true,
          type: true,
          subject: { select: { name: true, code: true } },
          createdBy: { select: { firstName: true, lastName: true } },
        },
      },
    },
    }),
    // Exam sessions (including in-progress) — parallelized
    prisma.examSession.findMany({
      where: { studentId: studentUserId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        status: true,
        startedAt: true,
        submittedAt: true,
        timeSpent: true,
        tabSwitchCount: true,
        isFlagged: true,
        exam: { select: { title: true, duration: true } },
      },
    }),
  ]);

  // Calculate performance summary
  const totalExams = results.length;
  const passedExams = results.filter((r) => r.isPassed).length;
  const avgPercentage =
    totalExams > 0
      ? results.reduce((sum, r) => sum + Number(r.percentage), 0) / totalExams
      : 0;
  const highestPercentage =
    totalExams > 0
      ? Math.max(...results.map((r) => Number(r.percentage)))
      : 0;
  const lowestPercentage =
    totalExams > 0
      ? Math.min(...results.map((r) => Number(r.percentage)))
      : 0;

  // Subject-wise performance
  const bySubject: Record<string, { total: number; sum: number; passed: number; name: string }> = {};
  for (const r of results) {
    const subName = r.exam.subject.name;
    if (!bySubject[subName]) bySubject[subName] = { total: 0, sum: 0, passed: 0, name: subName };
    bySubject[subName]!.total += 1;
    bySubject[subName]!.sum += Number(r.percentage);
    if (r.isPassed) bySubject[subName]!.passed += 1;
  }

  const subjectPerformance = Object.values(bySubject).map((s) => ({
    subject: s.name,
    exams: s.total,
    avgPercentage: Math.round((s.sum / s.total) * 100) / 100,
    passRate: Math.round((s.passed / s.total) * 10000) / 100,
  }));

  // Timeline
  const timeline = results
    .reverse()
    .map((r) => ({
      date: r.createdAt.toISOString(),
      percentage: Number(r.percentage),
      exam: r.exam.title,
      subject: r.exam.subject.name,
    }));

  return {
    ...user,
    studentProfile: user.studentProfile,
    results,
    sessions,
    performance: {
      totalExams,
      passedExams,
      failedExams: totalExams - passedExams,
      passRate: totalExams > 0 ? Math.round((passedExams / totalExams) * 10000) / 100 : 0,
      avgPercentage: Math.round(avgPercentage * 100) / 100,
      highestPercentage: Math.round(highestPercentage * 100) / 100,
      lowestPercentage: Math.round(lowestPercentage * 100) / 100,
    },
    subjectPerformance,
    timeline,
  };
}

// ============================================
// Classes Queries
// ============================================

export type ClassOverview = {
  id: string;
  name: string;
  grade: number;
  isActive: boolean;
  totalStudents: number;
  totalSections: number;
  sectionNames: string[];
  totalExams: number;
  avgPercentage: number;
  passRate: number;
};

export async function getClassesList(): Promise<ClassOverview[]> {
  const classes = await prisma.class.findMany({
    where: { isActive: true },
    orderBy: { grade: 'asc' },
    select: {
      id: true,
      name: true,
      grade: true,
      isActive: true,
      sections: { select: { name: true } },
      _count: { select: { students: true } },
    },
  });

  // Batch-fetch exam stats per class via SQL
  const classIds = classes.map((c) => c.id);
  const [examCounts, resultStats] = await Promise.all([
    classIds.length > 0
      ? prisma.$queryRaw<{ class_id: string; exam_count: bigint }[]>`
          SELECT "classId" as class_id, COUNT(DISTINCT "examId")::bigint as exam_count
          FROM "ExamClassAssignment" WHERE "classId" = ANY(${classIds})
          GROUP BY "classId"
        `
      : [],
    classIds.length > 0
      ? prisma.$queryRaw<{ class_id: string; total: bigint; passed: bigint; avg_pct: number | null }[]>`
          SELECT eca."classId" as class_id,
            COUNT(*)::bigint as total,
            COUNT(*) FILTER (WHERE er."isPassed" = true)::bigint as passed,
            AVG(er.percentage)::float as avg_pct
          FROM "ExamResult" er
          JOIN "ExamClassAssignment" eca ON eca."examId" = er."examId"
          WHERE eca."classId" = ANY(${classIds})
          GROUP BY eca."classId"
        `
      : [],
  ]);

  const examCountMap = new Map(examCounts.map((r) => [r.class_id, Number(r.exam_count)]));
  const statsMap = new Map(
    resultStats.map((r) => [r.class_id, { total: Number(r.total), passed: Number(r.passed), avg: r.avg_pct }]),
  );

  return classes.map((cls) => {
    const s = statsMap.get(cls.id);
    const total = s?.total ?? 0;

    return {
      id: cls.id,
      name: cls.name,
      grade: cls.grade,
      isActive: cls.isActive,
      totalStudents: cls._count.students,
      totalSections: cls.sections.length,
      sectionNames: cls.sections.map((s) => s.name),
      totalExams: examCountMap.get(cls.id) ?? 0,
      avgPercentage: Math.round(Number(s?.avg ?? 0) * 100) / 100,
      passRate: total > 0 ? Math.round(((s?.passed ?? 0) / total) * 10000) / 100 : 0,
    };
  });
}

export async function getClassDetail(classId: string) {
  const cls = await prisma.class.findUnique({
    where: { id: classId },
    select: {
      id: true,
      name: true,
      grade: true,
      isActive: true,
      sections: {
        select: {
          id: true,
          name: true,
          students: {
            select: {
              userId: true,
              rollNumber: true,
              status: true,
              user: { select: { firstName: true, lastName: true, email: true, isActive: true } },
            },
          },
        },
      },
      subjectClassLinks: {
        select: {
          subject: { select: { id: true, name: true, code: true } },
        },
      },
      teacherSubjects: {
        select: {
          teacher: {
            select: {
              user: { select: { id: true, firstName: true, lastName: true } },
            },
          },
          subject: { select: { name: true, code: true } },
        },
      },
    },
  });

  if (!cls) return null;

  // Get all students in this class
  const studentUserIds = cls.sections.flatMap((s) => s.students.map((st) => st.userId));

  // Parallelize independent queries
  const [results, assignedExams] = await Promise.all([
    // Get exam results for students in this class
    prisma.examResult.findMany({
      where: { studentId: { in: studentUserIds } },
      select: {
        studentId: true,
        percentage: true,
        isPassed: true,
        exam: { select: { id: true, title: true, type: true, subject: { select: { name: true } } } },
      },
    }),
    // Get exams assigned to this class (use SQL aggregate for result stats)
    prisma.examClassAssignment.findMany({
      where: { classId },
      select: {
        exam: {
          select: {
            id: true,
            title: true,
            type: true,
            status: true,
            totalMarks: true,
            scheduledStartAt: true,
            subject: { select: { name: true, code: true } },
            createdBy: { select: { firstName: true, lastName: true } },
            _count: { select: { examResults: true } },
          },
        },
      },
    }),
  ]);

  // Batch-fetch exam result stats for assigned exams
  const assignedExamIds = assignedExams.map((ae) => ae.exam.id);
  const examResultStats =
    assignedExamIds.length > 0
      ? await prisma.$queryRaw<
          { exam_id: string; total: bigint; passed: bigint; avg_pct: number | null }[]
        >`
          SELECT "examId" as exam_id, COUNT(*)::bigint as total,
            COUNT(*) FILTER (WHERE "isPassed" = true)::bigint as passed,
            AVG(percentage)::float as avg_pct
          FROM "ExamResult" WHERE "examId" = ANY(${assignedExamIds})
          GROUP BY "examId"
        `
      : [];
  const examStatsMap = new Map(
    examResultStats.map((r) => [r.exam_id, { total: Number(r.total), passed: Number(r.passed), avg: r.avg_pct }]),
  );

  // Calculate class-level stats
  const allPercentages = results.map((r) => Number(r.percentage));
  const totalResultsCount = allPercentages.length;
  const passedCount = results.filter((r) => r.isPassed).length;
  const avgPercentage =
    totalResultsCount > 0
      ? allPercentages.reduce((a, b) => a + b, 0) / totalResultsCount
      : 0;

  // Subject-wise performance
  const bySubject: Record<string, { sum: number; total: number; passed: number }> = {};
  for (const r of results) {
    const sub = r.exam.subject.name;
    if (!bySubject[sub]) bySubject[sub] = { sum: 0, total: 0, passed: 0 };
    bySubject[sub]!.sum += Number(r.percentage);
    bySubject[sub]!.total += 1;
    if (r.isPassed) bySubject[sub]!.passed += 1;
  }

  const subjectPerformance = Object.entries(bySubject).map(([subject, data]) => ({
    subject,
    avgPercentage: Math.round((data.sum / data.total) * 100) / 100,
    passRate: Math.round((data.passed / data.total) * 10000) / 100,
    totalResults: data.total,
  }));

  // Per-student performance
  const byStudent: Record<string, { sum: number; total: number; passed: number }> = {};
  for (const r of results) {
    if (!byStudent[r.studentId]) byStudent[r.studentId] = { sum: 0, total: 0, passed: 0 };
    byStudent[r.studentId]!.sum += Number(r.percentage);
    byStudent[r.studentId]!.total += 1;
    if (r.isPassed) byStudent[r.studentId]!.passed += 1;
  }

  const studentsWithPerformance = cls.sections.flatMap((s) =>
    s.students.map((st) => {
      const perf = byStudent[st.userId];
      return {
        userId: st.userId,
        firstName: st.user.firstName,
        lastName: st.user.lastName,
        email: st.user.email,
        rollNumber: st.rollNumber,
        section: s.name,
        status: st.status,
        isActive: st.user.isActive,
        examsTaken: perf?.total ?? 0,
        avgPercentage: perf ? Math.round((perf.sum / perf.total) * 100) / 100 : 0,
        passRate: perf ? Math.round((perf.passed / perf.total) * 10000) / 100 : 0,
      };
    }),
  );

  return {
    ...cls,
    assignedExams: assignedExams.map((ae) => {
      const es = examStatsMap.get(ae.exam.id);
      const totalResults = es?.total ?? 0;
      return {
        ...ae.exam,
        totalMarks: Number(ae.exam.totalMarks),
        resultsCount: totalResults,
        avgPercentage: Math.round(Number(es?.avg ?? 0) * 100) / 100,
        passRate: totalResults > 0 ? Math.round(((es?.passed ?? 0) / totalResults) * 10000) / 100 : 0,
      };
    }),
    classStats: {
      totalStudents: studentUserIds.length,
      totalResults: totalResultsCount,
      passedCount,
      failedCount: totalResultsCount - passedCount,
      avgPercentage: Math.round(avgPercentage * 100) / 100,
      passRate:
        totalResultsCount > 0
          ? Math.round((passedCount / totalResultsCount) * 10000) / 100
          : 0,
    },
    subjectPerformance,
    studentsWithPerformance,
  };
}

// ============================================
// Exams Queries (Principal view - all exams)
// ============================================

export type ExamListItem = {
  id: string;
  title: string;
  type: string;
  status: string;
  subjectName: string;
  subjectCode: string;
  createdBy: string;
  totalMarks: number;
  duration: number;
  scheduledStartAt: Date | null;
  totalQuestions: number;
  totalStudents: number;
  avgPercentage: number;
  passRate: number;
  createdAt: Date;
};

export async function getExamsList(params?: {
  search?: string;
  status?: string;
  subjectId?: string;
  type?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ exams: ExamListItem[]; total: number }> {
  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 20;
  const skip = (page - 1) * pageSize;

  const where: Prisma.ExamWhereInput = {
    deletedAt: null,
    ...(params?.search
      ? { title: { contains: params.search, mode: 'insensitive' } }
      : {}),
    ...(params?.status ? { status: params.status as any } : {}),
    ...(params?.subjectId ? { subjectId: params.subjectId } : {}),
    ...(params?.type ? { type: params.type as any } : {}),
  };

  const [exams, total] = await Promise.all([
    prisma.exam.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        type: true,
        status: true,
        totalMarks: true,
        duration: true,
        scheduledStartAt: true,
        createdAt: true,
        subject: { select: { name: true, code: true } },
        createdBy: { select: { firstName: true, lastName: true } },
        _count: { select: { examQuestions: true } },
      },
    }),
    prisma.exam.count({ where }),
  ]);

  // Batch-fetch exam result stats via SQL for this page of exams
  const examIds = exams.map((e) => e.id);
  const examStats =
    examIds.length > 0
      ? await prisma.$queryRaw<
          { exam_id: string; total: bigint; passed: bigint; avg_pct: number | null }[]
        >`
          SELECT "examId" as exam_id, COUNT(*)::bigint as total,
            COUNT(*) FILTER (WHERE "isPassed" = true)::bigint as passed,
            AVG(percentage)::float as avg_pct
          FROM "ExamResult" WHERE "examId" = ANY(${examIds})
          GROUP BY "examId"
        `
      : [];
  const statsMap = new Map(
    examStats.map((r) => [r.exam_id, { total: Number(r.total), passed: Number(r.passed), avg: r.avg_pct }]),
  );

  const examList: ExamListItem[] = exams.map((e) => {
    const s = statsMap.get(e.id);
    const totalStudents = s?.total ?? 0;

    return {
      id: e.id,
      title: e.title,
      type: e.type,
      status: e.status,
      subjectName: e.subject.name,
      subjectCode: e.subject.code,
      createdBy: `${e.createdBy.firstName} ${e.createdBy.lastName}`,
      totalMarks: Number(e.totalMarks),
      duration: e.duration,
      scheduledStartAt: e.scheduledStartAt,
      totalQuestions: e._count.examQuestions,
      totalStudents,
      avgPercentage: Math.round(Number(s?.avg ?? 0) * 100) / 100,
      passRate: totalStudents > 0 ? Math.round(((s?.passed ?? 0) / totalStudents) * 10000) / 100 : 0,
      createdAt: e.createdAt,
    };
  });

  return { exams: examList, total };
}

// ============================================
// Exam Detail (header info for principal)
// ============================================

export async function getExamDetail(examId: string) {
  const exam = await prisma.exam.findFirst({
    where: { id: examId, deletedAt: null },
    select: {
      id: true,
      title: true,
      description: true,
      type: true,
      status: true,
      totalMarks: true,
      passingMarks: true,
      duration: true,
      instructions: true,
      shuffleQuestions: true,
      allowReview: true,
      maxAttempts: true,
      scheduledStartAt: true,
      scheduledEndAt: true,
      createdAt: true,
      updatedAt: true,
      subject: { select: { id: true, name: true, code: true } },
      createdBy: { select: { id: true, firstName: true, lastName: true } },
      _count: { select: { examQuestions: true, examResults: true } },
      examClassAssignments: {
        select: {
          class: { select: { id: true, name: true } },
          section: { select: { id: true, name: true } },
        },
      },
    },
  });

  if (!exam) return null;

  return {
    ...exam,
    totalMarks: Number(exam.totalMarks),
    passingMarks: Number(exam.passingMarks),
  };
}

// ============================================
// Deep Analytics Queries
// ============================================

export async function getTeacherWiseAnalytics() {
  // SQL aggregate — no more loading ALL teachers×exams×results into JS
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
  // SQL aggregate — no more loading ALL classes×assignments×results into JS
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
  // SQL aggregate — no more loading ALL subjects×exams×results into JS
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
  // SQL aggregate instead of loading ALL rows into memory
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
  // Single SQL aggregate with JOIN — no full table scan into JS
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
