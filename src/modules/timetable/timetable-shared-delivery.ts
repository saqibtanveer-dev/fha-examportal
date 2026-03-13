export type TeacherSlotAssignment = {
  classId: string;
  sectionId: string;
  subjectId: string;
  room?: string | null;
  isElectiveSlot: boolean;
};

function normalizeRoom(room?: string | null): string {
  return (room ?? '').trim().toLowerCase();
}

/**
 * Two assignments are compatible only when they represent the same elective delivery
 * shared across multiple sections at the same slot.
 */
export function isSharedElectiveDeliveryCompatible(
  existing: TeacherSlotAssignment,
  candidate: TeacherSlotAssignment,
): boolean {
  if (!existing.isElectiveSlot || !candidate.isElectiveSlot) return false;

  const existingRoom = normalizeRoom(existing.room);
  const candidateRoom = normalizeRoom(candidate.room);
  if (!existingRoom || !candidateRoom || existingRoom !== candidateRoom) return false;

  return (
    existing.classId === candidate.classId
    && existing.subjectId === candidate.subjectId
    && existing.sectionId !== candidate.sectionId
  );
}
