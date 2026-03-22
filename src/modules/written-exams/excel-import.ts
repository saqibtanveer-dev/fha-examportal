'use client';

import ExcelJS from 'exceljs';

export type ParsedMarkEntry = {
  sessionId: string;
  examQuestionId: string;
  marksAwarded: number;
};

export type ImportParseResult = {
  examId: string;
  entries: ParsedMarkEntry[];
  absentSessionIds: string[];
  unmarkAbsentSessionIds: string[];
  studentCount: number;
  skippedAbsent: number;
  errors: string[];
};

const ABSENT_MARKERS = new Set(['ABS', 'AB', 'A']);

/**
 * Parse an Excel file exported by our template and extract marks entries.
 *
 * Reads the hidden __metadata sheet for exam/question/session ID mapping,
 * then reads marks from the main "Marks Entry" sheet.
 *
 * Returns structured data ready for the bulkEnterWrittenMarks server action.
 */
export async function parseMarksExcel(file: File): Promise<ImportParseResult> {
  const errors: string[] = [];
  const entries: ParsedMarkEntry[] = [];
  const absentSessionIds = new Set<string>();
  const unmarkAbsentSessionIds = new Set<string>();
  let examId = '';
  let skippedAbsent = 0;
  const touchedSessionIds = new Set<string>();

  const arrayBuffer = await file.arrayBuffer();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(arrayBuffer);

  // ── Read metadata sheet ──
  const metaSheet = workbook.getWorksheet('__metadata');
  if (!metaSheet) {
    return { examId: '', entries: [], absentSessionIds: [], unmarkAbsentSessionIds: [], studentCount: 0, skippedAbsent: 0, errors: ['Invalid file: metadata sheet not found. Use a template exported from this system.'] };
  }

  const version = metaSheet.getCell('B2').value?.toString();
  if (version !== '1') {
    return { examId: '', entries: [], absentSessionIds: [], unmarkAbsentSessionIds: [], studentCount: 0, skippedAbsent: 0, errors: ['Unsupported template version. Please export a fresh template.'] };
  }

  examId = metaSheet.getCell('B1').value?.toString() ?? '';
  if (!examId) {
    return { examId: '', entries: [], absentSessionIds: [], unmarkAbsentSessionIds: [], studentCount: 0, skippedAbsent: 0, errors: ['Invalid file: exam ID not found in metadata.'] };
  }

  // Build question mapping: column offset → { examQuestionId, maxMarks }
  const questionMap = new Map<number, { examQuestionId: string; maxMarks: number }>();
  let qRow = 5;
  while (true) {
    const offsetCell = metaSheet.getCell(qRow, 1).value;
    const idCell = metaSheet.getCell(qRow, 2).value;
    const maxCell = metaSheet.getCell(qRow, 3).value;
    if (offsetCell === null || offsetCell === undefined || !idCell) break;
    
    questionMap.set(
      Number(offsetCell),
      { examQuestionId: idCell.toString(), maxMarks: Number(maxCell) },
    );
    qRow++;
  }

  if (questionMap.size === 0) {
    return { examId, entries: [], absentSessionIds: [], unmarkAbsentSessionIds: [], studentCount: 0, skippedAbsent: 0, errors: ['No question mapping found in metadata.'] };
  }

  // Build session mapping: row offset → { sessionId, status }
  const sessionStartRow = 5 + questionMap.size + 2;
  const sessionMap = new Map<number, { sessionId: string; status: string }>();
  let sRow = sessionStartRow + 1;
  while (true) {
    const offsetCell = metaSheet.getCell(sRow, 1).value;
    const idCell = metaSheet.getCell(sRow, 2).value;
    const statusCell = metaSheet.getCell(sRow, 3).value;
    if (offsetCell === null || offsetCell === undefined || !idCell) break;

    sessionMap.set(
      Number(offsetCell),
      { sessionId: idCell.toString(), status: statusCell?.toString() ?? '' },
    );
    sRow++;
  }

  if (sessionMap.size === 0) {
    return { examId, entries: [], absentSessionIds: [], unmarkAbsentSessionIds: [], studentCount: 0, skippedAbsent: 0, errors: ['No session mapping found in metadata.'] };
  }

  // ── Read main marks sheet ──
  const marksSheet = workbook.getWorksheet('Marks Entry');
  if (!marksSheet) {
    return { examId, entries: [], absentSessionIds: [], unmarkAbsentSessionIds: [], studentCount: 0, skippedAbsent: 0, errors: ['Marks Entry sheet not found.'] };
  }

  // Data starts at row 5, iterate through each student row
  const dataStartRow = 5;
  const totalDataRows = sessionMap.size;

  for (let rowOffset = 0; rowOffset < totalDataRows; rowOffset++) {
    const excelRow = dataStartRow + rowOffset;
    const sessionInfo = sessionMap.get(rowOffset);
    if (!sessionInfo) continue;

    const studentName = marksSheet.getCell(excelRow, 2).value?.toString() ?? `Row ${excelRow}`;
    const rowEntries: ParsedMarkEntry[] = [];
    let hasNumericMarks = false;
    let absentMarkerCount = 0;
    let nonEmptyCount = 0;

    // Read each question column
    for (const [qOffset, qInfo] of questionMap) {
      const colNum = 4 + qOffset; // Questions start at column 4
      const cellValue = marksSheet.getCell(excelRow, colNum).value;

      // Skip empty cells
      if (cellValue === null || cellValue === undefined || cellValue === '') continue;

      // Handle formula results (SUM cells etc.)
      const rawValue = typeof cellValue === 'object' && 'result' in cellValue
        ? (cellValue as { result: unknown }).result
        : cellValue;

      if (rawValue === null || rawValue === undefined || rawValue === '') continue;

      nonEmptyCount++;

      const strVal = String(rawValue).trim().toUpperCase();
      if (ABSENT_MARKERS.has(strVal)) {
        absentMarkerCount++;
        continue;
      }

      const num = Number(rawValue);

      if (isNaN(num)) {
        errors.push(`${studentName}: Q${qOffset + 1} has invalid value "${rawValue}"`);
        continue;
      }

      if (num < 0) {
        errors.push(`${studentName}: Q${qOffset + 1} has negative marks (${num})`);
        continue;
      }

      if (num > qInfo.maxMarks) {
        errors.push(`${studentName}: Q${qOffset + 1} marks (${num}) exceed max (${qInfo.maxMarks})`);
        continue;
      }

      rowEntries.push({
        sessionId: sessionInfo.sessionId,
        examQuestionId: qInfo.examQuestionId,
        marksAwarded: num,
      });

      hasNumericMarks = true;
    }

    if (absentMarkerCount > 0 && hasNumericMarks) {
      errors.push(`${studentName}: Mixed absent markers and numeric marks in same row.`);
      continue;
    }

    if (absentMarkerCount > 0) {
      if (absentMarkerCount !== questionMap.size || nonEmptyCount !== questionMap.size) {
        errors.push(`${studentName}: To mark absent, fill all question cells with ABS.`);
        continue;
      }

      absentSessionIds.add(sessionInfo.sessionId);
      touchedSessionIds.add(sessionInfo.sessionId);
      if (sessionInfo.status === 'ABSENT') skippedAbsent++;
      continue;
    }

    if (hasNumericMarks) {
      for (const rowEntry of rowEntries) entries.push(rowEntry);
      touchedSessionIds.add(sessionInfo.sessionId);
      if (sessionInfo.status === 'ABSENT') {
        unmarkAbsentSessionIds.add(sessionInfo.sessionId);
      }
    }
  }

  if (entries.length === 0 && absentSessionIds.size === 0 && errors.length === 0) {
    errors.push('No import data found. Enter marks or ABS markers in the question columns.');
  }

  return {
    examId,
    entries,
    absentSessionIds: [...absentSessionIds],
    unmarkAbsentSessionIds: [...unmarkAbsentSessionIds],
    studentCount: touchedSessionIds.size,
    skippedAbsent,
    errors,
  };
}
