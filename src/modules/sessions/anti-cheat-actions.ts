'use server';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-utils';
import type { ActionResult } from '@/types/action-result';

const TAB_SWITCH_FLAG_THRESHOLD = 5;

type ViolationType = 'TAB_SWITCH' | 'FULLSCREEN_EXIT' | 'COPY_PASTE';

/**
 * Log an anti-cheat violation and increment the counter.
 * Auto-flags the session if tab switches exceed threshold.
 */
export async function logAntiCheatViolationAction(
  sessionId: string,
  type: ViolationType,
): Promise<ActionResult> {
  const authSession = await requireRole('STUDENT');

  const session = await prisma.examSession.findUnique({
    where: { id: sessionId },
    select: { id: true, status: true, studentId: true },
  });

  if (!session || session.status !== 'IN_PROGRESS') {
    return { success: false, error: 'Session not active' };
  }

  // Verify student owns this session
  if (session.studentId !== authSession.user.id) {
    return { success: false, error: 'Access denied' };
  }

  const updateData: Record<string, unknown> = {};

  switch (type) {
    case 'TAB_SWITCH':
      updateData.tabSwitchCount = { increment: 1 };
      break;
    case 'FULLSCREEN_EXIT':
      updateData.fullscreenExits = { increment: 1 };
      break;
    case 'COPY_PASTE':
      updateData.copyPasteAttempts = { increment: 1 };
      break;
  }

  const updated = await prisma.examSession.update({
    where: { id: sessionId },
    data: updateData,
    select: { tabSwitchCount: true },
  });

  // Auto-flag if too many tab switches
  if (type === 'TAB_SWITCH' && updated.tabSwitchCount >= TAB_SWITCH_FLAG_THRESHOLD) {
    await prisma.examSession.update({
      where: { id: sessionId },
      data: { isFlagged: true },
    });
  }

  return { success: true };
}
