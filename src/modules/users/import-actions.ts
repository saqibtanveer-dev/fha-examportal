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

    // Check duplicate
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
