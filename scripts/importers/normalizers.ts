import type { Class, Section } from '@prisma/client';
import type { ImportRow } from './excel-reader';

export function firstValue(row: ImportRow, aliases: string[]): string {
  for (const alias of aliases) {
    const value = (row[alias] ?? '').trim();
    if (value) return value;
  }
  return '';
}

export function parseList(value: string): string[] {
  if (!value) return [];
  return value
    .split(/[;,|]/g)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function splitName(fullName: string): { firstName: string; lastName: string } {
  const cleaned = fullName.trim().replace(/\s+/g, ' ');
  if (!cleaned) return { firstName: '', lastName: '' };
  const parts = cleaned.split(' ');
  const firstName = parts.shift() ?? '';
  const lastName = parts.join(' ').trim() || '-';
  return { firstName, lastName };
}

export function toEmailSafeLocal(value: string): string {
  const local = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return local || 'imported-user';
}

export function keyify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

export function resolveClassId(rawClass: string, classes: Array<Pick<Class, 'id' | 'name' | 'grade'>>): string | null {
  const normalized = keyify(rawClass);
  if (!normalized) return null;

  const byName = classes.find((c) => keyify(c.name) === normalized);
  if (byName) return byName.id;

  const gradeMatch = normalized.match(/(?:g|grade|class)_?(\d{1,2})/);
  if (gradeMatch) {
    const grade = Number(gradeMatch[1]);
    const byGrade = classes.find((c) => c.grade === grade);
    if (byGrade) return byGrade.id;
  }

  if (normalized.includes('kg') || normalized.includes('prep')) {
    const byKgName = classes.find((c) => {
      const name = keyify(c.name);
      return name.includes('kg') || name.includes('prep') || name.includes('k_g');
    });
    if (byKgName) return byKgName.id;
  }

  return null;
}

export function resolveSectionId(
  classId: string,
  rawSection: string,
  sections: Array<Pick<Section, 'id' | 'name' | 'classId'>>,
): string | null {
  const classSections = sections.filter((s) => s.classId === classId);
  if (classSections.length === 0) return null;

  const normalized = keyify(rawSection);
  if (normalized) {
    const exact = classSections.find((s) => keyify(s.name) === normalized);
    if (exact) return exact.id;

    const boysGirls = classSections.find((s) => {
      const key = keyify(s.name);
      return (normalized.includes('boy') && key.includes('boy')) || (normalized.includes('girl') && key.includes('girl'));
    });
    if (boysGirls) return boysGirls.id;
  }

  return classSections[0]?.id ?? null;
}
