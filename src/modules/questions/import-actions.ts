'use server';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-utils';
import { createAuditLog } from '@/modules/audit/audit-queries';
import type { ActionResult } from '@/types/action-result';

type CsvQuestion = {
  title: string;
  type: string;
  difficulty: string;
  marks: string;
  subjectId: string;
  modelAnswer?: string;
  explanation?: string;
  description?: string;
  /** For MCQ: pipe-separated options, prefix correct with * e.g. "A|*B|C|D" */
  mcqOptions?: string;
};

type ImportResult = {
  total: number;
  created: number;
  errors: { row: number; title: string; error: string }[];
};

const VALID_TYPES = ['MCQ', 'SHORT_ANSWER', 'LONG_ANSWER'];
const VALID_DIFFICULTIES = ['EASY', 'MEDIUM', 'HARD'];

export async function importQuestionsFromCsvAction(
  csvRows: CsvQuestion[],
): Promise<ActionResult<ImportResult>> {
  const session = await requireRole('TEACHER', 'ADMIN');

  const result: ImportResult = {
    total: csvRows.length,
    created: 0,
    errors: [],
  };

  for (let i = 0; i < csvRows.length; i++) {
    const row = csvRows[i]!;
    const rowNum = i + 1;

    const validation = validateRow(row, rowNum);
    if (validation) {
      result.errors.push(validation);
      continue;
    }

    try {
      const question = await createQuestion(row, session.user.id);
      if (row.type.toUpperCase() === 'MCQ' && row.mcqOptions) {
        await createMcqOptions(question.id, row.mcqOptions);
      }
      result.created++;
    } catch (err) {
      result.errors.push({
        row: rowNum,
        title: row.title,
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  }

  createAuditLog(session.user.id, 'BULK_IMPORT_QUESTIONS', 'QUESTION', 'bulk', {
    total: result.total,
    created: result.created,
    errorCount: result.errors.length,
  }).catch(() => {});

  return { success: true, data: result };
}

// ---- helpers ----

function validateRow(
  row: CsvQuestion,
  rowNum: number,
): { row: number; title: string; error: string } | null {
  if (!row.title || !row.type || !row.difficulty || !row.marks || !row.subjectId) {
    return {
      row: rowNum,
      title: row.title ?? '',
      error: 'Missing required: title, type, difficulty, marks, subjectId',
    };
  }
  if (!VALID_TYPES.includes(row.type.toUpperCase())) {
    return { row: rowNum, title: row.title, error: `Invalid type: ${row.type}` };
  }
  if (!VALID_DIFFICULTIES.includes(row.difficulty.toUpperCase())) {
    return { row: rowNum, title: row.title, error: `Invalid difficulty: ${row.difficulty}` };
  }
  if (isNaN(Number(row.marks)) || Number(row.marks) <= 0) {
    return { row: rowNum, title: row.title, error: `Invalid marks: ${row.marks}` };
  }
  if (row.type.toUpperCase() === 'MCQ' && !row.mcqOptions) {
    return { row: rowNum, title: row.title, error: 'MCQ questions require mcqOptions' };
  }
  return null;
}

async function createQuestion(row: CsvQuestion, userId: string) {
  return prisma.question.create({
    data: {
      title: row.title.trim(),
      type: row.type.toUpperCase() as 'MCQ' | 'SHORT_ANSWER' | 'LONG_ANSWER',
      difficulty: row.difficulty.toUpperCase() as 'EASY' | 'MEDIUM' | 'HARD',
      marks: Number(row.marks),
      subjectId: row.subjectId,
      createdById: userId,
      modelAnswer: row.modelAnswer?.trim() || null,
      explanation: row.explanation?.trim() || null,
      description: row.description?.trim() || null,
    },
  });
}

async function createMcqOptions(questionId: string, optionsStr: string) {
  const labels = ['A', 'B', 'C', 'D', 'E', 'F'];
  const parts = optionsStr.split('|').map((s) => s.trim());

  const data = parts.map((part, idx) => {
    const isCorrect = part.startsWith('*');
    const text = isCorrect ? part.slice(1).trim() : part;
    return {
      questionId,
      label: labels[idx] ?? `${idx + 1}`,
      text,
      isCorrect,
      sortOrder: idx,
    };
  });

  await prisma.mcqOption.createMany({ data });
}
