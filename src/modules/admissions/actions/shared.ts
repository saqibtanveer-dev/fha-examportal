/**
 * Shared utilities for admission actions.
 */

import { prisma } from '@/lib/prisma';

/** Fetch school branding (name + color) for email templates. */
export async function getSchoolBranding() {
  const settings = await prisma.schoolSettings.findFirst();
  return { schoolName: settings?.schoolName ?? 'ExamCore', primaryColor: '#2563eb' };
}
