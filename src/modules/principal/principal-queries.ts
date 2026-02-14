import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

// ============================================
// Dashboard Overview Stats
// ============================================

export async function getPrincipalDashboardStats() {
  const [
    totalTeachers,
    totalStudents,
    totalClasses,
    totalSubjects,
    totalExams,
    totalResults,
    activeExams,
    pendingGrading,
  ] = await Promise.all([
    prisma.user.count({ where: { role: 'TEACHER', isActive: true, deletedAt: null } }),
    prisma.user.count({ where: { role: 'STUDENT', isActive: true, deletedAt: null } }),
    prisma.class.count({ where: { isActive: true } }),
    prisma.subject.count({ where: { isActive: true } }),
    prisma.exam.count({ where: { deletedAt: null } }),
    prisma.examResult.count(),
    prisma.exam.count({ where: { status: 'ACTIVE', deletedAt: null } }),
    prisma.examSession.count({ where: { status: { in: ['SUBMITTED', 'GRADING'] } } }),
  ]);

  const aggregates = await prisma.examResult.aggregate({
    _avg: { percentage: true },
  });

  const passedCount = await prisma.examResult.count({ where: { isPassed: true } });
  const overallPassRate = totalResults > 0 ? (passedCount / totalResults) * 100 : 0;
  const overallAvgPercentage = Number(aggregates._avg.percentage ?? 0);

  return {
    totalTeachers,
    totalStudents,
    totalClasses,
    totalSubjects,
    totalExams,
    totalResults,
    activeExams,
    pendingGrading,
    overallPassRate: Math.round(overallPassRate * 100) / 100,
    overallAvgPercentage: Math.round(overallAvgPercentage * 100) / 100,
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

  // Get exams created by this teacher
  const exams = await prisma.exam.findMany({
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
  });

  // Get question stats
  const questionStats = await prisma.question.groupBy({
    by: ['type'],
    where: { createdById: teacherUserId, deletedAt: null },
    _count: { _all: true },
  });

  // Get grading stats
  const gradingStats = await prisma.examSession.findMany({
    where: {
      exam: { createdById: teacherUserId },
      status: { in: ['SUBMITTED', 'GRADING', 'GRADED'] },
    },
    select: { status: true },
  });

  const pendingGrading = gradingStats.filter(
    (s) => s.status === 'SUBMITTED' || s.status === 'GRADING',
  ).length;
  const gradedCount = gradingStats.filter((s) => s.status === 'GRADED').length;

  // Get exam performance summary
  const examResults = await prisma.examResult.findMany({
    where: { exam: { createdById: teacherUserId } },
    select: { percentage: true, isPassed: true },
  });

  const totalResults = examResults.length;
  const passedResults = examResults.filter((r) => r.isPassed).length;
  const avgPercentage =
    totalResults > 0
      ? examResults.reduce((sum, r) => sum + Number(r.percentage), 0) / totalResults
      : 0;

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
      avgPercentage: Math.round(avgPercentage * 100) / 100,
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
        examResults: {
          select: { percentage: true },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  const students: StudentListItem[] = users
    .filter((u) => u.studentProfile)
    .map((u) => {
      const results = u.examResults;
      const avgPercentage =
        results.length > 0
          ? results.reduce((sum, r) => sum + Number(r.percentage), 0) / results.length
          : 0;

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
        examsTaken: results.length,
        avgPercentage: Math.round(avgPercentage * 100) / 100,
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

  // Get all exam results with details
  const results = await prisma.examResult.findMany({
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
  });

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

  // Exam sessions (including in-progress)
  const sessions = await prisma.examSession.findMany({
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
  });

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
      students: { select: { userId: true } },
      examClassAssignments: {
        select: {
          exam: {
            select: {
              id: true,
              examResults: { select: { percentage: true, isPassed: true } },
            },
          },
        },
      },
    },
  });

  return classes.map((cls) => {
    const allResults = cls.examClassAssignments.flatMap((eca) => eca.exam.examResults);
    const total = allResults.length;
    const passed = allResults.filter((r) => r.isPassed).length;
    const avgPercentage =
      total > 0
        ? allResults.reduce((sum, r) => sum + Number(r.percentage), 0) / total
        : 0;

    const uniqueExamIds = new Set(cls.examClassAssignments.map((eca) => eca.exam.id));

    return {
      id: cls.id,
      name: cls.name,
      grade: cls.grade,
      isActive: cls.isActive,
      totalStudents: cls.students.length,
      totalSections: cls.sections.length,
      sectionNames: cls.sections.map((s) => s.name),
      totalExams: uniqueExamIds.size,
      avgPercentage: Math.round(avgPercentage * 100) / 100,
      passRate: total > 0 ? Math.round((passed / total) * 10000) / 100 : 0,
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

  // Get exam results for students in this class
  const results = await prisma.examResult.findMany({
    where: { studentId: { in: studentUserIds } },
    select: {
      studentId: true,
      percentage: true,
      isPassed: true,
      exam: { select: { id: true, title: true, type: true, subject: { select: { name: true } } } },
    },
  });

  // Get exams assigned to this class
  const assignedExams = await prisma.examClassAssignment.findMany({
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
          examResults: { select: { percentage: true, isPassed: true } },
        },
      },
    },
  });

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
    assignedExams: assignedExams.map((ae) => ({
      ...ae.exam,
      totalMarks: Number(ae.exam.totalMarks),
      resultsCount: ae.exam.examResults.length,
      avgPercentage:
        ae.exam.examResults.length > 0
          ? Math.round(
              (ae.exam.examResults.reduce((s, r) => s + Number(r.percentage), 0) /
                ae.exam.examResults.length) *
                100,
            ) / 100
          : 0,
      passRate:
        ae.exam.examResults.length > 0
          ? Math.round(
              (ae.exam.examResults.filter((r) => r.isPassed).length / ae.exam.examResults.length) *
                10000,
            ) / 100
          : 0,
    })),
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
        examResults: { select: { percentage: true, isPassed: true } },
      },
    }),
    prisma.exam.count({ where }),
  ]);

  const examList: ExamListItem[] = exams.map((e) => {
    const total = e.examResults.length;
    const passed = e.examResults.filter((r) => r.isPassed).length;
    const avgPct =
      total > 0
        ? e.examResults.reduce((s, r) => s + Number(r.percentage), 0) / total
        : 0;

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
      totalStudents: total,
      avgPercentage: Math.round(avgPct * 100) / 100,
      passRate: total > 0 ? Math.round((passed / total) * 10000) / 100 : 0,
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
  const teachers = await prisma.user.findMany({
    where: { role: 'TEACHER', deletedAt: null, isActive: true },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      _count: {
        select: {
          examsCreated: { where: { deletedAt: null } },
          questions: { where: { deletedAt: null } },
        },
      },
      examsCreated: {
        where: { deletedAt: null },
        select: {
          examResults: { select: { percentage: true, isPassed: true } },
        },
      },
    },
  });

  return teachers.map((t) => {
    const allResults = t.examsCreated.flatMap((e) => e.examResults);
    const total = allResults.length;
    const passed = allResults.filter((r) => r.isPassed).length;
    const avgPct =
      total > 0
        ? allResults.reduce((s, r) => s + Number(r.percentage), 0) / total
        : 0;

    return {
      teacherId: t.id,
      teacherName: `${t.firstName} ${t.lastName}`,
      examsCreated: t._count.examsCreated,
      questionsCreated: t._count.questions,
      totalResults: total,
      avgPercentage: Math.round(avgPct * 100) / 100,
      passRate: total > 0 ? Math.round((passed / total) * 10000) / 100 : 0,
    };
  });
}

export async function getClassWiseAnalytics() {
  const classes = await prisma.class.findMany({
    where: { isActive: true },
    orderBy: { grade: 'asc' },
    select: {
      id: true,
      name: true,
      grade: true,
      students: { select: { userId: true } },
      examClassAssignments: {
        select: {
          exam: {
            select: {
              examResults: { select: { percentage: true, isPassed: true } },
            },
          },
        },
      },
    },
  });

  return classes.map((cls) => {
    const allResults = cls.examClassAssignments.flatMap((e) => e.exam.examResults);
    const total = allResults.length;
    const passed = allResults.filter((r) => r.isPassed).length;
    const avgPct =
      total > 0
        ? allResults.reduce((s, r) => s + Number(r.percentage), 0) / total
        : 0;

    return {
      classId: cls.id,
      className: cls.name,
      grade: cls.grade,
      totalStudents: cls.students.length,
      totalResults: total,
      avgPercentage: Math.round(avgPct * 100) / 100,
      passRate: total > 0 ? Math.round((passed / total) * 10000) / 100 : 0,
    };
  });
}

export async function getSubjectWiseAnalytics() {
  const subjects = await prisma.subject.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      code: true,
      department: { select: { name: true } },
      exams: {
        where: { deletedAt: null },
        select: {
          examResults: { select: { percentage: true, isPassed: true } },
        },
      },
    },
  });

  return subjects.map((sub) => {
    const allResults = sub.exams.flatMap((e) => e.examResults);
    const total = allResults.length;
    const passed = allResults.filter((r) => r.isPassed).length;
    const avgPct =
      total > 0
        ? allResults.reduce((s, r) => s + Number(r.percentage), 0) / total
        : 0;

    return {
      subjectId: sub.id,
      subjectName: sub.name,
      subjectCode: sub.code,
      department: sub.department.name,
      totalExams: sub.exams.length,
      totalResults: total,
      avgPercentage: Math.round(avgPct * 100) / 100,
      passRate: total > 0 ? Math.round((passed / total) * 10000) / 100 : 0,
    };
  });
}

export async function getPerformanceTrends() {
  // Get results grouped by month
  const results = await prisma.examResult.findMany({
    select: {
      percentage: true,
      isPassed: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  const byMonth: Record<string, { sum: number; total: number; passed: number }> = {};
  for (const r of results) {
    const month = r.createdAt.toISOString().slice(0, 7); // YYYY-MM
    if (!byMonth[month]) byMonth[month] = { sum: 0, total: 0, passed: 0 };
    byMonth[month]!.sum += Number(r.percentage);
    byMonth[month]!.total += 1;
    if (r.isPassed) byMonth[month]!.passed += 1;
  }

  return Object.entries(byMonth)
    .map(([month, data]) => ({
      month,
      avgPercentage: Math.round((data.sum / data.total) * 100) / 100,
      passRate: Math.round((data.passed / data.total) * 10000) / 100,
      totalExams: data.total,
    }))
    .sort((a, b) => a.month.localeCompare(b.month));
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

export async function getTopPerformingStudents(limit = 10) {
  const students = await prisma.user.findMany({
    where: { role: 'STUDENT', deletedAt: null, isActive: true },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      studentProfile: {
        select: {
          rollNumber: true,
          class: { select: { name: true } },
          section: { select: { name: true } },
        },
      },
      examResults: {
        select: { percentage: true, isPassed: true },
      },
    },
  });

  return students
    .filter((s) => s.examResults.length > 0)
    .map((s) => {
      const totalResults = s.examResults.length;
      const avgPct = s.examResults.reduce((sum, r) => sum + Number(r.percentage), 0) / totalResults;
      const passed = s.examResults.filter((r) => r.isPassed).length;

      return {
        studentId: s.id,
        studentName: `${s.firstName} ${s.lastName}`,
        rollNumber: s.studentProfile?.rollNumber ?? '',
        className: s.studentProfile?.class.name ?? '',
        section: s.studentProfile?.section.name ?? '',
        examsTaken: totalResults,
        avgPercentage: Math.round(avgPct * 100) / 100,
        passRate: Math.round((passed / totalResults) * 10000) / 100,
      };
    })
    .sort((a, b) => b.avgPercentage - a.avgPercentage)
    .slice(0, limit);
}

export async function getBottomPerformingStudents(limit = 10) {
  const students = await prisma.user.findMany({
    where: { role: 'STUDENT', deletedAt: null, isActive: true },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      studentProfile: {
        select: {
          rollNumber: true,
          class: { select: { name: true } },
          section: { select: { name: true } },
        },
      },
      examResults: {
        select: { percentage: true, isPassed: true },
      },
    },
  });

  return students
    .filter((s) => s.examResults.length > 0)
    .map((s) => {
      const totalResults = s.examResults.length;
      const avgPct = s.examResults.reduce((sum, r) => sum + Number(r.percentage), 0) / totalResults;
      const passed = s.examResults.filter((r) => r.isPassed).length;

      return {
        studentId: s.id,
        studentName: `${s.firstName} ${s.lastName}`,
        rollNumber: s.studentProfile?.rollNumber ?? '',
        className: s.studentProfile?.class.name ?? '',
        section: s.studentProfile?.section.name ?? '',
        examsTaken: totalResults,
        avgPercentage: Math.round(avgPct * 100) / 100,
        passRate: Math.round((passed / totalResults) * 10000) / 100,
      };
    })
    .sort((a, b) => a.avgPercentage - b.avgPercentage)
    .slice(0, limit);
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
