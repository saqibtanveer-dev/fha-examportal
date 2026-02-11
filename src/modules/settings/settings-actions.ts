'use server';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-utils';
import { revalidatePath } from 'next/cache';
import { z } from 'zod/v4';

type ActionResult = { success: boolean; error?: string };

const updateSettingsSchema = z.object({
  schoolName: z.string().min(1).max(200),
  academicYear: z.string().min(4).max(20),
  address: z.string().max(500).optional(),
  phone: z.string().max(30).optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional().or(z.literal('')),
  schoolLogo: z.string().url().optional().or(z.literal('')),
});

export async function updateSettingsAction(input: unknown): Promise<ActionResult> {
  await requireRole('ADMIN');

  const parsed = updateSettingsSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message };

  const existing = await prisma.schoolSettings.findFirst();
  if (!existing) {
    await prisma.schoolSettings.create({ data: { ...parsed.data, gradingScale: {} } });
  } else {
    await prisma.schoolSettings.update({
      where: { id: existing.id },
      data: parsed.data,
    });
  }

  revalidatePath('/admin/settings');
  return { success: true };
}
