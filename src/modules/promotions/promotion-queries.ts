import { prisma } from '@/lib/prisma';

// ============================================
// Get students grouped by class for promotion view
// ============================================

export type ClassWithStudents = {
  id: string;
  name: string;
  grade: number;
  sections: { id: string; name: string }[];
  students: {
    profileId: string;
    userId: string;
    firstName: string;
    lastName: string;
    rollNumber: string;
    registrationNo: string;
    sectionId: string;
    sectionName: string;
    status: string;
  }[];
  studentCount: number;
};

export async function getClassesWithActiveStudents(): Promise<ClassWithStudents[]> {
  const classes = await prisma.class.findMany({
    where: { isActive: true },
    orderBy: { grade: 'asc' },
    include: {
      sections: {
        where: { isActive: true },
        orderBy: { name: 'asc' },
      },
      students: {
        where: { status: 'ACTIVE' },
        include: {
          user: { select: { firstName: true, lastName: true } },
          section: { select: { name: true } },
        },
        orderBy: { rollNumber: 'asc' },
      },
    },
  });

  return classes.map((cls) => ({
    id: cls.id,
    name: cls.name,
    grade: cls.grade,
    sections: cls.sections.map((s) => ({ id: s.id, name: s.name })),
    students: cls.students.map((sp) => ({
      profileId: sp.id,
      userId: sp.userId,
      firstName: sp.user.firstName,
      lastName: sp.user.lastName,
      rollNumber: sp.rollNumber,
      registrationNo: sp.registrationNo,
      sectionId: sp.sectionId,
      sectionName: sp.section.name,
      status: sp.status,
    })),
    studentCount: cls.students.length,
  }));
}

// ============================================
// Get next class for promotion (grade + 1)
// ============================================

export async function getNextClass(currentGrade: number) {
  return prisma.class.findFirst({
    where: { grade: currentGrade + 1, isActive: true },
    include: {
      sections: {
        where: { isActive: true },
        orderBy: { name: 'asc' },
      },
    },
  });
}

// ============================================
// Promotion History
// ============================================

export async function getPromotionHistory(academicSessionId?: string) {
  return prisma.studentPromotion.findMany({
    where: academicSessionId ? { academicSessionId } : undefined,
    orderBy: { promotedAt: 'desc' },
    include: {
      studentProfile: {
        include: { user: { select: { firstName: true, lastName: true, email: true } } },
      },
      fromClass: { select: { name: true, grade: true } },
      fromSection: { select: { name: true } },
      toClass: { select: { name: true, grade: true } },
      toSection: { select: { name: true } },
      academicSession: { select: { name: true } },
      promotedBy: { select: { firstName: true, lastName: true } },
    },
    take: 200,
  });
}

// ============================================
// Check if year transition already done for session
// ============================================

export async function isTransitionDone(academicSessionId: string): Promise<boolean> {
  const count = await prisma.studentPromotion.count({
    where: { academicSessionId },
  });
  return count > 0;
}

// ============================================
// Get promotion summary for a session
// ============================================

export async function getPromotionSummary(academicSessionId: string) {
  const promotions = await prisma.studentPromotion.groupBy({
    by: ['status'],
    where: { academicSessionId },
    _count: { id: true },
  });

  return promotions.reduce(
    (acc, p) => {
      acc[p.status] = p._count.id;
      acc.total = (acc.total ?? 0) + p._count.id;
      return acc;
    },
    { PROMOTED: 0, GRADUATED: 0, HELD_BACK: 0, total: 0 } as Record<string, number>,
  );
}
