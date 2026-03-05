'use client';

import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import type { DeepSerialize } from '@/utils/serialize';
import type { WrittenExamMarkEntryData } from './written-exam-queries';

type ExamData = DeepSerialize<WrittenExamMarkEntryData>;

const HEADER_FILL: ExcelJS.Fill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FF1E3A5F' },
};
const HEADER_FONT: Partial<ExcelJS.Font> = {
  bold: true,
  color: { argb: 'FFFFFFFF' },
  size: 11,
};
const SUBHEADER_FILL: ExcelJS.Fill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FFE8EEF4' },
};
const THIN_BORDER: Partial<ExcelJS.Border> = { style: 'thin', color: { argb: 'FFD0D5DD' } };
const ALL_BORDERS: Partial<ExcelJS.Borders> = {
  top: THIN_BORDER,
  left: THIN_BORDER,
  bottom: THIN_BORDER,
  right: THIN_BORDER,
};

/**
 * Export a ready-to-fill Excel template for written exam marks entry.
 *
 * Layout:
 * Row 1: Exam info header (merged)
 * Row 2: Subject | Total Marks | Passing Marks (merged cells)
 * Row 3: Empty spacer
 * Row 4: Column headers — Roll # | Student Name | Class | Q1 (/5) | Q2 (/10) | ... | Total
 * Row 5+: Student data rows — pre-filled info, empty marks cells with data validation
 *
 * Hidden metadata sheet stores IDs for import mapping.
 */
export async function exportMarksTemplate(data: ExamData) {
  const { exam, questions, sessions } = data;
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'School Portal';
  workbook.created = new Date();

  // ── Main Sheet ──
  const sheet = workbook.addWorksheet('Marks Entry', {
    views: [{ state: 'frozen', ySplit: 4, xSplit: 3 }],
  });

  const questionCount = questions.length;
  const totalCols = 3 + questionCount + 1; // Roll, Name, Class, Q1..Qn, Total

  // Row 1: Exam title
  sheet.mergeCells(1, 1, 1, totalCols);
  const titleCell = sheet.getCell(1, 1);
  titleCell.value = exam.title;
  titleCell.font = { bold: true, size: 14, color: { argb: 'FF1E3A5F' } };
  titleCell.alignment = { horizontal: 'left', vertical: 'middle' };
  sheet.getRow(1).height = 30;

  // Row 2: Metadata
  sheet.mergeCells(2, 1, 2, 3);
  const subjectCell = sheet.getCell(2, 1);
  subjectCell.value = `Subject: ${exam.subject.name}`;
  subjectCell.font = { size: 10, color: { argb: 'FF6B7280' } };

  if (totalCols >= 5) {
    sheet.mergeCells(2, 4, 2, Math.min(5, totalCols));
    const marksCell = sheet.getCell(2, 4);
    marksCell.value = `Total: ${exam.totalMarks} | Pass: ${exam.passingMarks}`;
    marksCell.font = { size: 10, color: { argb: 'FF6B7280' } };
  }
  sheet.getRow(2).height = 20;

  // Row 3: Spacer
  sheet.getRow(3).height = 8;

  // Row 4: Column headers
  const headerRow = sheet.getRow(4);
  headerRow.height = 36;

  const headers = [
    { header: 'Roll #', width: 10 },
    { header: 'Student Name', width: 28 },
    { header: 'Class', width: 14 },
    ...questions.map((q, i) => ({
      header: `Q${i + 1} (/${q.marks})`,
      width: 12,
    })),
    { header: 'Total', width: 12 },
  ];

  headers.forEach((h, idx) => {
    const col = idx + 1;
    const cell = headerRow.getCell(col);
    cell.value = h.header;
    cell.font = HEADER_FONT;
    cell.fill = HEADER_FILL;
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border = ALL_BORDERS;
    sheet.getColumn(col).width = h.width;
  });

  // Row 5+: Student data rows
  const nonAbsentSessions = sessions.filter((s) => s.status !== 'ABSENT');
  const absentSessions = sessions.filter((s) => s.status === 'ABSENT');

  const allSorted = [...nonAbsentSessions, ...absentSessions];
  let rowIndex = 5;

  for (const session of allSorted) {
    const row = sheet.getRow(rowIndex);
    const isAbsent = session.status === 'ABSENT';
    const isEvenRow = (rowIndex - 5) % 2 === 0;
    const rowFill: ExcelJS.Fill | undefined = isAbsent
      ? { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF0F0' } }
      : isEvenRow
        ? { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } }
        : undefined;

    // Roll #
    const rollCell = row.getCell(1);
    rollCell.value = session.student.rollNumber || '—';
    rollCell.alignment = { horizontal: 'center', vertical: 'middle' };
    rollCell.border = ALL_BORDERS;
    rollCell.font = { size: 10 };
    if (rowFill) rollCell.fill = rowFill;

    // Student Name
    const nameCell = row.getCell(2);
    nameCell.value = `${session.student.firstName} ${session.student.lastName}`;
    nameCell.alignment = { vertical: 'middle' };
    nameCell.border = ALL_BORDERS;
    nameCell.font = { size: 10, bold: true };
    if (rowFill) nameCell.fill = rowFill;

    // Class
    const classCell = row.getCell(3);
    classCell.value = session.student.className
      ? `${session.student.className}${session.student.sectionName ? `-${session.student.sectionName}` : ''}`
      : '—';
    classCell.alignment = { horizontal: 'center', vertical: 'middle' };
    classCell.border = ALL_BORDERS;
    classCell.font = { size: 10 };
    if (rowFill) classCell.fill = rowFill;

    // Question marks columns
    for (let qi = 0; qi < questionCount; qi++) {
      const question = questions[qi]!;
      const colNum = 4 + qi;
      const cell = row.getCell(colNum);
      let hasMark = false;

      if (isAbsent) {
        cell.value = 'ABS';
        cell.font = { size: 10, italic: true, color: { argb: 'FFDC2626' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      } else {
        const answer = session.answers.find(
          (a) => a.examQuestionId === question.examQuestionId,
        );
        const existing = answer?.grade?.marksAwarded;
        if (existing !== null && existing !== undefined) {
          cell.value = existing;
          hasMark = true;
        }
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.font = { size: 11 };

        // Data validation: 0 to max marks
        cell.dataValidation = {
          type: 'decimal',
          operator: 'between',
          formulae: [0, question.marks],
          showErrorMessage: true,
          errorTitle: 'Invalid Marks',
          error: `Enter a value between 0 and ${question.marks}`,
          showInputMessage: true,
          promptTitle: `Q${qi + 1}`,
          prompt: `Max marks: ${question.marks}`,
        };
      }

      cell.border = ALL_BORDERS;
      if (rowFill) cell.fill = rowFill;

      // Highlight empty mark entry cells
      if (!isAbsent && !hasMark) {
        cell.fill = SUBHEADER_FILL;
      }
    }

    // Total formula (auto-sum of question columns)
    const totalColNum = 4 + questionCount;
    const totalCell = row.getCell(totalColNum);
    if (isAbsent) {
      totalCell.value = 'ABS';
      totalCell.font = { size: 10, italic: true, color: { argb: 'FFDC2626' } };
    } else {
      const firstQCol = getExcelCol(4);
      const lastQCol = getExcelCol(3 + questionCount);
      totalCell.value = { formula: `SUM(${firstQCol}${rowIndex}:${lastQCol}${rowIndex})` };
      totalCell.font = { bold: true, size: 11 };
    }
    totalCell.alignment = { horizontal: 'center', vertical: 'middle' };
    totalCell.border = ALL_BORDERS;
    if (rowFill) totalCell.fill = rowFill;

    row.height = 24;
    rowIndex++;
  }

  // Protect info columns (1-3) from editing but allow mark columns
  sheet.getColumn(1).eachCell((cell, rowNum) => {
    if (rowNum >= 5) cell.protection = { locked: true };
  });
  sheet.getColumn(2).eachCell((cell, rowNum) => {
    if (rowNum >= 5) cell.protection = { locked: true };
  });
  sheet.getColumn(3).eachCell((cell, rowNum) => {
    if (rowNum >= 5) cell.protection = { locked: true };
  });

  // ── Hidden Metadata Sheet (for import mapping) ──
  const metaSheet = workbook.addWorksheet('__metadata', {
    state: 'veryHidden',
  });
  metaSheet.getCell('A1').value = 'EXAM_ID';
  metaSheet.getCell('B1').value = exam.id;
  metaSheet.getCell('A2').value = 'VERSION';
  metaSheet.getCell('B2').value = '1';

  // Question ID mapping: col index → examQuestionId
  metaSheet.getCell('A4').value = 'QUESTIONS';
  questions.forEach((q, i) => {
    metaSheet.getCell(5 + i, 1).value = i; // column offset from col 4
    metaSheet.getCell(5 + i, 2).value = q.examQuestionId;
    metaSheet.getCell(5 + i, 3).value = q.marks;
  });

  // Session ID mapping: row index → sessionId
  const sessionStartRow = 5 + questions.length + 2;
  metaSheet.getCell(sessionStartRow, 1).value = 'SESSIONS';
  allSorted.forEach((s, i) => {
    metaSheet.getCell(sessionStartRow + 1 + i, 1).value = i; // row offset from row 5
    metaSheet.getCell(sessionStartRow + 1 + i, 2).value = s.id;
    metaSheet.getCell(sessionStartRow + 1 + i, 3).value = s.status;
  });

  // Generate and download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const fileName = `${exam.title.replace(/[^a-zA-Z0-9\s-]/g, '').trim()}_marks_template.xlsx`;
  saveAs(blob, fileName);
}

function getExcelCol(colNum: number): string {
  let result = '';
  let num = colNum;
  while (num > 0) {
    const mod = (num - 1) % 26;
    result = String.fromCharCode(65 + mod) + result;
    num = Math.floor((num - 1) / 26);
  }
  return result;
}
