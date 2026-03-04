import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

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

  const [results, sessions] = await Promise.all([
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

  const totalExams = results.length;
  const passedExams = results.filter((r) => r.isPassed).length;
  const avgPercentage =
    totalExams > 0
      ? results.reduce((sum, r) => sum + Number(r.percentage), 0) / totalExams
      : 0;
  const highestPercentage =
    totalExams > 0 ? Math.max(...results.map((r) => Number(r.percentage))) : 0;
  const lowestPercentage =
    totalExams > 0 ? Math.min(...results.map((r) => Number(r.percentage))) : 0;

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
