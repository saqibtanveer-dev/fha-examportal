import { readFile } from 'node:fs/promises';
import XLSX from 'xlsx';

export type ImportRow = Record<string, string>;

function keyify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function asText(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

function pickSheetName(sheetNames: string[], preferred?: string, fallbackContains?: string[]): string {
  if (preferred && sheetNames.includes(preferred)) return preferred;
  if (fallbackContains) {
    for (const token of fallbackContains) {
      const found = sheetNames.find((name) => name.toLowerCase().includes(token.toLowerCase()));
      if (found) return found;
    }
  }
  if (sheetNames.length === 0) {
    throw new Error('Workbook has no sheets');
  }
  const first = sheetNames[0];
  if (!first) {
    throw new Error('Workbook has no sheets');
  }
  return first;
}

export async function readRowsFromWorkbook(
  filePath: string,
  options?: { preferredSheet?: string; fallbackContains?: string[] },
): Promise<{ sheetName: string; rows: ImportRow[] }> {
  const fileBuffer = await readFile(filePath);
  const workbook = XLSX.read(fileBuffer, {
    type: 'buffer',
    cellDates: true,
    dense: true,
  });

  const sheetName = pickSheetName(
    workbook.SheetNames,
    options?.preferredSheet,
    options?.fallbackContains,
  );

  const worksheet = workbook.Sheets[sheetName];
  if (!worksheet) {
    throw new Error(`Sheet not found: ${sheetName}`);
  }

  const matrix = XLSX.utils.sheet_to_json<(string | number | boolean | Date | null)[]>(worksheet, {
    header: 1,
    raw: false,
    defval: '',
    blankrows: false,
  });

  if (matrix.length === 0) {
    return { sheetName, rows: [] };
  }

  const headerRow = matrix[0] ?? [];
  const headers = headerRow.map((value) => keyify(asText(value))).filter(Boolean);
  const rows: ImportRow[] = [];

  for (let i = 1; i < matrix.length; i += 1) {
    const values = matrix[i] ?? [];
    const row: ImportRow = {};
    let hasData = false;

    for (let col = 0; col < headers.length; col += 1) {
      const header = headers[col];
      if (!header) continue;
      const value = asText(values[col] ?? '');
      row[header] = value;
      if (value) hasData = true;
    }

    if (hasData) rows.push(row);
  }

  return { sheetName, rows };
}
