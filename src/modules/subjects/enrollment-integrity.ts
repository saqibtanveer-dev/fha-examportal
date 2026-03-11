'use server';

// ============================================
// Enrollment Integrity Checks — Admin-only
// Detects enrollment inconsistencies for elective subjects
// ============================================

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-utils';
import { safeAction } from '@/lib/safe-action';
import type { ActionResult } from '@/types/action-result';

type IntegrityIssue = {
  type: 'DUPLICATE_GROUP_ENROLLMENT' | 'ORPHANED_SLOT_GROUP' | 'MISSING_ENROLLMENT';
  description: string;
  entityIds: string[];
};

/**
 * Scan for elective enrollment integrity issues.
 * Admin-only. Returns list of detected issues.
 */
export const checkEnrollmentIntegrityAction = safeAction(
  async function checkEnrollmentIntegrityAction(): Promise<
    ActionResult<{ issues: IntegrityIssue[]; scannedAt: string }>
  > {
    await requireRole('ADMIN');

    const currentSession = await prisma.academicSession.findFirst({
      where: { isCurrent: true },
      select: { id: true },
    });
    if (!currentSession) {
      return { success: false, error: 'No active academic session' };
    }

    const issues: IntegrityIssue[] = [];

    // 1. Duplicate group enrollments — student enrolled in 2+ subjects from same elective group
    const electiveLinks = await prisma.subjectClassLink.findMany({
      where: { isElective: true, isActive: true, electiveGroupName: { not: null } },
      select: { subjectId: true, classId: true, electiveGroupName: true },
    });

    const groupsByClass = new Map<string, Map<string, string[]>>();
    for (const link of electiveLinks) {
      const key = link.classId;
      if (!groupsByClass.has(key)) groupsByClass.set(key, new Map());
      const groups = groupsByClass.get(key)!;
      const group = link.electiveGroupName!;
      if (!groups.has(group)) groups.set(group, []);
      groups.get(group)!.push(link.subjectId);
    }

    for (const [classId, groups] of groupsByClass) {
      for (const [groupName, subjectIds] of groups) {
        if (subjectIds.length < 2) continue;

        const enrollments = await prisma.studentSubjectEnrollment.findMany({
          where: {
            subjectId: { in: subjectIds },
            classId,
            academicSessionId: currentSession.id,
            isActive: true,
          },
          select: { studentProfileId: true, subjectId: true, id: true },
        });

        const byStudent = new Map<string, string[]>();
        for (const e of enrollments) {
          if (!byStudent.has(e.studentProfileId)) byStudent.set(e.studentProfileId, []);
          byStudent.get(e.studentProfileId)!.push(e.id);
        }

        for (const [studentId, enrollmentIds] of byStudent) {
          if (enrollmentIds.length > 1) {
            issues.push({
              type: 'DUPLICATE_GROUP_ENROLLMENT',
              description: `Student ${studentId} enrolled in ${enrollmentIds.length} subjects from group "${groupName}" in class ${classId}`,
              entityIds: enrollmentIds,
            });
          }
        }
      }
    }

    // 2. Orphaned ElectiveSlotGroups — groups with no timetable entries
    const allGroups = await prisma.electiveSlotGroup.findMany({
      select: { id: true, name: true, _count: { select: { entries: true } } },
    });
    for (const group of allGroups) {
      if (group._count.entries === 0) {
        issues.push({
          type: 'ORPHANED_SLOT_GROUP',
          description: `ElectiveSlotGroup "${group.name}" has no timetable entries`,
          entityIds: [group.id],
        });
      }
    }

    return {
      success: true,
      data: { issues, scannedAt: new Date().toISOString() },
    };
  },
);

/**
 * Clean up orphaned ElectiveSlotGroups (groups with no timetable entries).
 */
export const cleanupOrphanedSlotGroupsAction = safeAction(
  async function cleanupOrphanedSlotGroupsAction(): Promise<ActionResult<{ deleted: number }>> {
    await requireRole('ADMIN');

    // Find orphaned groups by checking entry count
    const groups = await prisma.electiveSlotGroup.findMany({
      select: { id: true, _count: { select: { entries: true } } },
    });
    const orphanedIds = groups.filter((g) => g._count.entries === 0).map((g) => g.id);

    if (orphanedIds.length === 0) {
      return { success: true, data: { deleted: 0 } };
    }

    const result = await prisma.electiveSlotGroup.deleteMany({
      where: { id: { in: orphanedIds } },
    });

    return { success: true, data: { deleted: result.count } };
  },
);
