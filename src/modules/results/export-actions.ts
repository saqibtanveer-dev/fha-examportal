'use server';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-utils';
import type { ActionResult } from '@/types/action-result';

type ExportRow = {
  studentName: string;
  email: string;
  examTitle: string;
  totalMarks: string;
  obtainedMarks: string;
  percentage: string;
  grade: string;
  isPassed: string;
  publishedAt: string;
};

type ExportResult = {
  headers: string[];
  rows: ExportRow[];
  csvString: string;
};

/**
 * Export all results for a given exam as CSV-ready data
 */
export async function exportExamResultsAction(
  examId: string,
): Promise<ActionResult<ExportResult>> {
  const session = await requireRole('ADMIN', 'TEACHER');

  // Verify teacher owns the exam
  if (session.user.role === 'TEACHER') {
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      select: { createdById: true },
    });
    if (!exam) return { success: false, error: 'Exam not found' };
    if (exam.createdById !== session.user.id) {
      return { success: false, error: 'You can only export results for your own exams' };
    }
  }

  const results = await prisma.examResult.findMany({
    where: { examId },
    include: {
      student: { select: { firstName: true, lastName: true, email: true } },
      exam: { select: { title: true } },
    },
    orderBy: [{ rank: 'asc' }, { percentage: 'desc' }],
  });

  if (results.length === 0) {
    return { success: false, error: 'No results found for this exam' };
  }

  const headers = [
    'Student Name',
    'Email',
    'Exam',
    'Total Marks',
    'Obtained Marks',
    'Percentage',
    'Grade',
    'Passed',
    'Published At',
  ];

  const rows: ExportRow[] = results.map((r) => ({
    studentName: `${r.student.firstName} ${r.student.lastName}`,
    email: r.student.email,
    examTitle: r.exam.title,
    totalMarks: String(r.totalMarks),
    obtainedMarks: String(r.obtainedMarks),
    percentage: `${Number(r.percentage).toFixed(1)}%`,
    grade: r.grade ?? 'N/A',
    isPassed: r.isPassed ? 'Yes' : 'No',
    publishedAt: r.publishedAt?.toISOString().slice(0, 10) ?? 'Unpublished',
  }));

  const csvString = buildCsv(headers, rows);

  return { success: true, data: { headers, rows, csvString } };
}

/**
 * Export all results for a specific student
 */
export async function exportStudentResultsAction(
  studentId: string,
): Promise<ActionResult<ExportResult>> {
  const session = await requireRole('ADMIN', 'TEACHER', 'STUDENT');

  // Students can only export their own
  if (session.user.role === 'STUDENT' && session.user.id !== studentId) {
    return { success: false, error: 'Access denied' };
  }

  const results = await prisma.examResult.findMany({
    where: { studentId },
    include: {
      student: { select: { firstName: true, lastName: true, email: true } },
      exam: { select: { title: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (results.length === 0) {
    return { success: false, error: 'No results found for this student' };
  }

  const headers = [
    'Student Name',
    'Email',
    'Exam',
    'Total Marks',
    'Obtained Marks',
    'Percentage',
    'Grade',
    'Passed',
    'Published At',
  ];

  const rows: ExportRow[] = results.map((r) => ({
    studentName: `${r.student.firstName} ${r.student.lastName}`,
    email: r.student.email,
    examTitle: r.exam.title,
    totalMarks: String(r.totalMarks),
    obtainedMarks: String(r.obtainedMarks),
    percentage: `${Number(r.percentage).toFixed(1)}%`,
    grade: r.grade ?? 'N/A',
    isPassed: r.isPassed ? 'Yes' : 'No',
    publishedAt: r.publishedAt?.toISOString().slice(0, 10) ?? 'Unpublished',
  }));

  const csvString = buildCsv(headers, rows);

  return { success: true, data: { headers, rows, csvString } };
}

/* ─── CSV Builder ─── */

function buildCsv(headers: string[], rows: ExportRow[]): string {
  const escape = (val: string) => `"${val.replace(/"/g, '""')}"`;
  const headerLine = headers.map(escape).join(',');
  const dataLines = rows.map((r) =>
    [
      r.studentName,
      r.email,
      r.examTitle,
      r.totalMarks,
      r.obtainedMarks,
      r.percentage,
      r.grade,
      r.isPassed,
      r.publishedAt,
    ]
      .map(escape)
      .join(','),
  );
  return [headerLine, ...dataLines].join('\n');
}
