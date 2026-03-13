'use client';

import { PrintLayout } from './print-layout';
import type { DmcData, GroupScore } from '../../types/report-types';
import { GROUP_SCORE_STATUS_LABELS } from '../../engine/report-constants';

type Props = { dmc: DmcData };

export function DmcPrintTemplate({ dmc }: Props) {
  const { school, resultTerm, className, sectionName, academicSession, student, subjects, summary, attendance, classTeacherRemarks, principalRemarks, dateOfIssue } = dmc;

  return (
    <PrintLayout school={school} title="Detailed Marks Certificate" showSignatures>
      {/* Meta Info Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1 text-xs sm:text-sm mb-4">
        <div className="flex gap-2">
          <span className="font-semibold w-36 shrink-0">Academic Session:</span>
          <span>{academicSession}</span>
        </div>
        <div className="flex gap-2">
          <span className="font-semibold w-36 shrink-0">Class / Section:</span>
          <span>{className} — {sectionName}</span>
        </div>
        <div className="flex gap-2">
          <span className="font-semibold w-36 shrink-0">Exam:</span>
          <span>{resultTerm.name}</span>
        </div>
        <div className="flex gap-2">
          <span className="font-semibold w-36 shrink-0">Date of Issue:</span>
          <span>{dateOfIssue}</span>
        </div>
      </div>

      {/* Student Info Box */}
      <div className="dmc-student-info border border-black p-2 sm:p-3 mb-4 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1 text-xs sm:text-sm">
        <div className="flex gap-2">
          <span className="font-semibold w-32 shrink-0">Student Name:</span>
          <span className="font-bold">{student.name}</span>
        </div>
        <div className="flex gap-2">
          <span className="font-semibold w-32 shrink-0">Roll No:</span>
          <span>{student.rollNumber}</span>
        </div>
        {student.fatherName && (
          <div className="flex gap-2">
            <span className="font-semibold w-32 shrink-0">Father's Name:</span>
            <span>{student.fatherName}</span>
          </div>
        )}
        <div className="flex gap-2">
          <span className="font-semibold w-32 shrink-0">Reg. No:</span>
          <span>{student.registrationNo}</span>
        </div>
        {student.dateOfBirth && (
          <div className="flex gap-2">
            <span className="font-semibold w-32 shrink-0">Date of Birth:</span>
            <span>{student.dateOfBirth}</span>
          </div>
        )}
        {student.gender && (
          <div className="flex gap-2">
            <span className="font-semibold w-32 shrink-0">Gender:</span>
            <span className="capitalize">{student.gender.toLowerCase()}</span>
          </div>
        )}
      </div>

      {/* Marks Table */}
      <div className="overflow-x-auto -mx-2 px-2 sm:mx-0 sm:px-0">
      <table className="w-full border-collapse text-xs sm:text-sm print-table mb-4">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-black px-2 py-1.5 text-left w-6">#</th>
            <th className="border border-black px-2 py-1.5 text-left">Subject</th>
            {resultTerm.examGroups.map((g) => (
              <th key={g.id} className="border border-black px-2 py-1.5 text-center whitespace-nowrap">
                {g.name}
                <span className="block text-xs font-normal">({g.weight}%)</span>
              </th>
            ))}
            <th className="border border-black px-2 py-1.5 text-center">Total</th>
            <th className="border border-black px-2 py-1.5 text-center">%</th>
            <th className="border border-black px-2 py-1.5 text-center">Grade</th>
            <th className="border border-black px-2 py-1.5 text-center">Result</th>
          </tr>
        </thead>
        <tbody>
          {subjects.map((subj, i) => (
            <tr key={subj.subjectCode} className={i % 2 === 0 ? '' : 'bg-gray-50'}>
              <td className="border border-black px-2 py-1 text-center">{i + 1}</td>
              <td className="border border-black px-2 py-1">
                {subj.subjectName}
                <span className="ml-1 text-xs text-gray-500">({subj.subjectCode})</span>
              </td>
              {resultTerm.examGroups.map((g) => {
                const score = subj.groupScores.find((gs) => gs.groupId === g.id);
                return (
                  <td key={g.id} className="border border-black px-2 py-1 text-center">
                    {score ? renderGroupScore(score) : '—'}
                  </td>
                );
              })}
              <td className="border border-black px-2 py-1 text-center font-medium">
                {subj.consolidatedMarks.toFixed(1)}/{subj.maxConsolidatedMarks.toFixed(1)}
              </td>
              <td className="border border-black px-2 py-1 text-center">
                {subj.percentage.toFixed(1)}%
              </td>
              <td className="border border-black px-2 py-1 text-center font-semibold">
                {subj.grade ?? '—'}
              </td>
              <td className={`border border-black px-2 py-1 text-center font-semibold ${subj.isPassed ? 'text-green-700' : 'text-red-700'}`}>
                {subj.isPassed ? 'P' : 'F'}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-gray-100 font-bold">
            <td colSpan={2} className="border border-black px-2 py-1.5 text-right">Grand Total</td>
            {resultTerm.examGroups.map((g) => (
              <td key={g.id} className="border border-black px-2 py-1.5" />
            ))}
            <td className="border border-black px-2 py-1.5 text-center">
              {summary.grandTotalObtained.toFixed(1)}/{summary.grandTotalMax.toFixed(1)}
            </td>
            <td className="border border-black px-2 py-1.5 text-center">
              {summary.overallPercentage.toFixed(1)}%
            </td>
            <td className="border border-black px-2 py-1.5 text-center">
              {summary.overallGrade ?? '—'}
            </td>
            <td className={`border border-black px-2 py-1.5 text-center ${summary.isOverallPassed ? 'text-green-700' : 'text-red-700'}`}>
              {summary.isOverallPassed ? 'PASS' : 'FAIL'}
            </td>
          </tr>
        </tfoot>
      </table>
      </div>

      {/* Summary Row */}
      <div className="dmc-summary-section grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm mb-4">
        <div className="space-y-1">
          <div className="flex gap-2">
            <span className="font-semibold w-32 sm:w-40 shrink-0">Subjects Passed:</span>
            <span>{summary.passedSubjects} / {summary.totalSubjects}</span>
          </div>
          {summary.rankInSection && (
            <div className="flex gap-2">
              <span className="font-semibold w-32 sm:w-40 shrink-0">Rank in Section:</span>
              <span>{summary.rankInSection} / {summary.totalStudentsInSection}</span>
            </div>
          )}
          {summary.rankInClass && (
            <div className="flex gap-2">
              <span className="font-semibold w-32 sm:w-40 shrink-0">Rank in Class:</span>
              <span>{summary.rankInClass} / {summary.totalStudentsInClass}</span>
            </div>
          )}
        </div>
        {attendance && (
          <div className="space-y-1">
            <div className="flex gap-2">
              <span className="font-semibold w-32 sm:w-40 shrink-0">Attendance:</span>
              <span>
                {attendance.presentDays}/{attendance.totalDays} days ({attendance.percentage.toFixed(1)}%)
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Remarks */}
      {(classTeacherRemarks || principalRemarks) && (
        <div className="dmc-summary-section grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm mb-4 border-t pt-3">
          {classTeacherRemarks && (
            <div>
              <span className="font-semibold block mb-1">Class Teacher Remarks:</span>
              <p className="text-gray-700">{classTeacherRemarks}</p>
            </div>
          )}
          {principalRemarks && (
            <div>
              <span className="font-semibold block mb-1">Principal Remarks:</span>
              <p className="text-gray-700">{principalRemarks}</p>
            </div>
          )}
        </div>
      )}
    </PrintLayout>
  );
}

function renderGroupScore(score: GroupScore): string {
  if (score.status !== 'COMPUTED') {
    return GROUP_SCORE_STATUS_LABELS[score.status] ?? score.status;
  }
  if (score.obtained === null || score.total === null) return '—';
  return `${score.obtained.toFixed(1)}/${score.total}`;
}
