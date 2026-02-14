'use server';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-utils';
import { createAuditLog } from '@/modules/audit/audit-queries';
import bcrypt from 'bcryptjs';
import type { ActionResult } from '@/types/action-result';

type CsvUser = {
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  phone?: string;
  password?: string;
  // Student profile fields
  classId?: string;
  sectionId?: string;
  rollNumber?: string;
  registrationNo?: string;
  guardianName?: string;
  guardianPhone?: string;
  // Teacher profile fields
  employeeId?: string;
  qualification?: string;
  specialization?: string;
};

type ImportResult = {
  total: number;
  created: number;
  skipped: number;
  errors: { row: number; email: string; error: string }[];
};

const VALID_ROLES = ['ADMIN', 'TEACHER', 'STUDENT'];
const DEFAULT_PASSWORD = 'Temp@1234';

/**
 * Import users from CSV data.
 * Expected columns: email, firstName, lastName, role, phone (optional), password (optional)
 * For STUDENT: classId, sectionId, rollNumber, registrationNo (required)
 * For TEACHER: employeeId (required)
 */
export async function importUsersFromCsvAction(
  csvRows: CsvUser[],
): Promise<ActionResult<ImportResult>> {
  const session = await requireRole('ADMIN');

  const result: ImportResult = {
    total: csvRows.length,
    created: 0,
    skipped: 0,
    errors: [],
  };

  for (let i = 0; i < csvRows.length; i++) {
    const row = csvRows[i]!;
    const rowNum = i + 1;

    // Validate required fields
    if (!row.email || !row.firstName || !row.lastName || !row.role) {
      result.errors.push({
        row: rowNum,
        email: row.email ?? '',
        error: 'Missing required fields (email, firstName, lastName, role)',
      });
      continue;
    }

    // Validate role
    const role = row.role.toUpperCase();
    if (!VALID_ROLES.includes(role)) {
      result.errors.push({
        row: rowNum,
        email: row.email,
        error: `Invalid role: ${row.role}. Must be ADMIN, TEACHER, or STUDENT`,
      });
      continue;
    }

    // Validate student-specific required fields
    if (role === 'STUDENT') {
      if (!row.classId || !row.sectionId || !row.rollNumber || !row.registrationNo) {
        result.errors.push({
          row: rowNum,
          email: row.email,
          error: 'Students require classId, sectionId, rollNumber, and registrationNo',
        });
        continue;
      }
      // Check registration number uniqueness
      const existingProfile = await prisma.studentProfile.findUnique({
        where: { registrationNo: row.registrationNo },
      });
      if (existingProfile) {
        result.errors.push({
          row: rowNum,
          email: row.email,
          error: `Registration number ${row.registrationNo} already exists`,
        });
        continue;
      }
    }

    // Validate teacher-specific required fields
    if (role === 'TEACHER') {
      if (!row.employeeId) {
        result.errors.push({
          row: rowNum,
          email: row.email,
          error: 'Teachers require employeeId',
        });
        continue;
      }
      const existingTeacher = await prisma.teacherProfile.findUnique({
        where: { employeeId: row.employeeId },
      });
      if (existingTeacher) {
        result.errors.push({
          row: rowNum,
          email: row.email,
          error: `Employee ID ${row.employeeId} already exists`,
        });
        continue;
      }
    }

    // Check duplicate email
    const existing = await prisma.user.findUnique({
      where: { email: row.email.toLowerCase() },
    });

    if (existing) {
      result.skipped++;
      continue;
    }

    try {
      const passwordHash = await bcrypt.hash(row.password ?? DEFAULT_PASSWORD, 12);

      await prisma.user.create({
        data: {
          email: row.email.toLowerCase(),
          firstName: row.firstName.trim(),
          lastName: row.lastName.trim(),
          role: role as 'ADMIN' | 'TEACHER' | 'STUDENT',
          phone: row.phone?.trim() || null,
          passwordHash,
          // Create StudentProfile for students
          ...(role === 'STUDENT' && row.classId && row.sectionId && row.rollNumber && row.registrationNo
            ? {
                studentProfile: {
                  create: {
                    classId: row.classId.trim(),
                    sectionId: row.sectionId.trim(),
                    rollNumber: row.rollNumber.trim(),
                    registrationNo: row.registrationNo.trim(),
                    guardianName: row.guardianName?.trim() || null,
                    guardianPhone: row.guardianPhone?.trim() || null,
                  },
                },
              }
            : {}),
          // Create TeacherProfile for teachers
          ...(role === 'TEACHER' && row.employeeId
            ? {
                teacherProfile: {
                  create: {
                    employeeId: row.employeeId.trim(),
                    qualification: row.qualification?.trim() || null,
                    specialization: row.specialization?.trim() || null,
                  },
                },
              }
            : {}),
        },
      });

      result.created++;
    } catch (err) {
      result.errors.push({
        row: rowNum,
        email: row.email,
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  }

  createAuditLog(session.user.id, 'BULK_IMPORT_USERS', 'USER', 'bulk', {
    total: result.total,
    created: result.created,
    skipped: result.skipped,
    errorCount: result.errors.length,
  }).catch(() => {});

  return { success: true, data: result };
}
