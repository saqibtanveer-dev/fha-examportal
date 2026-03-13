type SharedDutyContext = {
  classId: string;
  subjectId: string;
  room?: string | null;
  isElective: boolean;
  electiveGroupName: string | null;
};

function normalizeRoom(room?: string | null): string {
  return (room ?? '').trim().toLowerCase();
}

/**
 * A teacher can be assigned to overlapping duties only for the same elective delivery
 * in the same room across multiple sections.
 */
export function isSharedDutyCompatible(existing: SharedDutyContext, candidate: SharedDutyContext): boolean {
  if (!existing.isElective || !candidate.isElective) return false;
  if (!existing.electiveGroupName || !candidate.electiveGroupName) return false;

  const existingRoom = normalizeRoom(existing.room);
  const candidateRoom = normalizeRoom(candidate.room);
  if (!existingRoom || !candidateRoom || existingRoom !== candidateRoom) return false;

  return (
    existing.classId === candidate.classId
    && existing.subjectId === candidate.subjectId
    && existing.electiveGroupName === candidate.electiveGroupName
  );
}
